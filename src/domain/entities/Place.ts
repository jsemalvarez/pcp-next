import { PlaceCategory } from '@prisma/client';

export type { PlaceCategory };

export interface Place {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;

    // Visibilidad
    isActive: boolean;
    isShowInMap: boolean;
    isFeatured: boolean;

    // Contenido
    description?: string | null;
    schedules?: string | null;
    photoUrl?: string | null;
    bgColor?: string | null;

    // Ícono del mapa
    hasCustomIcon: boolean;
    customIconName?: string | null;
    iconType?: string | null;

    // Contacto y redes
    phone?: string | null;
    whatsapp?: string | null;
    web?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    videoLink?: string | null;

    // Características
    hasFood: boolean;
    hasShow: boolean;
    hasGames: boolean;
    hasSupervision: boolean;

    // Clasificación con enums de Prisma
    categories: PlaceCategory[];
    ageMin: number;
    ageMax?: number | null;

    createdAt: Date;
    updatedAt: Date;
}