const items = [
    {
        title:'La visibilidad dura 24 horas',
        text:'Las historias desaparecen rápido y tu público ideal puede no llegar a verlas.',
        icon: '👁️'
    },
    {
        title:'Tu audiencia está dispersa',
        text:'No necesitás miles de personas: necesitás familias buscando lugares como el tuyo.',
        icon: '👨‍👩‍👧'
    },
    {
        title:'Presencia permanente',
        text:'Aparecé en el mapa, la agenda y el buscador: siempre visible y segmentado.',
        icon: '📈'
    },
]

export const JoinUs = () => {
    return (
        <section className="w-full py-20 px-6 bg-[#1a1b55] text-white">
            <div className="max-w-5xl mx-auto text-center">
            
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                    Más allá de las Redes: 
                    <span className="text-secondary"> Visibilidad que Convierte</span>
                </h2>

                <p className="text-pink-200 max-w-2xl mx-auto mb-12 text-lg">
                    Las historias desaparecen. Los posts se pierden.  
                    Tu lugar merece una presencia constante y enfocada en las familias que buscan actividades.
                </p>

                {/* CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {
                        items.map( item =>(
                            <div 
                                key={item.title} 
                                className="bg-primary/90 backdrop-blur-md border-2 border-pink-300/70 rounded-xl p-6 shadow-lg flex flex-col items-center text-center"
                            >
                                <div className="w-16 h-16 flex items-center justify-center bg-secondary rounded-full text-3xl mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                <p className="text-pink-100 text-sm">
                                    {item.text}
                                </p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    )
}
