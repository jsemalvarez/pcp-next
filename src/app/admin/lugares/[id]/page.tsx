import { PlaceForm } from "@/presentation/components/Admin/PlaceForm";
import { getPlaceById } from "@/actions/places";
import { notFound } from "next/navigation";

export default async function EditarLugarPage({ params }: { params: { id: string } }) {
  const place = await getPlaceById(params.id);

  if (!place) {
    notFound();
  }

  // Type assertion or conversion if Prisma schema types are strictly slightly different from Place entity,
  // but they should match closely enough.
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50">
          <h1 className="text-3xl font-black text-brand-primary">Editar Lugar</h1>
          <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
            Modificando: {place.name}
          </p>
        </header>

        {/* @ts-expect-error Types between Prisma and Entity might differ slightly in nullability */}
        <PlaceForm initialData={place} />
      </div>
    </div>
  );
}
