import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { generateMetadata as genMeta, generateSlug, baseUrl } from '@/lib/seo'
import ActivityCardModern from '@/components/ActivityCardModern'

// Force dynamic rendering to avoid DB access at build time
export const dynamic = 'force-dynamic'

export const metadata: Metadata = genMeta({
  title: 'Activités Intellectuelles à Toulouse - Clubs et Associations',
  description: 'Découvrez tous les clubs et associations d\'activités intellectuelles à Toulouse : échecs, jeux de société, lecture, débats, langues et plus encore. Stimulez votre esprit.',
  keywords: [
    'activités intellectuelles Toulouse',
    'club échecs Toulouse',
    'jeux de société Toulouse',
    'club lecture Toulouse',
    'cours langues Toulouse',
    'débats Toulouse',
    'club bridge Toulouse',
  ],
  url: `${baseUrl}/intellectuel`,
})

interface Activity {
  id: number
  name: string
  category: string
  subcategory: string | null
  address: string
  phone: string | null
  website: string | null
  latitude: number | null
  longitude: number | null
}

export default async function IntellectuelPage() {
  const activities = await prisma.activity.findMany({
    where: {
      category: 'intellectual',
    },
    orderBy: {
      name: 'asc',
    },
  })

  // Group activities by subcategory
  const groupedActivities = activities.reduce((acc, activity) => {
    const subcat = activity.subcategory || 'Autres'
    if (!acc[subcat]) {
      acc[subcat] = []
    }
    acc[subcat].push(activity)
    return acc
  }, {} as Record<string, typeof activities>)

  const subcategories = Object.keys(groupedActivities).sort()

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Activités Intellectuelles à Toulouse',
    description: 'Trouvez tous les clubs et associations d\'activités intellectuelles à Toulouse',
    url: `${baseUrl}/intellectuel`,
    numberOfItems: activities.length,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <main className="main">
        <div className="container">
          <nav className="breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Intellectuel</span>
          </nav>

          <header className="page-header">
            <h1>Activités Intellectuelles à Toulouse</h1>
            <p className="page-header__subtitle">
              Découvrez {activities.length} clubs et associations d&apos;activités intellectuelles
              à Toulouse. Échecs, jeux de société, lecture et bien plus pour stimuler votre esprit.
            </p>
          </header>

          <section className="category-nav">
            <h2 className="sr-only">Catégories d&apos;activités intellectuelles</h2>
            <div className="category-nav__grid">
              {subcategories.map((subcat) => (
                <Link
                  key={subcat}
                  href={`#${generateSlug(subcat)}`}
                  className="category-nav__item"
                >
                  {subcat}
                  <span className="category-nav__count">
                    {groupedActivities[subcat].length}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {subcategories.map((subcat) => (
            <section key={subcat} id={generateSlug(subcat)} className="activities-section">
              <h2 className="activities-section__title">{subcat}</h2>
              <div className="activities-grid">
                {groupedActivities[subcat].map((activity, index) => (
                  <ActivityCardModern
                    key={activity.id}
                    activity={activity as Activity}
                    index={index}
                  />
                ))}
              </div>
            </section>
          ))}

          <section className="seo-content">
            <h2>Les activités intellectuelles à Toulouse</h2>
            <p>
              Toulouse, ville universitaire et culturelle, offre un environnement riche pour
              les activités intellectuelles. Avec {activities.length} clubs et associations,
              vous trouverez de nombreuses opportunités pour développer vos capacités cognitives
              et rencontrer des passionnés.
            </p>
            <p>
              Que vous soyez attiré par les échecs, le bridge, les jeux de stratégie, la lecture,
              les débats philosophiques ou l&apos;apprentissage de langues, Toulouse dispose
              d&apos;une communauté active et accueillante pour chaque discipline.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
