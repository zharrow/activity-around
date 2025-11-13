import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { generateMetadata as genMeta, generateSlug, baseUrl } from '@/lib/seo'
import ActivityCardModern from '@/components/ActivityCardModern'

// Force dynamic rendering to avoid DB access at build time
export const dynamic = 'force-dynamic'

export const metadata: Metadata = genMeta({
  title: 'Activités Sportives à Toulouse - Tous les Clubs et Associations',
  description: 'Découvrez tous les clubs sportifs et associations à Toulouse : football, basketball, tennis, arts martiaux, yoga, danse et plus encore. Trouvez votre activité sportive idéale.',
  keywords: [
    'sport Toulouse',
    'club sportif Toulouse',
    'activités sportives Toulouse',
    'football Toulouse',
    'basketball Toulouse',
    'tennis Toulouse',
    'arts martiaux Toulouse',
    'yoga Toulouse',
    'danse Toulouse',
  ],
  url: `${baseUrl}/sport`,
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

export default async function SportPage() {
  const activities = await prisma.activity.findMany({
    where: {
      category: 'sport',
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
    name: 'Activités Sportives à Toulouse',
    description: 'Trouvez tous les clubs sportifs et associations à Toulouse',
    url: `${baseUrl}/sport`,
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
            <span aria-current="page">Sport</span>
          </nav>

          <header className="page-header">
            <h1>Activités Sportives à Toulouse</h1>
            <p className="page-header__subtitle">
              Découvrez {activities.length} clubs sportifs et associations à Toulouse.
              Du football au yoga, trouvez l&apos;activité sportive qui vous correspond.
            </p>
          </header>

          <section className="category-nav">
            <h2 className="sr-only">Catégories sportives</h2>
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
            <h2>Pourquoi pratiquer une activité sportive à Toulouse ?</h2>
            <p>
              Toulouse, la Ville Rose, offre un cadre exceptionnel pour la pratique sportive.
              Avec plus de {activities.length} clubs et associations, vous trouverez forcément
              l&apos;activité qui correspond à vos envies et votre niveau.
            </p>
            <p>
              Que vous cherchiez un sport d&apos;équipe comme le football ou le basketball,
              une discipline individuelle comme le tennis ou la natation, ou une activité
              bien-être comme le yoga ou la danse, Toulouse dispose d&apos;infrastructures
              de qualité et de professionnels passionnés.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
