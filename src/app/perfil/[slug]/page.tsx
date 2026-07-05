import React from "react";
import { notFound } from "next/navigation";
import { getOrganizerBySlug } from "@/actions/organizers";
import {
  InstagramIcon,
  FacebookIcon,
  WebIcon,
  CalendarIcon,
  LocationIcon,
} from "@/presentation/components/common/icons";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

// ── SVG Icons ──
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const SpotifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.98-.336.075-.67-.136-.746-.472-.075-.336.136-.67.472-.746 3.854-.88 7.15-.507 9.82 1.13.295.178.387.563.207.86zm1.227-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.08-1.182-.413.125-.85-.107-.975-.52-.125-.413.107-.85.52-.975 3.678-1.117 8.246-.575 11.35 1.332.366.226.486.706.26 1.073zm.107-2.827C14.402 8.81 8.463 8.613 5.063 9.645c-.52.157-1.073-.14-1.23-.66-.158-.518.14-1.072.66-1.23 3.908-1.186 10.473-.96 14.53 1.452.468.278.623.886.345 1.355-.278.468-.887.622-1.355.344z"/>
  </svg>
);

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function PerfilOrganizadorPage({ params }: Props) {
  const { slug } = await params;
  const organizer = await getOrganizerBySlug(slug);

  if (!organizer) {
    notFound();
  }

  // Filtrar y ordenar eventos futuros
  const now = new Date();
  const associatedEvents = organizer.events
    .map((eo) => eo.event)
    .filter((event) => {
      // Tiene al menos una ocurrencia futura u hoy
      return event.occurrences.some((occ) => new Date(occ.date) >= new Date(now.setHours(0, 0, 0, 0)));
    })
    .sort((a, b) => {
      const nextA = Math.min(...a.occurrences.map((o) => new Date(o.date).getTime()));
      const nextB = Math.min(...b.occurrences.map((o) => new Date(o.date).getTime()));
      return nextA - nextB;
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-brand-primary/5 pb-16">
      {/* Portada Decorativa con Degradado Estilo Premium */}
      <div className="h-64 md:h-80 bg-gradient-to-r from-brand-primary/40 via-purple-500/30 to-pink-500/20 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/60 flex flex-col md:flex-row gap-8 items-start">
          
          {/* Foto de Perfil */}
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 shrink-0 mx-auto md:mx-0">
            {organizer.photoId ? (
              <img
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnpmw1mty'}/image/upload/w_400,h_400,c_fill,q_auto,f_auto/${organizer.photoId}`}
                alt={organizer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 flex items-center justify-center text-brand-primary text-5xl font-black">
                {organizer.name.substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          {/* Información del Perfil */}
          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div>
              <span className="bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase inline-block mb-2">
                {organizer.type.name}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                {organizer.name}
              </h1>
            </div>

            {organizer.description && (
              <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                {organizer.description}
              </p>
            )}

            {/* Redes Sociales */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
              {organizer.instagram && (
                <Link
                  href={organizer.instagram}
                  target="_blank"
                  className="p-3 bg-gradient-to-tr from-pink-500 to-yellow-500 hover:scale-105 active:scale-95 text-white rounded-2xl transition-all shadow-md flex items-center justify-center"
                  title="Instagram"
                >
                  <InstagramIcon className="w-5 h-5" />
                </Link>
              )}
              {organizer.facebook && (
                <Link
                  href={organizer.facebook}
                  target="_blank"
                  className="p-3 bg-blue-600 hover:scale-105 active:scale-95 text-white rounded-2xl transition-all shadow-md flex items-center justify-center"
                  title="Facebook"
                >
                  <FacebookIcon className="w-5 h-5" />
                </Link>
              )}
              {organizer.youtube && (
                <Link
                  href={organizer.youtube}
                  target="_blank"
                  className="p-3 bg-red-600 hover:scale-105 active:scale-95 text-white rounded-2xl transition-all shadow-md flex items-center justify-center"
                  title="YouTube"
                >
                  <YoutubeIcon className="w-5 h-5" />
                </Link>
              )}
              {organizer.spotify && (
                <Link
                  href={organizer.spotify}
                  target="_blank"
                  className="p-3 bg-green-500 hover:scale-105 active:scale-95 text-white rounded-2xl transition-all shadow-md flex items-center justify-center"
                  title="Spotify"
                >
                  <SpotifyIcon className="w-5 h-5 text-white" />
                </Link>
              )}
              {organizer.tiktok && (
                <Link
                  href={organizer.tiktok}
                  target="_blank"
                  className="p-3 bg-black hover:scale-105 active:scale-95 text-white rounded-2xl transition-all shadow-md flex items-center justify-center"
                  title="TikTok"
                >
                  <span className="font-black text-xs tracking-tight uppercase">TikTok</span>
                </Link>
              )}
              {organizer.web && (
                <Link
                  href={organizer.web}
                  target="_blank"
                  className="p-3 bg-gray-800 hover:scale-105 active:scale-95 text-white rounded-2xl transition-all shadow-md flex items-center justify-center"
                  title="Sitio Web"
                >
                  <WebIcon className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Dos Columnas: Información de contacto y Eventos asociados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          
          {/* Columna Lateral de Contacto */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 space-y-4">
              <h3 className="text-lg font-black text-brand-primary border-b border-gray-100 pb-2">
                Contacto
              </h3>

              {organizer.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <PhoneIcon className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                  <span className="text-sm font-medium">{organizer.phone}</span>
                </div>
              )}

              {organizer.whatsapp && (
                <Link
                  href={`https://wa.me/${organizer.whatsapp}`}
                  target="_blank"
                  className="flex items-center gap-3 text-green-600 hover:underline transition-all"
                >
                  <WhatsappIcon className="w-4.5 h-4.5 shrink-0" />
                  <span className="text-sm font-bold">Enviar WhatsApp</span>
                </Link>
              )}

              {organizer.email && (
                <div className="flex items-center gap-3 text-gray-700 break-all">
                  <MailIcon className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                  <span className="text-sm font-medium">{organizer.email}</span>
                </div>
              )}

              {!organizer.phone && !organizer.whatsapp && !organizer.email && (
                <p className="text-xs text-gray-500 italic">No hay información de contacto disponible de forma pública.</p>
              )}
            </div>
          </div>

          {/* Columna Principal de Próximas Fechas / Eventos */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 space-y-6">
              <h3 className="text-xl font-black text-brand-primary flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-brand-primary" />
                Próximas Fechas y Eventos
              </h3>

              {associatedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-bold text-base">Sin eventos próximos</p>
                  <p className="text-xs text-gray-400 mt-1">Este perfil no tiene eventos programados actualmente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {associatedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-100 rounded-2xl p-4 hover:border-brand-primary/20 transition-all bg-white/50 hover:bg-white"
                    >
                      <div className="flex gap-4">
                        {event.photoId && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                            <img
                              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnpmw1mty'}/image/upload/w_200,h_200,c_fill,q_auto,f_auto/${event.photoId.includes('/') ? event.photoId : 'events/' + event.photoId}`}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 space-y-1 min-w-0">
                          <h4 className="font-black text-gray-850 text-base truncate">
                            {event.title}
                          </h4>
                          {event.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {event.description}
                            </p>
                          )}
                          <div className="pt-2 space-y-1">
                            {event.occurrences.map((occ) => (
                              <div key={occ.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                                <span className="font-bold text-brand-primary">
                                  {dayjs(occ.date).format("dddd D [de] MMMM")} a las {occ.timeStart} hs
                                </span>
                                <span className="flex items-center gap-1 text-gray-400">
                                  <LocationIcon className="w-3 h-3" />
                                  {occ.place.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
