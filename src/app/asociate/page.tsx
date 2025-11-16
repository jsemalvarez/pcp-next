import { ContactForm } from "@/presentation/components/common/ContactForm";
import { Ecosystem } from "@/presentation/components/Partner/Ecosystem";
import { HeroPartner } from "@/presentation/components/Partner/HeroPartner";
import { JoinUs } from "@/presentation/components/Partner/JoinUs";
import { PremiumServices } from "@/presentation/components/Partner/PremiumServices";
import { Pricing } from "@/presentation/components/Partner/Pricing";

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
