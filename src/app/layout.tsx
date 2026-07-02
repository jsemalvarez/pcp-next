import type { Metadata, Viewport } from "next";
import { Nunito, Baloo_2 } from "next/font/google";
import "./globals.css";
import BottomNav from "@/presentation/components/BottomNav";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const baloo2 = Baloo_2({
  variable: "--font-baloo2",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Paseos con Peques | Guía de actividades en Mar del Plata',
  description: 'Descubrí los mejores lugares, eventos y paseos para disfrutar con niños, chicos o peques. Mapa interactivo y agenda cultural actualizada.',
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Paseos con Peques",
    description: "Descubrí los mejores lugares, eventos y paseos para disfrutar con niños, chicos o peques. Mapa interactivo y agenda cultural actualizada.",
    url: "https://paseosconpeques.com.ar/",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "https://res.cloudinary.com/dwhdla1b4/image/upload/w_300,q_auto,f_auto/v1744900287/pcp-images/logo_pcp_mppj0w.webp",
        width: 300,
        height: 300,
        alt: "Paseos con Peques",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f97316",
};

import { FavoritesProvider } from "@/presentation/contexts/FavoritesContext";
import { PWAInstallPrompt } from "@/presentation/components/PWAInstallPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${baloo2.variable} antialiased text-gray-900`}
      >
        <FavoritesProvider>
          <main className="min-h-screen pt-safe">
            {children}
          </main>
          <BottomNav />
          <PWAInstallPrompt />
        </FavoritesProvider>
      </body>
    </html>
  );
}
