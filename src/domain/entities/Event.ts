export interface Event {
    id: string;
    title: string;
    description: string;
    artists: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    bgColor: string;
    placeId: string;
    ageRanges: string[];
    priceType: string;
    activityTypes: string[];
    tempPlaceName: string;
    tempPlaceAddress: string;
    tempPlacePhone: string;
    tempPlaceWhatsapp: string;
    tempPlacePosition: { lat: number; lng: number; };
    isFeatured: string;
    photoId: string;
}