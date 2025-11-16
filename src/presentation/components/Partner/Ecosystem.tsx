import React from 'react'

export const Ecosystem = () => {
  return (
    <section className="w-full py-20 px-6 bg-[#ffe1ee] text-gray-900">
        <div className="max-w-6xl mx-auto text-center">
        
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Nuestro Ecosistema <span className="text-pink-600">360°</span>
            </h2>
        
            <p className="text-gray-700 max-w-3xl mx-auto mb-16 text-lg">
                Donde las familias te encuentran, siempre.
            </p>
        
            {/* GRID DE 3 CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
            {/* CARD 1 — MINI SITIO */}
            <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center text-center border border-pink-200">
                <div className="w-20 h-20 flex items-center justify-center bg-pink-500 text-white text-4xl rounded-full mb-6">
                🏠
                </div>
                <h3 className="text-xl font-bold mb-3">Tu Mini-Sitio Web Propio</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Un perfil dedicado dentro de nuestra web para tu marca, con fotos,
                    descripción y contacto.
                </p>
            </div>
        
            {/* CARD 2 — MAPA */}
            <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center text-center border border-pink-200">
                <div className="w-20 h-20 flex items-center justify-center bg-blue-500 text-white text-4xl rounded-full mb-6">
                🗺️
                </div>
                <h3 className="text-xl font-bold mb-3">Destacado en el Mapa Familiar</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                <strong className="text-pink-600">Tu logo en nuestro mapa interactivo</strong>, visible para familias que están buscando salir ahora mismo.  
                </p>
            </div>
        
            {/* CARD 3 — REDES SOCIALES */}
            <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center text-center border border-pink-200">
                <div className="w-20 h-20 flex items-center justify-center bg-purple-600 text-white text-4xl rounded-full mb-6">
                    📣
                </div>
                <h3 className="text-xl font-bold mb-3">Visibilidad en Instagram</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Posts y Stories diseñados para dirigir tráfico real y segmentado hacia tu Mini-Sitio.
                </p>
            </div>
        
            </div>
        </div>
    </section>
  )
}
