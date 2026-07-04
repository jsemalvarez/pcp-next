"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createNews, updateNews } from "@/actions/news";
import { Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface News {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  content: string;
  photoId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  initialData?: News;
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

export function NewsForm({ initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toLocalDateTimeString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugCustomized, setIsSlugCustomized] = useState(!!initialData?.slug);
  const [isActive, setIsActive] = useState(initialData ? initialData.isActive : true);
  const [isFeatured, setIsFeatured] = useState(initialData ? initialData.isFeatured : false);
  const [publishedAt, setPublishedAt] = useState(
    initialData
      ? toLocalDateTimeString(new Date(initialData.publishedAt))
      : toLocalDateTimeString(new Date())
  );

  // Image upload state
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dnpmw1mty";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "pcp_images";

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.photoId
      ? `https://res.cloudinary.com/${cloudName}/image/upload/w_400,q_auto,f_auto/${initialData.photoId}`
      : null
  );

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugCustomized) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSlug(slugify(val));
    setIsSlugCustomized(true);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    data.append("folder", "news");

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

    const formData = new FormData(e.currentTarget);

    try {
      let uploadedPhotoId = initialData?.photoId || null;

      if (imageFile) {
        uploadedPhotoId = await uploadToCloudinary(imageFile);
      }

      const data = {
        title: formData.get("title") as string,
        subtitle: (formData.get("subtitle") as string) || null,
        slug: (formData.get("slug") as string) || null,
        content: formData.get("content") as string,
        photoId: uploadedPhotoId,
        isActive,
        isFeatured,
        publishedAt: new Date(publishedAt),
      };

      if (initialData) {
        const res = await updateNews(initialData.id, data);
        if (!res.success) throw new Error(res.error || "Error al actualizar la noticia");
      } else {
        const res = await createNews(data);
        if (!res.success) throw new Error(res.error || "Error al crear la noticia");
      }

      router.push("/admin/noticias");
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

      <FormSection title="Contenido de la Noticia">
        <div className="space-y-4 col-span-1 md:col-span-2">
          <div>
            <InputLabel isRequired>Título</InputLabel>
            <input
              type="text"
              name="title"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium text-lg"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <InputLabel>Copete / Subtítulo</InputLabel>
            <input
              type="text"
              name="subtitle"
              defaultValue={initialData?.subtitle || ""}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
              disabled={isSubmitting}
              placeholder="Una breve descripción que invite a leer..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputLabel>Slug de URL / Enlace (Personalizado)</InputLabel>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400 font-mono text-sm select-none">/noticias/</span>
                <input
                  type="text"
                  name="slug"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="titulo-de-la-noticia"
                  className="w-full pl-24 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-mono text-sm"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <InputLabel isRequired>Fecha de Publicación</InputLabel>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <InputLabel isRequired>Cuerpo de la Noticia</InputLabel>
            <textarea
              name="content"
              rows={12}
              defaultValue={initialData?.content || ""}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium font-sans"
              required
              disabled={isSubmitting}
              placeholder="Escribí el desarrollo de la noticia acá..."
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Imagen y Configuración">
        {/* Subida de Imagen */}
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
          <InputLabel>Imagen Principal</InputLabel>

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
          <p className="text-[11px] text-gray-500 mt-3 text-center">
            ¿Querés optimizar la imagen?{" "}
            <a
              href="https://squoosh.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary font-bold hover:underline"
            >
              Convertir imagen a .webp aquí ↗
            </a>
          </p>
        </div>

        {/* Visibilidad y Destacados */}
        <div className="flex flex-col justify-center space-y-6 bg-white/35 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="focus:ring-brand-primary h-5 w-5 text-brand-primary border-gray-300 rounded-lg cursor-pointer"
                disabled={isSubmitting}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isActive" className="font-bold text-gray-700 cursor-pointer">
                PUBLICADA / ACTIVA
              </label>
              <p className="text-gray-500 text-xs">
                Si está desactivada, se guardará como borrador y no se mostrará en la web.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="isFeatured"
                name="isFeatured"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="focus:ring-brand-primary h-5 w-5 text-brand-primary border-gray-300 rounded-lg cursor-pointer"
                disabled={isSubmitting}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isFeatured" className="font-bold text-gray-700 cursor-pointer">
                NOTICIA DESTACADA
              </label>
              <p className="text-gray-500 text-xs">
                Destaca esta noticia en las secciones principales o en la página de inicio.
              </p>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Botones de acción */}
      <div className="flex gap-4 items-center justify-end">
        <Link
          href="/admin/noticias"
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
          {isSubmitting ? "GUARDANDO..." : "GUARDAR NOTICIA"}
        </button>
      </div>
    </form>
  );
}
