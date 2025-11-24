import { CloudinaryImage } from '../common/CloudinaryImage'
import { CalendarIcon, LocationIcon } from '../common/icons'
import { HouseIcon } from '../common/icons/HouseIcon'

export const HeroPartner = () => {
  return (
    <section className="w-full min-h-screen flex flex-col md:flex-row items-center justify-center px-6 md:px-16 py-12 bg-gradient-to-b from-[#1a1b55] to-[#2a2c7c] text-white">
      
        {/* IMAGEN */}
        <div className="md:w-1/2 flex justify-center mb-10 md:mb-0">
            <div className='bg-gradient-to-b from-secondary to-gray-100 shadow-lg shadow-cyan-500/50 p-[2px] rounded-2xl'>
                <CloudinaryImage
                    // imageName="asociate-hero.jpg"
                    alt="Familias disfrutando en un espacio recreativo"
                    className="rounded-2xl max-w-md w-full object-cover"
                />
            </div>
        </div>

        {/* TEXTO */}
        <div className="w-full md:w-1/2 md:pl-10 flex flex-col justify-center">
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight text-center md:text-left">
                Sumá tu espacio a
            </h2>
            <h1 className="text-4xl md:text-5xl text-secondary font-extrabold mb-4 leading-tight text-center md:text-left">
                Paseos con Peques
            </h1>

            <p className="text-lg md:text-xl mb-6 text-center md:text-left text-pink-200">
                Mostrá tu lugar, evento o servicio a familias que buscan actividades para disfrutar con sus peques.
            </p>

            {/* BENEFICIOS */}
            <ul className="space-y-4 mb-8 text-pink-100">
                <li className="flex items-center gap-3">
                    <LocationIcon style='text-secondary'/>
                    Aumentá la visibilidad en nuestro mapa interactivo
                </li>
                <li className="flex items-center gap-3">
                    <HouseIcon style='text-secondary'/>
                    Llegá al público ideal: familias con niños
                </li>
                <li className="flex items-center gap-3">
                    <CalendarIcon style='text-secondary'/>
                    Difundí tus actividades en nuestra agenda y redes
                </li>
            </ul>

            {/* CTA */}
            <div className="flex justify-center md:justify-start">
                <a 
                    href='#contact'
                    className="px-8 py-3 bg-secondary hover:bg-white transition rounded-lg shadow-lg font-semibold text-lg hover:text-secondary cursor-pointer"
                >
                    Quiero sumarme
                </a>
            </div>
        </div>
    </section>
  )
}
