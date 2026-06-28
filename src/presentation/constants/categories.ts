import { PlaceCategory } from "@prisma/client";

export const CATEGORIES: Record<string, PlaceCategory> = {
    ALL_DAY:      'ALL_DAY',
    CULTURE:      'CULTURE',
    ENTERTAINMENT:'ENTERTAINMENT',
    FOOD:         'FOOD',
    OUTDOORS:     'OUTDOORS',
    SUPERVISION:  'SUPERVISION',
};

export const CATEGORIES_TRANSLATE: Record<PlaceCategory, string> = {
    ALL_DAY:      'Todo el día',
    CULTURE:      'Cultura',
    ENTERTAINMENT:'Entretenimiento',
    FOOD:         'Gastronomía',
    OUTDOORS:     'Al aire libre',
    SUPERVISION:  'Con profe',
};

export const COLORS_BY_CATEGORIES: Partial<Record<PlaceCategory, string>> = {
    CULTURE:      '#9575CD',
    ENTERTAINMENT:'#FFA500',
    FOOD:         '#8BC34A',
    OUTDOORS:     '#00BCD4',
    SUPERVISION:  '#F48FB1',
};
