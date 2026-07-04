import React from "react";
import { getOrganizerById } from "@/actions/organizers";
import { getOrganizerTypes } from "@/actions/organizerTypes";
import { OrganizerForm } from "@/presentation/components/Admin/OrganizerForm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditarOrganizadorPage({ params }: Props) {
  const { id } = await params;
  const [organizer, organizerTypes] = await Promise.all([
    getOrganizerById(id),
    getOrganizerTypes(),
  ]);

  if (!organizer) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50">
          <h1 className="text-3xl font-black text-brand-primary">Editar Organizador / Artista</h1>
          <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
            Modificando el perfil de: {organizer.name}
          </p>
        </header>

        <OrganizerForm organizerTypes={organizerTypes} initialData={organizer} />
      </div>
    </div>
  );
}
