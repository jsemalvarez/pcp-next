export const Footer= () => {
    return (
        <footer className="bg-slate-900 py-12 text-slate-300">
            <div className="container mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-4">
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-white">Paseos con Peques</h3>
                        <p className="text-sm leading-relaxed">
                            Guía de actividades para las familias con chicos en Mar del Plata.
                        </p>
                    </div>
                    <div>
                        <h4 className="mb-4 font-semibold text-white">Explorar</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#featured" className="hover:text-white">Lugares</a></li>
                            <li><a href="#events" className="hover:text-white">Eventos</a></li>
                            <li><a href="#directory" className="hover:text-white">Buscador</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 font-semibold text-white">Comunidad</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Instagram</a></li>
                            <li><a href="#" className="hover:text-white">Facebook</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 font-semibold text-white">Trabajamos con</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Marcas Aliadas</a></li>
                            <li><a href="#" className="hover:text-white">Unete</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">
                    © {new Date().getFullYear()} Paseos con Peques. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    )
}
