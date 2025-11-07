interface Props {
  whatsapp: string;
  className?: string;
}

export const WhatsAppButton = ({ whatsapp, className = '' }:Props) => {
    if (!whatsapp) return null;

    const whatsappLink = `https://wa.me/${whatsapp}`;
  
    return (
        <a
            target="_blank"
            rel="noopener noreferrer"
            href={ whatsappLink }
            className={`block p-1 flex justify-center bg-green-700 text-white rounded-full transition-all duration-300 hover:bg-green-600 ${className}`}
        >
            Ir a Whatsapp
        </a>
    );
};
  