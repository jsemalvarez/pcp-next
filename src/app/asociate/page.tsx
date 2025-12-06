import { Metadata } from "next";

import { ContactForm } from "@/presentation/components/common/ContactForm";
import { Ecosystem } from "@/presentation/components/Partner/Ecosystem";
import { HeroPartner } from "@/presentation/components/Partner/HeroPartner";
import { JoinUs } from "@/presentation/components/Partner/JoinUs";
import { PremiumServices } from "@/presentation/components/Partner/PremiumServices";
import { Pricing } from "@/presentation/components/Partner/Pricing";

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

export default function JoinUsPage() {
  return (
    <main className="flex flex-col w-full">
      <HeroPartner />
      <JoinUs />
      <Ecosystem />
      <Pricing />
      <PremiumServices />
      <ContactForm />
    </main>
  );
}
