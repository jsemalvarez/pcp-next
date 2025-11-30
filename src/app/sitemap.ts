import { MetadataRoute } from 'next' 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.paseosconpeques.com.ar'

  // 1. Tus páginas estáticas (Las que existen "físicamente" como archivos)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl, // Tu home
      lastModified: new Date(),
      changeFrequency: 'weekly', // Le dices a Google que el contenido cambia seguido (por los eventos)
      priority: 1, // La home siempre tiene la prioridad más alta
    },
    {
      url: `${baseUrl}/asociate`, // Tu home
      lastModified: new Date(),
      changeFrequency: 'monthly', // Le dices a Google que el contenido cambia seguido (por los eventos)
       priority: 0.8, 
    },
    {
      url: `${baseUrl}/feriainfinita`, // Tu home
      lastModified: new Date(),
      changeFrequency: 'monthly', // Le dices a Google que el contenido cambia seguido (por los eventos)
       priority: 0.5, 
    },
  ]
  return staticPages
}