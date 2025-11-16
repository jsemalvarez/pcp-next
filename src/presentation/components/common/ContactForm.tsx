export const ContactForm = () => {
    return (
        <section 
            id="contact"
            className="w-full py-24 bg-primary text-white"
        >
            <div className="max-w-5xl mx-auto px-6">

                {/* Título */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10">
                    Conecta Hoy Mismo con Miles de Familias
                </h2>

                {/* CTA Principal */}
                <div className="flex justify-center mb-12">
                    <a
                        href="#form-contacto"
                        className="bg-secondary hover:bg-white text-white font-semibold hover:text-secondary text-lg px-8 py-3 rounded-full shadow-xl transition-all"
                    >
                        ¡Quiero ser Socio!
                    </a>
                </div>

                {/* Formulario */}
                <form
                    id="form-contacto"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-10 max-w-3xl mx-auto shadow-2xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                        {/* Nombre */}
                        <div className="flex flex-col">
                        <label className="mb-1 text-sm font-semibold">Nombre</label>
                        <input
                            type="text"
                            className="bg-white/20 rounded-lg px-4 py-2 border border-white/30 focus:ring-2 focus:ring-pink-400 outline-none text-white placeholder-white/60"
                            placeholder="Tu nombre"
                        />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col">
                        <label className="mb-1 text-sm font-semibold">Email</label>
                        <input
                            type="email"
                            className="bg-white/20 rounded-lg px-4 py-2 border border-white/30 focus:ring-2 focus:ring-pink-400 outline-none text-white placeholder-white/60"
                            placeholder="tu@email.com"
                        />
                        </div>

                    </div>

                    {/* Mensaje */}
                    <div className="flex flex-col mb-6">
                        <label className="mb-1 text-sm font-semibold">Mensaje</label>
                        <textarea
                            rows={4}
                            className="bg-white/20 rounded-lg px-4 py-2 border border-white/30 focus:ring-2 focus:ring-pink-400 outline-none text-white placeholder-white/60"
                            placeholder="Contanos sobre tu proyecto o espacio…"
                        />
                    </div>

                    {/* Botón enviar */}
                    <div className="text-center">
                        <button
                            type="submit"
                            className="bg-secondary hover:bg-white px-8 py-3 rounded-full font-semibold text-white hover:text-secondary shadow-xl transition-all cursor-pointer"
                        >
                            Enviar Mensaje
                        </button>
                    </div>

                </form>
            </div>
        </section>
    )
}
