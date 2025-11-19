import { GridFotosHorizontal } from "@/presentation/components/Partner/GridFotosHorizontal";
import { LocationPartner } from "@/presentation/components/Partner/LocationPartner";

export default function DemoPartnerPage() {
  
  const partner = {
    name: "Ludoteca PcP",
    category: "Espacio de juego y café familiar",
    coverImage:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=60",
    description:
      "Ludoteca PcP es un espacio diseñado para que las familias puedan disfrutar de un momento tranquilo, divertido y seguro. Contamos con áreas de juego por edades, rincón de lectura, zona blanda para más pequeños y un café con opciones saludables. Nuestro objetivo es acompañar a las familias en sus momentos de disfrute, aprendizaje y conexión.",
  };

  return (
    <main className="flex flex-col">
        {/* HERO */}
        <section className="w-full h-screen max-h-[1200px] flex flex-col">
          <div className="relative w-full h-4/10 bg-secondary">
            <img
                src={partner.coverImage}
                alt={partner.name}
                className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute bottom-5 left-5 text-white drop-shadow-lg">
                <h1 className="text-3xl md:text-6xl font-bold">{partner.name}</h1>
                <p className="text-xl">{partner.category}</p>
            </div>
          </div>
          {/* DESCRIPTION */}
          <div className="bg-partner3 h-6/10 flex items-center">
            <div className="px-4 max-w-5xl mx-auto py-12">
                <p 
                  className="text-xl md:text-3xl text-center font-light tracking-widest leading-tight"
                >{partner.description}</p>
            </div>
          </div>
        </section>

      <GridFotosHorizontal />
      <div className="bg-partner1 flex items-center">
        <div className="px-4 max-w-5xl mx-auto py-24">
            <p 
              className="text-xl md:text-2xl font-light tracking-widest leading-tight pb-4"
            >{partner.description}</p>
            <p 
              className="text-xl md:text-2xl font-light tracking-widest leading-tight"
            >{partner.description}</p>
        </div>
      </div>
      <LocationPartner />

    </main>
  );
}
