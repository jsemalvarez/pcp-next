import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Paseos con Peques',
    short_name: 'PcP',
    description: 'Descubrí paseos, eventos y lugares para disfrutar con los peques en Mar del Plata.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#353865',
    theme_color: '#353865',
    categories: ['lifestyle', 'travel', 'kids'],
    icons: [
      {
        src: '/icons/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/images/screenshot_home.webp',
        sizes: '450x1000',
        type: 'image/webp',
        form_factor: 'narrow',
        label: 'Inicio de Paseos con Peques',
      },
      {
        src: '/images/screenshot_calendar.webp',
        sizes: '450x1000',
        type: 'image/webp',
        form_factor: 'narrow',
        label: 'Calendario de Eventos',
      },
    ],
  }
}
