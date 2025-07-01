import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://quizito.com'; // Update with your actual domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'], // Add any routes you want to block
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
} 