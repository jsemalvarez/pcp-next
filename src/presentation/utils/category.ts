import { PlaceCategory } from '@prisma/client';

export const getCategoryLabel = (category: PlaceCategory): string => {
  const labels: Record<PlaceCategory, string> = {
    ALL_DAY: "Todo el día",
    CULTURE: "Cultura",
    ENTERTAINMENT: "Entretenimiento",
    FOOD: "Gastronomía",
    OUTDOORS: "Al aire libre",
    SUPERVISION: "Con profe"
  };
  return labels[category] || category;
};
