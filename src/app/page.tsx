import { getPlacesFactory } from "@/domain/factories/getPlacesFactory";
import { PublicNavbar } from "@/presentation/components/Navbar/PublicNavbar";
import { HeroSection } from "@/presentation/components/Hero/HeroSection";
import { PlacesMapSection } from "@/presentation/components/Places/PlacesMapSection";
import { CalendarSection } from "@/presentation/components/Calendar/CalendarSection";
import { PlacesSearchSection } from "@/presentation/components/Places/PlacesSearchSection";
import { getEventsFactory } from "@/domain/factories/getEventsFactory";
import { FloatingWhatsAppButton } from "@/presentation/components/common/buttons";
import { Footer } from "@/presentation/components/Footer/Footer";


export default async function Home() {
  const getPlaces = getPlacesFactory();
  const getEvents = getEventsFactory();

  // const places = await getPlaces.execute();
  const [places, events] = await Promise.all([
    getPlaces.execute(),
    getEvents.execute()
  ])

  return (
    <>
      <PublicNavbar />
      <main className="min-h-[100vh] bg-gradient-to-bl from-primary via-secondary to-primary text-indigo-100">
        <HeroSection />
        <PlacesMapSection places={places}/>
        <CalendarSection 
          events={events}
          places={places}
        />
        <PlacesSearchSection places={places} />
        <FloatingWhatsAppButton />
      </main>
      <Footer />
    </>
  );
}