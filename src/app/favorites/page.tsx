import prisma from "@/data/prisma/db";
import FavoritesClient from "./FavoritesClient";

export const revalidate = 0; // Disable caching to ensure it always gets the latest data

export default async function FavoritesPage() {
  const places = await prisma.place.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { isFeatured: "desc" },
      { name: "asc" },
    ],
  });

  const events = await prisma.event.findMany({
    include: {
      occurrences: {
        include: {
          place: true,
        },
        orderBy: {
          date: "asc",
        },
      },
      organizers: {
        include: {
          organizer: true,
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  // Map events to a format that matches what we need
  const serializedEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    photoId: event.photoId,
    priceType: event.priceType,
    activityTypes: event.activityTypes,
    ageMin: event.ageMin,
    ageMax: event.ageMax,
    ticketUrl: event.ticketUrl,
    bookingWhatsapp: event.bookingWhatsapp,
    organizers: event.organizers.map(eo => ({
      id: eo.organizer.id,
      name: eo.organizer.name,
      slug: eo.organizer.slug,
    })),
    occurrences: event.occurrences.map(occ => ({
      id: occ.id,
      date: occ.date.toISOString(),
      timeStart: occ.timeStart,
      timeEnd: occ.timeEnd,
      place: {
        id: occ.place.id,
        name: occ.place.name,
        address: occ.place.address,
        phone: occ.place.phone,
        whatsapp: occ.place.whatsapp,
      },
    })),
  }));

  const serializedPlaces = places.map(place => ({
    id: place.id,
    name: place.name,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    description: place.description,
    schedules: place.schedules,
    photoUrl: place.photoUrl,
    phone: place.phone,
    whatsapp: place.whatsapp,
    web: place.web,
    instagram: place.instagram,
    facebook: place.facebook,
    videoLink: place.videoLink,
    hasFood: place.hasFood,
    hasShow: place.hasShow,
    hasGames: place.hasGames,
    hasSupervision: place.hasSupervision,
  }));

  return (
    <FavoritesClient 
      initialPlaces={serializedPlaces} 
      initialEvents={serializedEvents} 
    />
  );
}
