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
  title: "PcP - Paseos con Peques",
  description: "Paseos con Peques es un espacio donde podes encuentrar lugares y actividades para disfrutar con los peques en Mar del Plata.",
  icons: {
    icon: "/favicon.svg",
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
