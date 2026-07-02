"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBanner, updateBanner } from "@/actions/banners";
import { Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  linkUrl: string | null;
  photoId: string | null;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  initialData?: Banner;
}

const InputLabel = ({ children, isRequired }: { children: React.ReactNode; isRequired?: boolean }) => (
  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
    {children}
    {isRequired && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white/50 border border-brand-primary/10 rounded-2xl p-6 mb-6 shadow-sm">
    <h3 className="text-xl font-black text-brand-primary mb-6">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

export function BannerForm({ initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [linkUrl, setLinkUrl] = useState(initialData?.linkUrl || "");
  const [priority, setPriority] = useState(initialData?.priority ?? 0);
  const [isActive, setIsActive] = useState(initialData ? initialData.isActive : true);

  // Image upload state
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dwhdla1b4";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "pcp_images";

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.photoId
      ? `https://res.cloudinary.com/${cloudName}/image/upload/w_600,q_auto,f_auto/${initialData.photoId}`
      : null
  );

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    data.append("folder", "banners");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: data }
    );
    const result = await res.json();
    if (!res.ok) {
      throw new Error("Error al subir la imagen a Cloudinary");
    }
    return `${result.public_id}.${result.format}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let uploadedPhotoId = initialData?.photoId || null;

      if (imageFile) {
        uploadedPhotoId = await uploadToCloudinary(imageFile);
      }

      const data = {
        title,
        subtitle: subtitle || null,
        linkUrl: linkUrl || null,
        photoId: uploadedPhotoId,
        isActive,
        priority: Number(priority),
      };

      if (initialData) {
        const res = await updateBanner(initialData.id, data);
        if (!res.success) throw new Error(res.error || "Error al actualizar el banner");
      } else {
        const res = await createBanner(data);
        if (!res.success) throw new Error(res.error || "Error al crear el banner");
      }

      router.push("/admin/banners");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 font-bold rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <FormSection title="Detalles del Banner">
        <div className="space-y-4 col-span-1 md:col-span-2">
          <div>
            <InputLabel isRequired>Título</InputLabel>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium text-lg"
              required
              disabled={isSubmitting}
              placeholder="Ej. ¡Gran Festival de Títeres!"
            />
          </div>

          <div>
            <InputLabel>Subtítulo / Copete (Opcional)</InputLabel>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
              disabled={isSubmitting}
              placeholder="Ej. Este fin de semana en el Parque Mitre"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputLabel>Enlace destino (URL / Ruta)</InputLabel>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Ej. /calendario, /lugares/mi-lugar o https://sitio.com"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
                disabled={isSubmitting}
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Puede ser una ruta interna del sitio (ej: /calendario) o externa completa (ej: https://site.com).
              </p>
            </div>

            <div>
              <InputLabel isRequired>Prioridad de Visualización</InputLabel>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
                required
                disabled={isSubmitting}
                min={0}
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Los banners se ordenan de menor a mayor prioridad (ej: 0, 1, 2...).
              </p>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Imagen y Visibilidad">
        {/* Subida de Imagen */}
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
          <InputLabel>Imagen Principal del Banner</InputLabel>

          {imagePreview ? (
            <div className="relative w-full max-w-[320px] aspect-video rounded-xl overflow-hidden border-2 border-brand-primary mb-4 shadow-md">
              <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full max-w-[320px] aspect-video rounded-xl bg-gray-100 flex flex-col items-center justify-center text-gray-400 mb-4 border-2 border-dashed border-gray-300 p-4">
              <ImageIcon className="w-12 h-12 mb-2 text-gray-300" />
              <span className="text-sm font-bold">Sin Imagen Seleccionada</span>
            </div>
          )}

          <input
            type="file"
            accept=".webp, image/webp"
            onChange={handleImageChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer"
            disabled={isSubmitting}
          />
        </div>

        {/* Visibilidad */}
        <div className="flex flex-col justify-center space-y-6 bg-white/35 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="focus:ring-brand-primary h-5 w-5 text-brand-primary border-gray-300 rounded-lg cursor-pointer"
                disabled={isSubmitting}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isActive" className="font-bold text-gray-700 cursor-pointer">
                BANNER ACTIVO
              </label>
              <p className="text-gray-500 text-xs">
                Si está desactivado, no se mostrará en el carrusel de la página de inicio.
              </p>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Botones de acción */}
      <div className="flex gap-4 items-center justify-end">
        <Link
          href="/admin/banners"
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          CANCELAR
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "GUARDANDO..." : "GUARDAR BANNER"}
        </button>
      </div>
    </form>
  );
}
