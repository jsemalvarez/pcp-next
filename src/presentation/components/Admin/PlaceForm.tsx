"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPlace, updatePlace } from "@/actions/places";
import { PlaceCategory } from "@prisma/client";
import { Place } from "@/domain/entities/Place";
import { CATEGORIES_TRANSLATE } from "@/presentation/constants/categories";
import { Save, ArrowLeft, Search, MapPin } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => <div className="w-full h-[350px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">Cargando mapa...</div>
});

interface PlaceFormProps {
  initialData?: Place;
}

const InputLabel = ({ children, isRequired }: { children: React.ReactNode; isRequired?: boolean }) => (
  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
    {children}
    {isRequired && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-white/50 border border-brand-primary/10 rounded-2xl p-6 mb-8 shadow-sm">
    <h3 className="text-xl font-black text-brand-primary mb-6">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

export function PlaceForm({ initialData }: PlaceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isGeocoding, setIsGeocoding] = useState(false);
  const addressRef = useRef<HTMLInputElement>(null);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);

  const [mapCenter, setMapCenter] = useState<[number, number]>([
    initialData?.lat || -38.0055,
    initialData?.lng || -57.5426
  ]);

  const geocodeAddress = async () => {
    if (!addressRef.current?.value) return;
    setIsGeocoding(true);
    try {
      let originalQuery = addressRef.current.value.trim();
      let query = originalQuery;
      
      // Si el usuario no especificó una ciudad conocida de la zona, asumimos Mar del Plata
      if (!query.match(/mar del plata|miramar|balcarce|tandil|santa clara|bat[aá]n/i)) {
        query += ", Mar del Plata";
      }
      if (!query.toLowerCase().includes("argentina")) {
        query += ", Argentina";
      }
      
      const fetchCoords = async (q: string) => {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
        return await res.json();
      };

      let data = await fetchCoords(query);
      
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        if (latRef.current) latRef.current.value = newLat.toString();
        if (lngRef.current) lngRef.current.value = newLng.toString();
        setMapCenter([newLat, newLng]);
      } else {
        // Fallback: remover los números de la calle por si la altura exacta no está mapeada
        const fallbackQuery = originalQuery.replace(/\d+/g, '').trim() + ", Mar del Plata, Argentina";
        data = await fetchCoords(fallbackQuery);
        
        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          if (latRef.current) latRef.current.value = newLat.toString();
          if (lngRef.current) lngRef.current.value = newLng.toString();
          setMapCenter([newLat, newLng]);
          alert("📍 No se encontró la altura exacta en el mapa libre, así que colocamos una ubicación aproximada de esa calle. Podés ajustar los números a mano si querés ser más preciso.");
        } else {
          alert("No se encontró la ubicación. Intentá simplificar el nombre de la calle.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Hubo un error de conexión al buscar la ubicación.");
    } finally {
      setIsGeocoding(false);
    }
  };

  // Parse categories properly
  const [selectedCategories, setSelectedCategories] = useState<PlaceCategory[]>(initialData?.categories || []);
  const [ageMin, setAgeMin] = useState<number>(initialData?.ageMin ?? 0);
  const [ageMax, setAgeMax] = useState<number | null>(initialData?.ageMax ?? null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      lat: parseFloat(formData.get("lat") as string) || 0,
      lng: parseFloat(formData.get("lng") as string) || 0,
      isActive: formData.get("isActive") === "on",
      isShowInMap: formData.get("isShowInMap") === "on",
      hasCustomIcon: formData.get("hasCustomIcon") === "on",
      customIconName: formData.get("customIconName") as string,
      schedules: formData.get("schedules") as string,
      phone: formData.get("phone") as string,
      whatsapp: formData.get("whatsapp") as string,
      photoUrl: formData.get("photoUrl") as string,
      web: formData.get("web") as string,
      instagram: formData.get("instagram") as string,
      facebook: formData.get("facebook") as string,
      videoLink: formData.get("videoLink") as string,
      hasFood: formData.get("hasFood") === "on",
      hasShow: formData.get("hasShow") === "on",
      hasGames: formData.get("hasGames") === "on",
      hasSupervision: formData.get("hasSupervision") === "on",
      isFeatured: formData.get("isFeatured") === "on",
      description: formData.get("description") as string,
      iconType: formData.get("iconType") as string,
      bgColor: formData.get("bgColor") as string,
      categories: selectedCategories,
      ageMin: Number(formData.get("ageMin")) || 0,
      ageMax: formData.get("ageMax") ? Number(formData.get("ageMax")) : null,
    };

    try {
      if (initialData?.id) {
        const res = await updatePlace(initialData.id, data);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createPlace(data);
        if (!res.success) throw new Error(res.error);
      }
      
      router.push("/admin/lugares");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error al guardar.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 font-bold rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Información Básica */}
      <FormSection title="Información Básica">
        <div className="md:col-span-2">
          <InputLabel isRequired>Nombre del Lugar</InputLabel>
          <input required defaultValue={initialData?.name} name="name" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" placeholder="Ej. Parque de las Tejas" />
        </div>
        
        <div className="md:col-span-2">
          <InputLabel>Descripción Corta</InputLabel>
          <textarea defaultValue={initialData?.description ?? undefined} name="description" rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" placeholder="Breve descripción del lugar..." />
        </div>

        <div className="md:col-span-2">
          <InputLabel>Categorías</InputLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(CATEGORIES_TRANSLATE) as PlaceCategory[]).map((categoryKey) => {
              const label = CATEGORIES_TRANSLATE[categoryKey];
              const isChecked = selectedCategories.includes(categoryKey);
              return (
                <label key={categoryKey} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, categoryKey]);
                      } else {
                        setSelectedCategories(selectedCategories.filter(c => c !== categoryKey));
                      }
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm font-bold text-gray-700">{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <InputLabel>Edad Mínima</InputLabel>
            <input
              type="number"
              step="0.1"
              min="0"
              name="ageMin"
              value={ageMin}
              onChange={e => setAgeMin(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none"
              placeholder="Ej. 0.5 para 6 meses"
            />
          </div>
          <div>
            <InputLabel>Edad Máxima</InputLabel>
            <input
              type="number"
              step="0.1"
              min="0"
              name="ageMax"
              value={ageMax ?? ""}
              onChange={e => setAgeMax(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none"
              placeholder="Vacio para sin límite"
            />
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <input defaultChecked={initialData?.hasFood} name="hasFood" type="checkbox" className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
            <span className="text-sm font-bold text-gray-700">Tiene Comida</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <input defaultChecked={initialData?.hasShow} name="hasShow" type="checkbox" className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
            <span className="text-sm font-bold text-gray-700">Tiene Show</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <input defaultChecked={initialData?.hasGames} name="hasGames" type="checkbox" className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
            <span className="text-sm font-bold text-gray-700">Tiene Juegos</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <input defaultChecked={initialData?.hasSupervision} name="hasSupervision" type="checkbox" className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
            <span className="text-sm font-bold text-gray-700">Supervisión</span>
          </label>
        </div>
      </FormSection>

      {/* Estado del Lugar */}
      <FormSection title="Estado del Lugar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-green-50 cursor-pointer transition-colors">
            <input defaultChecked={initialData?.isActive ?? true} name="isActive" type="checkbox" className="w-6 h-6 rounded border-gray-300 text-green-600 focus:ring-green-600" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-gray-800">Lugar Activo</span>
              <span className="text-xs text-gray-500 font-medium">Visible para el público.</span>
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-4 border border-yellow-200 bg-yellow-50/50 rounded-xl hover:bg-yellow-100/50 cursor-pointer transition-colors">
            <input defaultChecked={initialData?.isFeatured} name="isFeatured" type="checkbox" className="w-6 h-6 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-yellow-800">Destacado ★</span>
              <span className="text-xs text-yellow-600/80 font-medium">Aparecerá en los recomendados de inicio.</span>
            </div>
          </label>
        </div>
      </FormSection>

      {/* Ubicación */}
      <FormSection title="Ubicación (Geolocalización)">
        <div className="md:col-span-2">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <InputLabel isRequired>Dirección</InputLabel>
              <input ref={addressRef} required defaultValue={initialData?.address} name="address" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" placeholder="Ej. Av. Chacabuco 1200" />
            </div>
            <button
              type="button"
              onClick={geocodeAddress}
              disabled={isGeocoding}
              className="mb-0 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-3 rounded-xl font-bold transition-all disabled:opacity-70 whitespace-nowrap"
              title="Buscar coordenadas de esta dirección"
            >
              {isGeocoding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MapPin className="w-5 h-5" />}
              <span className="hidden sm:inline">Buscar lat/long</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Escribí la dirección y tocá el botón para autocompletar las coordenadas exactas.</p>
        </div>
        
        <div>
          <InputLabel isRequired>Latitud</InputLabel>
          <input ref={latRef} required defaultValue={initialData?.lat} name="lat" type="number" step="any" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none bg-gray-50/50" placeholder="-31.4285" />
        </div>

        <div>
          <InputLabel isRequired>Longitud</InputLabel>
          <input ref={lngRef} required defaultValue={initialData?.lng} name="lng" type="number" step="any" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none bg-gray-50/50" placeholder="-64.1873" />
        </div>

        <div className="md:col-span-2 mt-4">
          <InputLabel>Ajuste Manual en Mapa</InputLabel>
          <p className="text-xs text-gray-500 mb-3">Si la dirección no es exacta o es un lugar sin calle (ej: Estatua, Parque), podés mover el pin rojo o hacer clic en el mapa para ubicar el lugar manualmente.</p>
          <LocationPickerMap 
            lat={mapCenter[0]} 
            lng={mapCenter[1]} 
            onPositionChange={(newLat, newLng) => {
              if (latRef.current) latRef.current.value = newLat.toString();
              if (lngRef.current) lngRef.current.value = newLng.toString();
            }} 
          />
        </div>
      </FormSection>

      {/* Contacto e Información */}
      <FormSection title="Contacto y Redes">
        <div>
          <InputLabel>Horarios</InputLabel>
          <input defaultValue={initialData?.schedules ?? undefined} name="schedules" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" placeholder="Ej. Lun a Vie 9:00 - 18:00" />
        </div>
        <div>
          <InputLabel>Teléfono</InputLabel>
          <input defaultValue={initialData?.phone ?? undefined} name="phone" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" />
        </div>
        <div>
          <InputLabel>WhatsApp</InputLabel>
          <input defaultValue={initialData?.whatsapp ?? undefined} name="whatsapp" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" />
        </div>
        <div>
          <InputLabel>Sitio Web</InputLabel>
          <input defaultValue={initialData?.web ?? undefined} name="web" type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" />
        </div>
        <div>
          <InputLabel>Instagram</InputLabel>
          <input defaultValue={initialData?.instagram ?? undefined} name="instagram" type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" />
        </div>
        <div>
          <InputLabel>Facebook</InputLabel>
          <input defaultValue={initialData?.facebook ?? undefined} name="facebook" type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" />
        </div>
        <div>
          <InputLabel>Link a nuestro Reel (Instagram)</InputLabel>
          <input defaultValue={initialData?.videoLink ?? undefined} name="videoLink" type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" placeholder="https://www.instagram.com/reel/..." />
        </div>
      </FormSection>

      {/* Diseño y Mapa */}
      <FormSection title="Diseño Visual y Mapa">
        <div>
          <InputLabel>URL de Foto Principal</InputLabel>
          <input defaultValue={initialData?.photoUrl ?? undefined} name="photoUrl" type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" placeholder="https://..." />
        </div>
        
        <div>
          <InputLabel>Categoría / Color del Pin</InputLabel>
          <select defaultValue={initialData?.bgColor ?? undefined} name="bgColor" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none bg-white">
            <option value="">Seleccionar color / categoría...</option>
            <option value="#F59E0B">Gastronomía (Naranja)</option>
            <option value="#06B6D4">Aire Libre / Paseos (Celeste)</option>
            <option value="#8B5CF6">Cultura / Interior (Morado)</option>
            <option value="#EC4899">Eventos Especiales (Rosa)</option>
            <option value="#10B981">Naturaleza / Parques (Verde)</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">El color de fondo define la característica general del lugar.</p>
        </div>

        <div>
          <InputLabel>Tipo de Icono</InputLabel>
          <select defaultValue={initialData?.iconType ?? undefined} name="iconType" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none bg-white">
            <option value="">Seleccionar icono...</option>
            <option value="fork-knife">Tenedor y Cuchillo (Restaurante)</option>
            <option value="coffee">Taza (Cafetería / Merienda)</option>
            <option value="camera">Cámara (Selfie point / Visual)</option>
            <option value="museum">Edificio Clásico (Museo / Cultura)</option>
            <option value="castle">Castillo (Juegos Infantiles)</option>
            <option value="food-truck">Camión (Food Truck)</option>
            <option value="tree">Árbol (Plaza / Parque)</option>
            <option value="door">Puerta (Ingreso)</option>
            <option value="custom">Sin icono (Usar Logo Personalizado)</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">El icono central define el tipo específico de actividad.</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-gray-100 pt-6">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <input defaultChecked={initialData?.isShowInMap ?? true} name="isShowInMap" type="checkbox" className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
            <span className="text-sm font-bold text-gray-700">Mostrar este lugar en el Mapa</span>
          </label>
          
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <input defaultChecked={initialData?.hasCustomIcon} name="hasCustomIcon" type="checkbox" className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
            <span className="text-sm font-bold text-gray-700">Usar Icono Personalizado (Logo)</span>
          </label>

          <div className="md:col-span-2 mt-2">
            <InputLabel>Nombre de Icono Personalizado (si está marcado arriba)</InputLabel>
            <input defaultValue={initialData?.customIconName ?? undefined} name="customIconName" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none" placeholder="Ej. logo_mr_fly" />
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end gap-4 border-t border-gray-200 pt-8">
        <Link 
          href="/admin/lugares"
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          CANCELAR
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-3 rounded-xl font-black tracking-wide transition-all shadow-lg hover:shadow-brand-primary/30 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
        >
          <Save className={`w-5 h-5 ${isSubmitting ? 'animate-spin' : ''}`} />
          {isSubmitting ? 'GUARDANDO...' : 'GUARDAR LUGAR'}
        </button>
      </div>

    </form>
  );
}
