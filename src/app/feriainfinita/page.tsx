import { LocationPartner } from "@/presentation/components/Partner/LocationPartner";
import Image from "next/image";

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dwhdla1b4/image/upload/w_600,q_auto,f_auto/v1749595725/pcp-images/feriainfinita/';

const partner = {
    name: "Feria Infinita",
    category: "Tienda de Ropa - Moda circular",
    coverImage:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=60",
    mision:"La ropa es mucho más que ropa y cómo te vestís importa. En Feria Infinita creemos en una moda más consciente, accesible y circular. Queremos que cada persona pueda renovar su estilo disfrutando de un espacio donde la moda y los buenos precios conviven en armonía. Por eso seleccionamos cada prenda con dedicación, dándole una segunda vida y asegurando siempre calidad.",
    description:'',
    services: [
        {
            title: "Prendas para renovarte",
            text: "Contamos con una gran variedad de prendas y calzado femenino, seleccionados para que encuentres opciones actuales y de calidad. También tenemos secciones de ropa y calzado infantil y masculino, ideales para renovar el guardarropa de toda la familia."
        },
        {
            title: "Experiencia de compra simple y agradable",
            text: "Podés visitar la feria de martes a viernes de 8 a 18 h, y los sábados de 10 a 18 h. Te esperamos con un espacio cómodo, ordenado y pensado para que disfrutes la experiencia de elegir con tranquilidad."
        },
        {
            title: "Traé tus prendas",
            text: "Recibimos prendas a consignación. Es importante que estén impecables, actuales y de estación para poder darles una segunda vida y mantener la calidad que caracteriza a la feria. Para más información, comunicate por WhatsApp."
        }
    ],
    galery:[
        {
            id:'DemoPartnerPage-1',
            alt:'Demo Partner Page img 1',
            path:`${CLOUDINARY_BASE_URL}ropa-2_uerzwj.webp`,
            style:'relative h-48 overflow-hidden'
        },
        {
            id:'DemoPartnerPage-2',
            alt:'Demo Partner Page img 2',
            path:`${CLOUDINARY_BASE_URL}ropa-3_h7f0cb.webp`,
            style:'relative h-48 overflow-hidden'
        },
        {
            id:'DemoPartnerPage-3',
            alt:'Demo Partner Page img 3',
            path:`${CLOUDINARY_BASE_URL}profile_feria_infinita_abgru6.webp`,
            style:'relative col-span-2 row-span-2 md:col-span-3 lg:col-span-2 h-96 overflow-hidden'
        },
            {
            id:'DemoPartnerPage-4',
            alt:'Demo Partner Page img 4',
            path:`${CLOUDINARY_BASE_URL}zapatos_syc48r.webp`,
            style:'relative col-span-2 h-48 overflow-hidden'
        },
            {
            id:'DemoPartnerPage-5',
            alt:'Demo Partner Page img 5',
            path:`${CLOUDINARY_BASE_URL}ropa-1_dejsk4.webp`,
            style:'relative h-48 overflow-hidden'
        },
        {
            id:'DemoPartnerPage-6',
            alt:'Demo Partner Page img 6',
            path:`${CLOUDINARY_BASE_URL}perchero_clmxp7.webp`,
            style:'relative md:col-span-2 h-48 overflow-hidden'
        },
        {
            id:'DemoPartnerPage-7',
            alt:'Demo Partner Page img 7',
            path:`${CLOUDINARY_BASE_URL}ropa-4_qsuy9j.webp`,
            style:'relative col-span-2 lg:col-span-1 h-48 overflow-hidden'
        },
        {
            id:'DemoPartnerPage-8',
            alt:'Demo Partner Page img 8',
            path:`${CLOUDINARY_BASE_URL}entrada_ierb76.webp`,
            style:'relative col-span-2 sm:col-span-4 md:col-span-5 lg:col-span-2 h-48 overflow-hidden'
        },
    ],
    location:{
        address:'Santiago del Estero 4301',
        whatsApp:'02234268160',
        position:{ lat:-38.020801042679714, lng:-57.56286621218633 }
    }
};

export default function FeriaInfinitaPage() {

  return (
    <main className="flex flex-col">
      {/* HERO */}
      <section className="w-full h-screen max-h-[1200px] flex flex-col">
        <div className="relative w-full h-4/10 bg-secondary">
          <Image
              src={partner.coverImage}
              alt={partner.name}
              className="w-full h-full object-cover opacity-70"
              fill
          />
          <div className="absolute bottom-5 left-5 text-white drop-shadow-lg">
              <h1 className="text-3xl md:text-6xl font-bold">{partner.name}</h1>
              <p className="text-xl">{partner.category}</p>
          </div>
        </div>
        {/* MISION */}
        <div className="bg-partner3 h-6/10 flex items-center">
          <div className="px-4 max-w-5xl mx-auto py-12">
              <p 
                className="text-xl md:text-3xl text-center font-light tracking-widest leading-tight"
              >{partner.mision}</p>
          </div>
        </div>
      </section>

      {/* GALERY */}
      <section className="w-full bg-primary">
        <div
          className="
              grid 
              grid-rows-7 sm:grid-rows-4 lg:grid-rows-2
              grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7
          "
        >
          {
            partner.galery.map(img=>(
              <div 
                key={img.id}
                className={img.style}
              >
                  <Image
                      src={img.path}
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-300 opacity-70 hover:opacity-100 hover:scale-110 hover:brightness-110"
                      fill
                  />
              </div>
            ))
          }
        </div>
      </section>

      <div className="bg-partner1 flex items-center">
        <div className="px-4 max-w-5xl mx-auto py-24">
            {partner.services.map(s => (
                <div key={s.title} className="mb-6">
                    <h3 className="font-semibold text-xl md:text-2xl">{s.title}</h3>
                    <p className="text-lg md:text-xl font-light tracking-widest leading-tight pb-4">{s.text}</p>
                </div>
            ))}
        </div>
      </div>

      <LocationPartner 
        addrres={partner.location.address}
        whatsApp={partner.location.whatsApp}
        position={partner.location.position}
      />

    </main>
  );
}
