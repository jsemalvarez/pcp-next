import { getPlacesFactory } from "@/domain/factories/getPlacesFactory";
import { HeroSection } from "@/presentation/components/Hero/HeroSection";
import { PublicNavbar } from "@/presentation/components/Navbar/PublicNavbar";
import { PlacesMapSection } from "@/presentation/components/Places/PlacesMapSection";
import { PlacesSearchSection } from "@/presentation/components/Places/PlacesSearchSection";


export default async function Home() {
  const getPlaces = getPlacesFactory();

  const places = await getPlaces.execute();

  return (
    <>
      <PublicNavbar />
      <main className="min-h-[100vh] bg-gradient-to-bl from-primary via-primary-light to-primary text-indigo-100">
        <HeroSection />
        <PlacesMapSection places={places}/>
        <PlacesSearchSection places={places} />
      </main>
    </>
  );
}