import type { Metadata } from "next";
import { Nunito, Baloo_2 } from "next/font/google";
import "./globals.css";


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
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Paseos con Peques",
    description:"Descubrí los mejores lugares, eventos y paseos para disfrutar con niños, chicos o peques. Mapa interactivo y agenda cultural actualizada.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${baloo2.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
