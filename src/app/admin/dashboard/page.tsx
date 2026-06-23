import { getSession } from "@/data/auth/session";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import prisma from "@/data/prisma/db";

export default async function DashboardPage() {
  const session = await getSession();
  const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header del Dashboard */}
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-brand-primary">
              Panel de Control
            </h1>
            <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
              Admin: {user?.name || user?.email || "Usuario"}
            </p>
          </div>
          
          {/* Formulario de Logout usando Server Action */}
          <form action={logoutAction}>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md active:scale-95"
            >
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
              SALIR
            </button>
          </form>
        </header>

        {/* Contenido del Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 hover:bg-white/90 transition-colors">
            <h2 className="text-2xl font-black text-brand-primary">Eventos</h2>
            <p className="text-gray-600 font-medium text-sm mt-2">Pronto gestionaremos el calendario aquí.</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 hover:bg-white/90 transition-colors">
            <h2 className="text-2xl font-black text-brand-primary">Lugares</h2>
            <p className="text-gray-600 font-medium text-sm mt-2">Pronto gestionaremos el directorio aquí.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
