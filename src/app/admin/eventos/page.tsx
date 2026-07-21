import { getEvents } from "@/actions/events";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminEventsTable } from "@/presentation/components/Admin/AdminEventsTable";

export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const events = await getEvents();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-brand-primary">Eventos</h1>
            <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
              {events.length} evento{events.length !== 1 ? 's' : ''} registrado{events.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-gray-500 hover:text-gray-800 font-bold text-sm uppercase tracking-wider"
            >
              Volver al Dashboard
            </Link>
            <Link
              href="/admin/eventos/nuevo"
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              NUEVO EVENTO
            </Link>
          </div>
        </header>

        {/* Lista de eventos */}
        <AdminEventsTable initialEvents={events} />

      </div>
    </div>
  );
}
