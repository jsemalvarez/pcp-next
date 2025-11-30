import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // Aplica a todos los robots (Google, Bing, etc.)
      allow: '/',     // Permite rastrear todo el sitio
    },
    // Es muy importante indicar dónde estará el sitemap
    sitemap: 'https://www.paseosconpeques.com.ar/sitemap.xml',
  }
}