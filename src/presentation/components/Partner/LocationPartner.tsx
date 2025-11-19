'use client'


export const LocationPartner = () => {

  return (
    <section className="min-h-screen bg-partner2 flex flex-col justify-center items-center gap-6">

        <div className="w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 shadow rounded-xl border-2 border-primary/70">
                <p className="text-sm text-gray-300">Dirección:</p>
                <p className="font-bold text-gray-100">calle 12345</p>
            </div>

            <div className="p-4 shadow rounded-xl border-2 border-primary/70">
                <p className="text-sm text-gray-300">WhatsApp:</p>
                <p className="font-bold text-gray-100">223445566</p>
            </div>
        </div>

        <div className="w-2/3 aspect-[4/5] md:aspect-[10/5] rounded-xl border-2 border-primary/70">
          {/* <MapContainer 
              center={{ lat:-38.00022116740122, lng:-57.551784619277406 }} zoom={14} 
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
          >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />   
                <Marker position={{ lat:-38.00022116740122, lng:-57.551784619277406 }}>
                </Marker>         
          </MapContainer> */}
        </div>

      </section>
  )
}
