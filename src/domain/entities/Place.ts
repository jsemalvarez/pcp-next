export interface Place {
    id: string;
    name: string;
    address: string;
    isPlaceAvtive: boolean;
    isShowInMap: boolean;
    hasCustomIcon: boolean;
    customIconName: string;
    position: { lat: number, lng: number };
    schedules: string;
    phone: string;
    whatsapp: string;
    photoUrl: string;
    web: string;
    instagram: string;
    facebook: string;
    videoLink: string;
    hasFood: boolean;
    hasShow: boolean;
    hasGames: boolean;
    hasSupervision: boolean;
    categories: string[];
    ageRanges: string[];
    description: string;
    iconType: string;
    bgColor: string;
}