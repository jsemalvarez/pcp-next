import React from "react";
import { notFound } from "next/navigation";
import { getBannerById } from "@/actions/banners";
import { BannerForm } from "@/presentation/components/Admin/BannerForm";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params;
  const banner = await getBannerById(id);

  if (!banner) {
    notFound();
  }

  // Cast prisma model to the component structure
  const formattedBanner = {
    ...banner,
    createdAt: new Date(banner.createdAt),
    updatedAt: new Date(banner.updatedAt),
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50">
          <h1 className="text-3xl font-black text-brand-primary">Editar Banner</h1>
          <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
            Modificar los datos del banner seleccionado
          </p>
        </header>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
          <BannerForm initialData={formattedBanner} />
        </div>
      </div>
    </div>
  );
}
