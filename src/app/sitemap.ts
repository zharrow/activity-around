import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { cities } from '@/data/cities'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://activityaround.vercel.app'

  // Get all activities from database
  const activities = await prisma.activity.findMany({
    select: {
      id: true,
      name: true,
      updatedAt: true,
    },
  })

  // Generate activity URLs
  const activityUrls = activities.map((activity) => ({
    url: `${baseUrl}/activity/${activity.id}/${generateSlug(activity.name)}`,
    lastModified: activity.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Category pages
  const categoryPages = [
    {
      url: `${baseUrl}/sport`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/intellectuel`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]

  // City pages (20 French cities)
  const cityPages = cities.map((city) => ({
    url: `${baseUrl}/ville/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Blog pages
  const blogPages = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/top-10-clubs-echecs-toulouse`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/guide-debutant-arts-martiaux-toulouse`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/meilleurs-quartiers-sport-toulouse`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/activites-intellectuelles-toulouse`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // Other static pages
  const otherPages = [
    {
      url: `${baseUrl}/activites`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Homepage
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ]

  return [
    ...staticPages,
    ...otherPages,
    ...categoryPages,
    ...cityPages,
    ...blogPages,
    ...activityUrls,
  ]
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}
