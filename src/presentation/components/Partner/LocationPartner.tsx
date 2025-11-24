'use client'

import dynamic from 'next/dynamic';
const PartnerMapView = dynamic(() => import('./PartnerMapView'), {
    ssr: false,
})

interface Props{
  addrres: string;
  whatsApp: string;
  position: { 
    lat: number;
    lng: number; 
  }
}

export const LocationPartner = ({addrres, whatsApp, position}:Props) => {

  return (
    <section className="min-h-screen bg-partner2 flex flex-col justify-center items-center gap-6">

        <div className="w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 shadow rounded-xl border-2 border-primary/70">
                <p className="text-sm text-gray-300">Dirección:</p>
                <p className="font-bold text-gray-100">{addrres}</p>
            </div>

            <div className="p-4 shadow rounded-xl border-2 border-primary/70">
                <p className="text-sm text-gray-300">WhatsApp:</p>
                <p className="font-bold text-gray-100">{whatsApp}</p>
            </div>
        </div>

        <div className="w-2/3 aspect-[4/5] md:aspect-[10/5] rounded-xl border-2 border-primary/70 overflow-hidden">
          <PartnerMapView position={position}/>
        </div>

      </section>
  )
}
