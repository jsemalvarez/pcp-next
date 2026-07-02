"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganizer, updateOrganizer } from "@/actions/organizers";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SearchableCategorySelect } from "./SearchableCategorySelect";

interface OrganizerType {
  id: string;
  name: string;
}

interface Organizer {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  photoId: string | null;
  typeId: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  spotify: string | null;
  tiktok: string | null;
  web: string | null;
  email: string | null;
}

interface Props {
  organizerTypes: OrganizerType[];
  initialData?: Organizer;
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

export function OrganizerForm({ organizerTypes, initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugCustomized, setIsSlugCustomized] = useState(!!initialData?.slug);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.typeId || "");

  // Image upload state
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dwhdla1b4";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "pcp_images";

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.photoId
      ? `https://res.cloudinary.com/${cloudName}/image/upload/w_300,q_auto,f_auto/${initialData.photoId}`
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
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
    data.append("folder", "organizers");

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
        name: formData.get("name") as string,
        typeId: formData.get("typeId") as string,
        slug: formData.get("slug") as string || null,
        description: formData.get("description") as string || null,
        photoId: uploadedPhotoId,
        phone: formData.get("phone") as string || null,
        whatsapp: formData.get("whatsapp") as string || null,
        instagram: formData.get("instagram") as string || null,
        facebook: formData.get("facebook") as string || null,
        youtube: formData.get("youtube") as string || null,
        spotify: formData.get("spotify") as string || null,
        tiktok: formData.get("tiktok") as string || null,
        web: formData.get("web") as string || null,
        email: formData.get("email") as string || null,
      };

      if (initialData) {
        const res = await updateOrganizer(initialData.id, data);
        if (!res.success) throw new Error(res.error || "Error al actualizar");
      } else {
        const res = await createOrganizer(data);
        if (!res.success) throw new Error(res.error || "Error al crear");
      }

      router.push("/admin/organizers");
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

      {/* Datos Principales */}
      <FormSection title="Datos del Organizador / Artista">
        <div className="space-y-4">
          <div>
            <InputLabel isRequired>Nombre</InputLabel>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <InputLabel>Slug de URL / Enlace (Personalizado)</InputLabel>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400 font-mono text-sm select-none">/perfil/</span>
              <input
                type="text"
                name="slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="nombre-del-artista"
                className="w-full pl-20 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-mono text-sm"
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Se genera automáticamente del nombre. Podés modificarlo si querés usar un enlace diferente.
            </p>
          </div>

          <div>
            <InputLabel isRequired>Categoría</InputLabel>
            <SearchableCategorySelect
              categories={organizerTypes}
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              placeholder="Seleccioná una categoría..."
            />
            <input type="hidden" name="typeId" value={selectedCategoryId} />
          </div>

          <div className="col-span-2">
            <InputLabel>Descripción / Biografía</InputLabel>
            <textarea
              name="description"
              rows={4}
              defaultValue={initialData?.description || ""}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Foto de Perfil */}
        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
          <InputLabel>Foto de Perfil</InputLabel>

          {imagePreview ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-brand-primary mb-4">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4 border-2 border-dashed border-gray-300 font-bold text-sm text-center p-2">
              Sin Imagen
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
      </FormSection>

      {/* Redes y Canales */}
      <FormSection title="Redes Sociales y Canales">
        <div>
          <InputLabel>Instagram</InputLabel>
          <input
            type="url"
            name="instagram"
            placeholder="https://instagram.com/..."
            defaultValue={initialData?.instagram || ""}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <InputLabel>Facebook</InputLabel>
          <input
            type="url"
            name="facebook"
            placeholder="https://facebook.com/..."
            defaultValue={initialData?.facebook || ""}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <InputLabel>YouTube (Canal o Video)</InputLabel>
          <input
            type="url"
            name="youtube"
            placeholder="https://youtube.com/..."
            defaultValue={initialData?.youtube || ""}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <InputLabel>Spotify (Artista o Playlist)</InputLabel>
          <input
            type="url"
            name="spotify"
            placeholder="https://open.spotify.com/..."
            defaultValue={initialData?.spotify || ""}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <InputLabel>TikTok</InputLabel>
          <input
            type="url"
            name="tiktok"
            placeholder="https://tiktok.com/@..."
            defaultValue={initialData?.tiktok || ""}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <InputLabel>Sitio Web</InputLabel>
          <input
            type="url"
            name="web"
            placeholder="https://..."
            defaultValue={initialData?.web || ""}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
            disabled={isSubmitting}
          />
        </div>
      </FormSection>

      {/* Información de Contacto */}
      <FormSection title="Contacto">
        <div>
          <InputLabel>Teléfono</InputLabel>
          <input
            type="text"
            name="phone"
            defaultValue={initialData?.phone || ""}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <InputLabel>WhatsApp</InputLabel>
          <input
            type="text"
            name="whatsapp"
            placeholder="Ej. 5492235555555"
            defaultValue={initialData?.whatsapp || ""}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <InputLabel>Correo Electrónico</InputLabel>
          <input
            type="email"
            name="email"
            defaultValue={initialData?.email || ""}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
            disabled={isSubmitting}
          />
        </div>
      </FormSection>

      {/* Botones de acción */}
      <div className="flex gap-4 items-center justify-end">
        <Link
          href="/admin/organizers"
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
          {isSubmitting ? "GUARDANDO..." : "GUARDAR"}
        </button>
      </div>
    </form>
  );
}
