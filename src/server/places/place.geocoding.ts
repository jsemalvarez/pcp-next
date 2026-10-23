import { siteUrl } from "@/server/oauth/oauth.config";

/**
 * Geocodificación de direcciones con Nominatim (OpenStreetMap), para que el MCP pueda
 * crear lugares sin que la IA invente coordenadas. Uso liviano (un pedido por lugar nuevo),
 * dentro de la política de Nominatim: User-Agent propio y sin pedidos en lote.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const TIMEOUT_MS = 5000;
// Partido de General Pueyrredon (Mar del Plata y alrededores): da prioridad a resultados de la zona
const PREFERRED_VIEWBOX = "-57.85,-37.85,-57.45,-38.15";

export interface GeocodeResult {
  lat: number;
  lng: number;
  /** Dirección completa según OpenStreetMap, para que el usuario confirme que es la correcta */
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    q: address,
    format: "jsonv2",
    limit: "1",
    countrycodes: "ar",
    viewbox: PREFERRED_VIEWBOX,
    "accept-language": "es",
  });

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { "User-Agent": `PaseosConPeques/1.0 (+${siteUrl()})` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[geocoding] Nominatim respondió", res.status);
      return null;
    }
    const results = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    const first = results[0];
    if (!first) return null;
    return { lat: Number(first.lat), lng: Number(first.lon), displayName: first.display_name };
  } catch (error) {
    console.error("[geocoding] Error", error);
    return null;
  }
}

export function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
