"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Place } from "@/domain/entities/Place";
import { createEvent, updateEvent, CreateEventInput } from "@/actions/events";
import { Prisma } from "@prisma/client";
import { getPlaces } from "@/actions/places";
import { getOrganizers } from "@/actions/organizers";

type EventWithOccurrences = Prisma.EventGetPayload<{ include: { occurrences: { include: { place: true } } } }>;
import { EVENT_PRICES, EVENT_TYPES } from "@/presentation/constants/event-filters";
import { ActivityType, PriceType } from "@prisma/client";
import { Save, ArrowLeft, Plus, Trash2, Calendar, ChevronDown } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import { SearchablePlaceSelect } from "./SearchablePlaceSelect";
import { SearchableOrganizerSelect } from "./SearchableOrganizerSelect";
dayjs.locale('es');

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const InputLabel = ({ children, isRequired }: { children: React.ReactNode; isRequired?: boolean }) => (
  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
    {children}
    {isRequired && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white/50 border border-brand-primary/10 rounded-2xl p-6 mb-6 shadow-sm">
    <h3 className="text-xl font-black text-brand-primary mb-6">{title}</h3>
    {children}
  </div>
);

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type RepeatMode = 'once' | 'weekly' | 'daily' | 'custom';

interface OccurrenceRow {
  key: string; // para React key
  date: string;     // 'YYYY-MM-DD'
  timeStart: string;
  timeEnd: string;
  placeId: string;
}

interface Organizer {
  id: string;
  name: string;
  type: {
    name: string;
  };
}

interface Props {
  places: Place[];
  organizers?: Organizer[];
  initialData?: EventWithOccurrences & {
    organizers?: { organizerId: string }[];
  };
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function generateOccurrences(
  mode: RepeatMode,
  startDate: string,
  endDate: string,
  timeStart: string,
  timeEnd: string,
  placeId: string,
  customDates: string[],
  selectedWeekdays: number[]
): OccurrenceRow[] {
  if (!startDate || !timeStart || !placeId) return [];

  const rows: OccurrenceRow[] = [];

  if (mode === 'once') {
    rows.push({ key: startDate, date: startDate, timeStart, timeEnd, placeId });
  } else if (mode === 'custom') {
    customDates.forEach((d) => {
      rows.push({ key: d, date: d, timeStart, timeEnd, placeId });
    });
  } else if (mode === 'weekly' && endDate) {
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    
    // Si no hay días seleccionados, usar por defecto el día de la semana de la fecha de inicio
    const weekdaysToFilter = selectedWeekdays.length > 0 
      ? selectedWeekdays 
      : [current.day()];

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      if (weekdaysToFilter.includes(current.day())) {
        const dateStr = current.format('YYYY-MM-DD');
        rows.push({ key: dateStr, date: dateStr, timeStart, timeEnd, placeId });
      }
      current = current.add(1, 'day');
    }
  } else if (mode === 'daily' && endDate) {
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      rows.push({ key: dateStr, date: dateStr, timeStart, timeEnd, placeId });
      current = current.add(1, 'day');
    }
  }

  return rows;
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export function EventForm({ places, organizers = [], initialData }: Props) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPlaces, setCurrentPlaces] = useState<Place[]>(places);
  const [currentOrganizers, setCurrentOrganizers] = useState<Organizer[]>(organizers);

  useEffect(() => {
    async function syncData() {
      try {
        const [updatedPlaces, updatedOrganizers] = await Promise.all([
          getPlaces(),
          getOrganizers(),
        ]);
        setCurrentPlaces(updatedPlaces);
        setCurrentOrganizers(updatedOrganizers as Organizer[]);
      } catch (err) {
        console.error("Error al sincronizar datos de lugares/organizadores:", err);
      }
    }

    // Refrescar al enfocar la pestaña
    window.addEventListener("focus", syncData);
    return () => window.removeEventListener("focus", syncData);
  }, []);

  // ── Datos generales ──
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>(initialData?.activityTypes ?? []);
  const [ageMin, setAgeMin] = useState<number>(initialData?.ageMin ?? 0);
  const [ageMax, setAgeMax] = useState<number | null>(initialData?.ageMax ?? null);
  const [priceType, setPriceType] = useState<PriceType>(initialData?.priceType ?? 'FREE_ENTRY');
  const [selectedColor, setSelectedColor] = useState<string>(initialData?.bgColor ?? '#9575CD');
  const [selectedOrganizerIds, setSelectedOrganizerIds] = useState<string[]>(
    initialData?.organizers?.map((o) => o.organizerId) ?? []
  );

  // ── Datos de imagen ──
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dnpmw1mty";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "pcp_images";

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.photoId
      ? `https://res.cloudinary.com/${cloudName}/image/upload/w_300,q_auto,f_auto/${initialData.photoId.includes('/') ? initialData.photoId : 'events/' + initialData.photoId}`
      : null
  );

  // ── Generador de ocurrencias ──
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('once');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [customDates, setCustomDates] = useState<string[]>([]);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);

  // Ocurrencias finales — en edición se pre-cargan las existentes
  const [occurrences, setOccurrences] = useState<OccurrenceRow[]>(
    initialData?.occurrences.map((o) => ({
      key: o.id,
      date: dayjs(o.date).format('YYYY-MM-DD'),
      timeStart: o.timeStart,
      timeEnd: o.timeEnd ?? '',
      placeId: o.placeId,
    })) ?? []
  );
  const [previewGenerated, setPreviewGenerated] = useState(isEditing);

  // ── Upload helper ──
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', uploadPreset);
    data.append('folder', 'events');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: data }
    );
    const result = await res.json();
    if (!res.ok) {
      throw new Error('Error al subir la imagen a Cloudinary');
    }
    const publicId = result.public_id;
    return `${publicId}.${result.format}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ── Toggle helpers ──
  const toggleActivityType = (type: ActivityType) => {
    setActivityTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleWeekday = (day: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    setPreviewGenerated(false);
  };

  // ── Generador ──
  const handleGenerate = () => {
    const rows = generateOccurrences(
      repeatMode, startDate, endDate, timeStart, timeEnd, selectedPlaceId, customDates, selectedWeekdays
    );
    setOccurrences(rows);
    setPreviewGenerated(true);
  };

  const handleRemoveOccurrence = (key: string) => {
    setOccurrences((prev) => prev.filter((o) => o.key !== key));
  };

  const handleUpdateOccurrence = (key: string, field: keyof OccurrenceRow, value: string) => {
    setOccurrences((prev) =>
      prev.map((o) => (o.key === key ? { ...o, [field]: value } : o))
    );
  };

  const handleAddCustomDate = (date: string) => {
    if (date && !customDates.includes(date)) {
      setCustomDates((prev) => [...prev, date].sort());
    }
  };

  const handleRemoveCustomDate = (date: string) => {
    setCustomDates((prev) => prev.filter((d) => d !== date));
  };

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    if (occurrences.length === 0) {
      setError('Necesitás agregar al menos una fecha antes de guardar.');
      return;
    }
    if (occurrences.some((o) => !o.placeId)) {
      setError('Todas las fechas deben tener un lugar asignado.');
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedPhotoId = initialData?.photoId || '';

      // Si se cargó una nueva imagen local, se sube primero
      if (imageFile) {
        uploadedPhotoId = await uploadToCloudinary(imageFile);
      }

      const data: CreateEventInput = {
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        photoId: uploadedPhotoId || undefined,
        bgColor: formData.get('bgColor') as string || undefined,
        ticketUrl: formData.get('ticketUrl') as string || undefined,
        bookingWhatsapp: formData.get('bookingWhatsapp') as string || undefined,
        priceType,
        activityTypes,
        ageMin: Number(formData.get('ageMin')) || 0,
        ageMax: formData.get('ageMax') ? Number(formData.get('ageMax')) : null,
        isFeatured: formData.get('isFeatured') === 'on',
        occurrences: occurrences.map((o) => ({
          date: new Date(o.date + 'T00:00:00'),
          timeStart: o.timeStart,
          timeEnd: o.timeEnd || undefined,
          placeId: o.placeId,
        })),
        organizerIds: selectedOrganizerIds,
      };

      if (isEditing && initialData) {
        // En edición: actualizar datos del evento (las ocurrencias se editan en la tabla)
        const { occurrences: _occ, ...eventData } = data;
        const res = await updateEvent(initialData.id, eventData);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createEvent(data);
        if (!res.success) throw new Error(res.error);
      }
      router.push('/admin/eventos');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 font-bold rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* ── SECCIÓN 1: Datos generales ── */}
      <FormSection title="Datos del Evento">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="md:col-span-2">
            <InputLabel isRequired>Título</InputLabel>
            <input
              required
              name="title"
              type="text"
              defaultValue={initialData?.title}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none"
              placeholder="Ej. Circo del viento"
            />
          </div>

          <div className="md:col-span-2">
            <InputLabel>Descripción</InputLabel>
            <textarea
              name="description"
              rows={4}
              defaultValue={initialData?.description ?? ''}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none"
              placeholder="Descripción del evento..."
            />
          </div>



          {/* Organizadores/Artistas Registrados (Perfiles) */}
          <div className="md:col-span-2 border-t border-gray-100 pt-4">
            <InputLabel>Organizadores / Artistas Vinculados</InputLabel>
            <div className="mt-2">
              <SearchableOrganizerSelect
                organizers={currentOrganizers}
                value={selectedOrganizerIds}
                onChange={setSelectedOrganizerIds}
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECCIÓN: Destacados ── */}
      <FormSection title="Destacados">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">

          {/* Destacar Evento en el tope del diseño */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors w-full bg-white">
              <input
                name="isFeatured"
                type="checkbox"
                defaultChecked={initialData?.isFeatured}
                className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary shrink-0"
              />
              <div className="text-left leading-tight">
                <span className="text-sm font-bold text-gray-700 block">⭐ Destacar este evento</span>
                <span className="text-xs text-gray-400 block">Aparecerá destacado en la sección de recomendados</span>
              </div>
            </label>
          </div>

          {/* Imagen de Evento */}
          <div className="md:col-span-2">
            <InputLabel>Imagen del Evento</InputLabel>
            <div className="flex flex-col md:flex-row gap-4 items-center p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-brand-primary transition-all bg-white/55">
              {imagePreview && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-bold text-gray-700">Seleccioná o arrastrá una imagen</p>
                <p className="text-xs text-gray-500 mt-1 mb-3">Recomendado format .webp para mejor optimización</p>
                <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold text-xs rounded-xl border border-brand-primary/20 transition-all">
                  Elegir Archivo
                  <input
                    type="file"
                    accept=".webp, image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ¿Querés optimizar la imagen?{' '}
              <a
                href="https://squoosh.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary font-bold hover:underline"
              >
                Transformar o convertir imagen ↗
              </a>
            </p>
          </div>

          {/* Paleta de Color */}
          <div className="md:col-span-2 border-t border-gray-100 pt-6">
            <InputLabel>Color de fondo para el Calendario</InputLabel>
            <div className="flex flex-col lg:flex-row items-center gap-8 mt-2 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">

              <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm w-full lg:w-auto">

                {/* Columnas de Tonos */}
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
                  {[
                    { name: "Rojo", shades: ["#FCA5A5", "#EF4444", "#B91C1C", "#7F1D1D"] },
                    { name: "Naranja", shades: ["#FDBA74", "#F97316", "#C2410C", "#7C2D12"] },
                    { name: "Amarillo", shades: ["#FDE047", "#EAB308", "#A16207", "#713F12"] },
                    { name: "Verde", shades: ["#86EFAC", "#22C55E", "#15803D", "#14532D"] },
                    { name: "Turquesa", shades: ["#6EE7B7", "#0D9488", "#0F766E", "#115E59"] },
                    { name: "Celeste/Azul", shades: ["#93C5FD", "#3B82F6", "#1D4ED8", "#172554"] },
                    { name: "Lila/Azul", shades: ["#A5B4FC", "#6366F1", "#4338CA", "#1E1B4B"] },
                    { name: "Rosa", shades: ["#FBCFE8", "#EC4899", "#BE185D", "#831843"] },
                    { name: "Violeta", shades: ["#D8B4FE", "#A855F7", "#7E22CE", "#4C1D95"] }
                  ].map((column, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-0 shrink-0">
                      {column.shades.map((hex, shadeIdx) => {
                        const isSelected = selectedColor.toLowerCase() === hex.toLowerCase();
                        const isTop = shadeIdx === 0;
                        const isBottom = shadeIdx === column.shades.length - 1;
                        return (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => setSelectedColor(hex)}
                            style={{ backgroundColor: hex }}
                            className={`w-8 h-8 md:w-9 md:h-9 transition-all active:scale-90 relative cursor-pointer
                              ${isTop ? 'rounded-t-xl' : ''} 
                              ${isBottom ? 'rounded-b-xl' : ''}
                              ${isSelected ? 'scale-105 z-10 shadow-lg border-2 border-slate-800 ring-1 ring-white/50' : 'hover:scale-[1.03]'}
                            `}
                            title={`${column.name} - Tono ${shadeIdx + 1}`}
                          >
                            {isSelected && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-white rounded-full shadow-xs" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Personalizado debajo del selector */}
                <div className="flex flex-col items-center gap-2 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 w-full md:w-auto justify-center">
                  <div className="relative shrink-0">
                    <div
                      style={{ backgroundColor: selectedColor }}
                      className="w-16 h-16 rounded-2xl border-2 border-slate-200 shadow-md transition-all duration-300"
                    />
                    <input
                      name="bgColor"
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      title="Ajuste fino personalizado"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Personalizado</span>
                    <span className="text-xs font-bold text-gray-600 block font-mono">{selectedColor}</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECCIÓN 2: Clasificación ── */}
      <FormSection title="Clasificación">
        <div className="space-y-6">

          <div>
            <InputLabel>Tipo de actividad</InputLabel>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleActivityType(id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${activityTypes.includes(id)
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <InputLabel>Edad recomendada</InputLabel>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mínima (ej: 0.5 para 6 meses, 2 para 2 años)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="ageMin"
                  value={ageMin}
                  onChange={(e) => setAgeMin(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Máxima (dejar vacío si no tiene límite)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="ageMax"
                  value={ageMax ?? ''}
                  onChange={(e) => setAgeMax(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <InputLabel>Tipo de entrada</InputLabel>
            <div className="flex flex-wrap gap-2 mb-4">
              {EVENT_PRICES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPriceType(id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${priceType === id
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Links para Entradas y Reservas en Clasificación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Link para Entradas / Tickets (Opcional)</label>
                <input
                  name="ticketUrl"
                  type="url"
                  defaultValue={initialData?.ticketUrl ?? ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                  placeholder="https://ejemplo.com/entradas"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">WhatsApp para Reservas (Opcional)</label>
                <input
                  name="bookingWhatsapp"
                  type="text"
                  defaultValue={initialData?.bookingWhatsapp ?? ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                  placeholder="Ej. +5493512345678"
                />
              </div>
            </div>
          </div>

        </div>
      </FormSection>

      {/* ── SECCIÓN 3: Fechas y lugares ── */}
      <FormSection title="Fechas y Lugares">
        <div className="space-y-6">

          {/* Modo de repetición */}
          <div>
            <InputLabel isRequired>Tipo de carga</InputLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {([
                { mode: 'once', label: 'Una sola vez' },
                { mode: 'weekly', label: 'Semanal' },
                { mode: 'daily', label: 'Diario' },
                { mode: 'custom', label: 'Personalizado' },
              ] as { mode: RepeatMode; label: string }[]).map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setRepeatMode(mode);
                    setPreviewGenerated(false);
                    setOccurrences([]);
                  }}
                  className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${repeatMode === mode
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de días de la semana para modo semanal */}
          {repeatMode === 'weekly' && (
            <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10">
              <label className="block text-xs font-bold text-brand-primary mb-2 uppercase tracking-wider">
                Días de la semana que se repite:
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  { val: 1, label: 'Lunes' },
                  { val: 2, label: 'Martes' },
                  { val: 3, label: 'Miércoles' },
                  { val: 4, label: 'Jueves' },
                  { val: 5, label: 'Viernes' },
                  { val: 6, label: 'Sábado' },
                  { val: 0, label: 'Domingo' },
                ]).map(({ val, label }) => {
                  const isSelected = selectedWeekdays.includes(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => toggleWeekday(val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-brand-primary/40'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                *Si no seleccionás ninguno, se usará el día de la semana de la fecha de inicio.
              </p>
            </div>
          )}

          {/* Campos según modo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <InputLabel isRequired>
                {repeatMode === 'once' ? 'Fecha' : 'Fecha inicio'}
              </InputLabel>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPreviewGenerated(false); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>

            {(repeatMode === 'weekly' || repeatMode === 'daily') && (
              <div>
                <InputLabel isRequired>Fecha fin</InputLabel>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPreviewGenerated(false); }}
                  min={startDate}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
            )}

            <div>
              <InputLabel isRequired>Hora de inicio</InputLabel>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => { setTimeStart(e.target.value); setPreviewGenerated(false); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>

            <div>
              <InputLabel>Hora de fin (opcional)</InputLabel>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => { setTimeEnd(e.target.value); setPreviewGenerated(false); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <InputLabel isRequired>Lugar</InputLabel>
              <SearchablePlaceSelect
                places={currentPlaces}
                value={selectedPlaceId}
                onChange={(val) => { setSelectedPlaceId(val); setPreviewGenerated(false); }}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                ¿No está el lugar?{' '}
                <Link href="/admin/lugares/nuevo" target="_blank" className="text-brand-primary font-bold hover:underline">
                  Crear nuevo lugar ↗
                </Link>
              </p>
            </div>
          </div>

          {/* Selector de fechas personalizadas */}
          {repeatMode === 'custom' && (
            <div>
              <InputLabel>Fechas seleccionadas</InputLabel>
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddCustomDate(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {customDates.map((d) => (
                  <span
                    key={d}
                    className="flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary text-sm font-bold rounded-full"
                  >
                    {dayjs(d).format('DD/MM/YYYY')}
                    <button type="button" onClick={() => handleRemoveCustomDate(d)} className="hover:text-red-500 ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botón generar */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              !startDate || !timeStart || !selectedPlaceId ||
              ((repeatMode === 'weekly' || repeatMode === 'daily') && !endDate) ||
              (repeatMode === 'custom' && customDates.length === 0)
            }
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-black rounded-xl border-2 border-brand-primary/20 hover:border-brand-primary/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Calendar className="w-4 h-4" />
            Generar fechas
          </button>

          {/* Preview de ocurrencias */}
          {previewGenerated && occurrences.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No se generaron fechas. Revisá los datos ingresados.</p>
          )}

          {occurrences.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-black text-gray-700 uppercase tracking-wide">
                  {occurrences.length} fecha{occurrences.length !== 1 ? 's' : ''} generada{occurrences.length !== 1 ? 's' : ''}
                </p>
                <button
                  type="button"
                  onClick={() => setOccurrences((prev) => [
                    ...prev,
                    { key: `manual-${Date.now()}`, date: '', timeStart, timeEnd, placeId: selectedPlaceId }
                  ])}
                  className="flex items-center gap-1 text-xs text-brand-primary font-bold hover:underline"
                >
                  <Plus className="w-3 h-3" /> Agregar fecha manualmente
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {occurrences.map((o) => (
                  <div
                    key={o.key}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <input
                      type="date"
                      value={o.date}
                      onChange={(e) => handleUpdateOccurrence(o.key, 'date', e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                    />
                    <input
                      type="time"
                      value={o.timeStart}
                      onChange={(e) => handleUpdateOccurrence(o.key, 'timeStart', e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                    />
                    <input
                      type="time"
                      value={o.timeEnd}
                      onChange={(e) => handleUpdateOccurrence(o.key, 'timeEnd', e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                    />
                    <SearchablePlaceSelect
                      places={currentPlaces}
                      value={o.placeId}
                      onChange={(val) => handleUpdateOccurrence(o.key, 'placeId', val)}
                      placeholder="— Lugar —"
                      className="min-w-[200px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOccurrence(o.key)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* ── Footer ── */}
      <div className="flex justify-between items-center pt-2">
        <Link
          href="/admin/eventos"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || occurrences.length === 0}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-3 rounded-2xl font-black tracking-wide transition-all shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Guardando...' : `Guardar evento (${occurrences.length} fecha${occurrences.length !== 1 ? 's' : ''})`}
        </button>
      </div>
    </form>
  );
}
