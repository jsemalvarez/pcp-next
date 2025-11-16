export const PremiumServices = () => {
    return (
        <section className="w-full py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                
                {/* Título */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-center text-purple-900 mb-12">
                    Potencia tu Visibilidad: Opciones Premium
                </h2>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* Card Reel */}
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-4 mb-4">
                    {/* Ícono */}
                    <div className="text-purple-600 text-4xl">🎥</div>
                    <h3 className="text-2xl font-bold text-purple-900">
                        Producción de Reel Exclusivo
                    </h3>
                    </div>
                    <p className="text-purple-800 leading-relaxed">
                        Crea un Reel profesional para tu marca. Ideal para mostrar tu espacio, 
                        servicios o experiencias. <br />
                        <span className="font-semibold text-purple-700">Cupos mensuales limitados</span>                         
                    </p>
                </div>

                {/* Card Destacado */}
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-4 mb-4">
                    {/* Ícono */}
                    <div className="text-purple-600 text-4xl">⭐</div>
                    <h3 className="text-2xl font-bold text-purple-900">
                        Posición Destacada y Banner
                    </h3>
                    </div>
                    <p className="text-purple-800 leading-relaxed">
                        Reservado para <span className="font-semibold text-purple-700">contratos anuales</span>. 
                        Obtenés la máxima visibilidad dentro de nuestra web y del directorio, 
                        asegurando tráfico constante y calificado.
                    </p>
                </div>

                </div>
            </div>
        </section>
    )
}
