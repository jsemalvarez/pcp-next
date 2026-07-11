import Link from "next/link";
import Image from "next/image";
import { Share2, Camera } from "lucide-react";

// Using Share2 and Camera as placeholders since Facebook & Instagram are not available in this version of lucide-react
const FacebookIcon = Share2;
const InstagramIcon = Camera;

export const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-150/20 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md py-12 px-6 mt-auto pb-24 md:pb-8 relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* Top Section: Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* Column 1: Brand & Description */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/favicon.svg"
                alt="Paseos con Peques"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
              />
              <div>
                <span className="block font-black text-xl text-brand-primary dark:text-white leading-none">
                  Paseos con Peques
                </span>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-brand-accent mt-0.5">
                  Guía cultural para familias
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-550 dark:text-gray-400 leading-relaxed max-w-sm">
              Descubrí los mejores lugares, eventos y paseos para disfrutar con niños y chicos en Mar del Plata.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-brand-primary dark:text-white">
              Explorar
            </h4>
            <div className="flex flex-col gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <Link href="/" className="hover:text-brand-accent transition-colors w-fit">
                Inicio
              </Link>
              <Link href="/noticias" className="hover:text-brand-accent transition-colors w-fit">
                Noticias
              </Link>
              <Link href="/calendario" className="hover:text-brand-accent transition-colors w-fit">
                Eventos
              </Link>
              <Link href="/map" className="hover:text-brand-accent transition-colors w-fit">
                Mapa
              </Link>
              <Link href="/favorites" className="hover:text-brand-accent transition-colors w-fit">
                Favoritos
              </Link>
            </div>
          </div>

          {/* Column 3: Social & Community */}
          <div className="flex flex-col gap-3">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-brand-primary dark:text-white">
              Redes Sociales
            </h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/paseosconpeques"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-gray-100 hover:bg-brand-accent/15 dark:bg-gray-900 dark:hover:bg-brand-accent/20 rounded-xl text-gray-600 dark:text-gray-300 hover:text-brand-accent transition-all hover:scale-105"
                title="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/paseosconpeques"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-gray-100 hover:bg-brand-accent/15 dark:bg-gray-900 dark:hover:bg-brand-accent/20 rounded-xl text-gray-600 dark:text-gray-300 hover:text-brand-accent transition-all hover:scale-105"
                title="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Divider */}
        <hr className="border-gray-150/15 dark:border-gray-800" />

        {/* Bottom Section: Copyright & Developer Credits */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-xs text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} Paseos con Peques. Todos los derechos reservados.
          </p>
          <p>
            Desarrollado y potenciado por{" "}
            <Link
              href="https://origenmdp.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent hover:underline font-extrabold"
            >
              Origen MdP - Costa Tech
            </Link>
          </p>
        </div>

      </div>
    </footer>
  );
};
