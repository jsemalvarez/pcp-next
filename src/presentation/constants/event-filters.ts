import { ActivityType, PriceType } from "@prisma/client";


export const EVENT_PRICES: { id: PriceType; label: string }[] = [
  { id: "FREE_ENTRY",       label: "Gratuita" },
  { id: "DONATION_BASED",   label: "A la gorra" },
  { id: "WITH_CONSUMPTION", label: "Con consumición" },
  { id: "PAID_TICKET",      label: "Con ticket" },
];

export const EVENT_TYPES: { id: ActivityType; label: string }[] = [
  { id: "CIRCUS",        label: "Circo" },
  { id: "MUSIC",         label: "Música" },
  { id: "WORKSHOP",      label: "Talleres" },
  { id: "THEATER",       label: "Teatro" },
  { id: "ENTERTAINMENT", label: "Entretenimiento" },
  { id: "FOOD",          label: "Con algo rico" },
];