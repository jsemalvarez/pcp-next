export type PriceType = 'FREE_ENTRY' | 'PAID_TICKET' | 'DONATION_BASED' | 'WITH_CONSUMPTION';
export type ActivityType = 'CIRCUS' | 'MUSIC' | 'WORKSHOP' | 'THEATER' | 'ENTERTAINMENT' | 'FOOD';

export interface Event {
    id: string;
    title: string;
    description?: string | null;
    photoId?: string | null;
    photoWidth?: number | null;
    photoHeight?: number | null;
    bgColor?: string | null;
    ticketUrl?: string | null;
    bookingWhatsapp?: string | null;
    priceType: PriceType;
    activityTypes: ActivityType[];
    ageMin: number;
    ageMax?: number | null;
    isFeatured: boolean;
    isSponsored: boolean;
    occurrences: EventOccurrence[];
    createdAt: Date;
    updatedAt: Date;
}

export interface EventOccurrence {
    id: string;
    eventId: string;
    date: Date;
    timeStart: string;
    timeEnd?: string | null;
    placeId: string;
    createdAt: Date;
    updatedAt: Date;
}

// Tipo extendido que incluye los datos del evento padre y el lugar
// Usado en el calendario y la vista de detalle
export interface EventOccurrenceWithRelations extends EventOccurrence {
    event: Event;
}

// Tipo flat para compatibilidad con el CalendarGrid actual
// Se genera a partir de EventOccurrenceWithRelations
export interface CalendarEvent {
    // Identidad
    id: string;             // ID de la ocurrencia
    eventId: string;

    // Contenido (del evento padre)
    title: string;
    description?: string | null;
    photoId?: string | null;
    photoWidth?: number | null;
    photoHeight?: number | null;
    bgColor?: string | null;
    ticketUrl?: string | null;
    bookingWhatsapp?: string | null;
    isFeatured: boolean;
    isSponsored: boolean;

    // Clasificación (del evento padre)
    priceType: PriceType;
    activityTypes: ActivityType[];
    ageMin: number;
    ageMax?: number | null;

    // Fecha/hora (de la ocurrencia)
    date: Date;
    timeStart: string;
    timeEnd?: string | null;

    // Lugar (de la ocurrencia)
    placeId: string;
}