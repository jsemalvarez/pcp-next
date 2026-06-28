"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map as MapIcon, Calendar, Newspaper, MapPin, Heart } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const publicNavItems = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Noticias', href: '/noticias', icon: Newspaper },
    { name: 'Eventos', href: '/calendar', icon: Calendar },
    { name: 'Mapa', href: '/map', icon: MapIcon },
    { name: 'Lugares', href: '/places', icon: MapPin },
    { name: 'Favoritos', href: '/favorites', icon: Heart },
  ];

  const adminNavItems = [
    { name: 'Panel', href: '/admin/dashboard', icon: Home },
    { name: 'Lugares', href: '/admin/lugares', icon: MapPin },
    { name: 'Eventos', href: '/admin/eventos', icon: Calendar },
  ];

  if (pathname === '/admin/login') {
    return null;
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const navItems = isAdminRoute ? adminNavItems : publicNavItems;

  return (
    <>
      {/* Elemento "fantasma" que empuja el contenido naturalmente al final de la página */}
      <div className="h-16 pb-safe" aria-hidden="true" />
      
      {/* Navegación fijada */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_-1px_3px_rgba(0,0,0,0.3)] transition-colors duration-300">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform duration-100 ${isActive ? 'text-brand-primary dark:text-brand-accent' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-semibold tracking-wide truncate max-w-full px-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
