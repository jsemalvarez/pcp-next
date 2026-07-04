import React from "react";
import { getNewsById } from "@/actions/news";
import { NewsForm } from "@/presentation/components/Admin/NewsForm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditarNoticiaPage({ params }: Props) {
  const { id } = await params;
  const newsItem = await getNewsById(id);

  if (!newsItem) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50">
          <h1 className="text-3xl font-black text-brand-primary">Editar Noticia</h1>
          <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
            Modificando el artículo: {newsItem.title}
          </p>
        </header>

        <NewsForm initialData={newsItem} />
      </div>
    </div>
  );
}
