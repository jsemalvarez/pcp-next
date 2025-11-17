const tiers = [
    {
        name: "Socio Base",
        discount: 10,
        features: [
            "Socios del 36 al 50",
            "2 historias promocionales por mes",
            "Colaboraciones en Instagram: posteos, reels o carrusel (según disponibilidad mensual)",
            "Tu logo en nuestro mapa",
            "Mini Sitio propio dentro de Paseos con Peques",
            "Posibilidad de ser Socio Preferencial",
        ],
        members:"0/15"
    },
    {
        name: "Socio Preferencial",
        discount: 20,
        features: [
            "Socios del 21 al 35",
            "2 historias promocionales por mes",
            "Colaboraciones en Instagram: posteos, reels o carrusel (según disponibilidad mensual)",
            "Tu logo en nuestro mapa",
            "Mini Sitio propio dentro de Paseos con Peques",
            "Posibilidad de ser Socio Estratégico",
        ],
        members:"0/15"
    },
    {
        name: "Socio Estratégico",
        discount: 40,
        features: [
            "Socios del 11 al 20",
            "1 historia promocionale por mes",
            "Colaboraciones en Instagram: posteos, reels o carrusel (según disponibilidad mensual)",            
            "Tu logo en nuestro mapa",            
            "Mini Sitio propio dentro de Paseos con Peques",
            "Posibilidad de ser Socio Fundador",            
        ],
        members:"0/10"
    },
    {
        name: "Socio Fundador",
        discount: 60
        ,
        features: [
            "Primeros 10 socios",
            "1 historia promocionale por mes",
            "Colaboraciones en Instagram: posteos, reels o carrusel (según disponibilidad mensual)",
            "Tu logo en nuestro mapa",
            "Mini Sitio propio dentro de Paseos con Peques",
        ],
        members:"1/10"
    },
];

export const Pricing = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-pink-600">Planes de Socios y Beneficios Exclusivos</h2>
          <p className="mt-2 text-gray-600">
            Acompañanos en este proyecto y recibí más visibilidad, presencia en el mapa y beneficios según tu nivel de participación.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl border shadow-sm bg-white flex flex-col border-blue-500 shadow-md `}
            >
              {/* Title */}
              <h3 className="text-2xl font-bold text-blue-500 mb-2 text-center">{tier.name}</h3>

              {/* Discount */}
              <p className="text-center text-4xl font-extrabold text-secondary mb-4">
                {tier.discount > 0 ? `${tier.discount}% OFF` : "Sin descuento"}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {tier.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span className="text-gray-500">{f}</span>
                  </li>
                ))}
              </ul>


              <span className="mx-auto w-[60px] h-[60px] mt-auto flex justify-center items-center text-white bg-blue-600 rounded-full">
                {tier.members}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
