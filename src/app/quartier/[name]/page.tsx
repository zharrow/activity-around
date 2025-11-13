import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { generateMetadata as genMeta, baseUrl } from '@/lib/seo'
import ActivityCardModern from '@/components/ActivityCardModern'
import Breadcrumb from '@/components/Breadcrumb'

interface PageProps {
  params: {
    name: string
  }
}

// Force dynamic rendering to avoid DB access at build time
export const dynamic = 'force-dynamic'

// Liste des quartiers principaux de Toulouse
const neighborhoods = {
  'capitole': 'Capitole',
  'carmes': 'Carmes',
  'saint-cyprien': 'Saint-Cyprien',
  'compans-caffarelli': 'Compans-Caffarelli',
  'borderouge': 'Borderouge',
  'rangueil': 'Rangueil',
  'minimes': 'Minimes',
  'arnaud-bernard': 'Arnaud-Bernard',
  'jolimont': 'Jolimont',
  'empalot': 'Empalot',
}

export async function generateStaticParams() {
  return Object.keys(neighborhoods).map((name) => ({
    name,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const neighborhoodName = neighborhoods[params.name as keyof typeof neighborhoods]

  if (!neighborhoodName) {
    return {}
  }

  return genMeta({
    title: `Activités au ${neighborhoodName} - Toulouse`,
    description: `Découvrez toutes les activités sportives et intellectuelles dans le quartier ${neighborhoodName} à Toulouse. Clubs, associations et loisirs près de chez vous.`,
    keywords: [
      `activités ${neighborhoodName}`,
      `sport ${neighborhoodName} Toulouse`,
      `club ${neighborhoodName}`,
      `loisirs ${neighborhoodName}`,
      `association ${neighborhoodName}`,
    ],
    url: `${baseUrl}/quartier/${params.name}`,
  })
}

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
  neighborhood: string | null
}

export default async function NeighborhoodPage({ params }: PageProps) {
  const neighborhoodName = neighborhoods[params.name as keyof typeof neighborhoods]

  if (!neighborhoodName) {
    notFound()
  }

  // Recherche des activités dans ce quartier
  const activities = await prisma.activity.findMany({
    where: {
      neighborhood: neighborhoodName,
    },
    orderBy: {
      name: 'asc',
    },
  })

  // Grouper par catégorie
  const sportActivities = activities.filter(a => a.category === 'sport')
  const intellectualActivities = activities.filter(a => a.category === 'intellectual')

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Activités au ${neighborhoodName}`,
    description: `Trouvez toutes les activités dans le quartier ${neighborhoodName} à Toulouse`,
    url: `${baseUrl}/quartier/${params.name}`,
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
          <Breadcrumb items={[
            { name: 'Quartiers', url: '/#quartiers' },
            { name: neighborhoodName }
          ]} />

          <header className="page-header">
            <h1>Activités au {neighborhoodName}</h1>
            <p className="page-header__subtitle">
              Découvrez {activities.length} activité{activities.length > 1 ? 's' : ''} dans le quartier {neighborhoodName} à Toulouse
            </p>
          </header>

          {activities.length === 0 ? (
            <div className="empty-state">
              <p>Aucune activité répertoriée dans ce quartier pour le moment.</p>
              <Link href="/" className="button button--primary">
                Voir toutes les activités
              </Link>
            </div>
          ) : (
            <>
              {sportActivities.length > 0 && (
                <section className="activities-section">
                  <h2 className="activities-section__title">
                    Activités sportives ({sportActivities.length})
                  </h2>
                  <div className="activities-grid">
                    {sportActivities.map((activity, index) => (
                      <ActivityCardModern
                        key={activity.id}
                        activity={activity as Activity}
                        index={index}
                      />
                    ))}
                  </div>
                </section>
              )}

              {intellectualActivities.length > 0 && (
                <section className="activities-section">
                  <h2 className="activities-section__title">
                    Activités intellectuelles ({intellectualActivities.length})
                  </h2>
                  <div className="activities-grid">
                    {intellectualActivities.map((activity, index) => (
                      <ActivityCardModern
                        key={activity.id}
                        activity={activity as Activity}
                        index={index}
                      />
                    ))}
                  </div>
                </section>
              )}

              <section className="seo-content">
                <h2>Le quartier {neighborhoodName} à Toulouse</h2>
                <p>
                  Le quartier {neighborhoodName} est un des quartiers dynamiques de Toulouse.
                  Avec {activities.length} activité{activities.length > 1 ? 's' : ''} répertoriée{activities.length > 1 ? 's' : ''},
                  vous trouverez de nombreuses opportunités pour pratiquer un sport ou une activité
                  intellectuelle près de chez vous.
                </p>
                <p>
                  Que vous habitiez ou travailliez au {neighborhoodName}, découvrez les clubs et
                  associations qui vous accueilleront pour votre pratique sportive ou intellectuelle.
                </p>
              </section>

              <section className="neighborhood-nav">
                <h2>Autres quartiers de Toulouse</h2>
                <nav className="neighborhood-nav__grid">
                  {Object.entries(neighborhoods)
                    .filter(([slug]) => slug !== params.name)
                    .map(([slug, name]) => (
                      <Link
                        key={slug}
                        href={`/quartier/${slug}`}
                        className="neighborhood-nav__item"
                      >
                        {name}
                      </Link>
                    ))}
                </nav>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  )
}
