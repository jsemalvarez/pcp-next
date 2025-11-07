interface Props {
  position: {lat: number; lng: number},
  className?: string
}

export const ViewOnMapButton = ({ position, className = '' }:Props) => {
    if (!position?.lat || !position?.lng) return null;
  
    const mapUrl = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
  
    return (
        <a
            target="_blank"
            rel="noopener noreferrer"
            href={mapUrl}
            className={`block p-1 flex justify-center bg-blue-600 text-white rounded-full transition-all duration-300 hover:bg-blue-500 ${className}`}
        >
            Ver en mapa
        </a>
    );
};