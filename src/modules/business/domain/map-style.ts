// Pure rules for the public map's look (ADR-020). No I/O: the UI fetches the style JSON
// and passes it through here before handing it to MapLibre.

/** The part of a MapLibre style layer these rules read or change. */
export type StyleLayer = {
  id: string;
  type: string;
  "source-layer"?: string;
  layout?: Record<string, unknown>;
  paint?: Record<string, unknown>;
  [key: string]: unknown;
};

export type MapStyle = { layers: StyleLayer[]; [key: string]: unknown };

/** OpenFreeMap's minimal style; the shop's pin is the only point of interest we show. */
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/** Vector-tile layers with other businesses and points of interest. */
const HIDDEN_SOURCE_LAYERS = new Set(["poi", "aerodrome_label", "housenumber", "mountain_peak"]);

/** Local (Turkish) name first; the style itself prefers English names. */
const TURKISH_LABEL = ["coalesce", ["get", "name:tr"], ["get", "name"]];

const showsName = (textField: unknown) => JSON.stringify(textField ?? null).includes('"name');

/**
 * Returns a copy of the style without points of interest, with place and street
 * labels in Turkish and, optionally, a brand-coloured background.
 */
export function prepareMapStyle<S extends MapStyle>(
  style: S,
  options: { background?: string } = {},
): S {
  const layers = style.layers
    .filter((layer) => !HIDDEN_SOURCE_LAYERS.has(layer["source-layer"] ?? ""))
    .map((layer) => {
      if (layer.type === "background" && options.background) {
        return { ...layer, paint: { ...layer.paint, "background-color": options.background } };
      }
      if (layer.type === "symbol" && showsName(layer.layout?.["text-field"])) {
        return { ...layer, layout: { ...layer.layout, "text-field": TURKISH_LABEL } };
      }
      return layer;
    });
  return { ...style, layers };
}

/** True when the profile has a complete, plausible map position. */
export function hasLocation(profile: {
  latitude: number | null;
  longitude: number | null;
}): profile is { latitude: number; longitude: number } {
  const { latitude: lat, longitude: lng } = profile;
  return (
    lat !== null &&
    lng !== null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}
