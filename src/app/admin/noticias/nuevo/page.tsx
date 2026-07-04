import React from "react";
import { NewsForm } from "@/presentation/components/Admin/NewsForm";

export const dynamic = "force-dynamic";

export default async function NuevaNoticiaPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50">
          <h1 className="text-3xl font-black text-brand-primary">Nueva Noticia</h1>
          <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
            Publicá novedades o anuncios en el sitio web
          </p>
        </header>

        <NewsForm />
      </div>
    </div>
  );
}
