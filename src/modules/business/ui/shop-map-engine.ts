// Loaded on demand by ShopMap (dynamic import), so MapLibre's ~1 MB of JS and its CSS
// stay out of the first page load. Client-only: it touches the DOM and WebGL.
import { Map, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL, prepareMapStyle, type MapStyle } from "../domain/map-style";

/** Copied from node_modules by scripts/copy-maplibre-worker.mjs before dev and build. */
const WORKER_URL = "/vendor/maplibre-gl-worker.js";

/** neutral-bg from globals.css, so the map sits in the page palette. */
const MAP_BACKGROUND = "#faf6f1";

const TURKISH_UI = {
  "AttributionControl.ToggleAttribution": "Harita kaynaklarını göster veya gizle",
  "CooperativeGesturesHandler.WindowsHelpText":
    "Haritayı yakınlaştırmak için Ctrl + kaydırma kullanın",
  "CooperativeGesturesHandler.MacHelpText": "Haritayı yakınlaştırmak için ⌘ + kaydırma kullanın",
  "CooperativeGesturesHandler.MobileHelpText": "Haritayı kaydırmak için iki parmağınızı kullanın",
  "Map.Title": "Sniff Pet Kuaför'ün haritadaki konumu",
  "Marker.Title": "Sniff Pet Kuaför",
  "NavigationControl.ZoomIn": "Yakınlaştır",
  "NavigationControl.ZoomOut": "Uzaklaştır",
};

// Navy pin with a cream paw (brand colours). A fixed string, parsed as SVG: no user data.
const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 60" width="48" height="60" aria-hidden="true">
  <path fill="#07152b" d="M24 0C10.7 0 0 10.5 0 23.5 0 40 24 60 24 60s24-20 24-36.5C48 10.5 37.3 0 24 0z"/>
  <g fill="#f5e1ce">
    <ellipse cx="14.5" cy="19" rx="3" ry="4.2" transform="rotate(-24 14.5 19)"/>
    <ellipse cx="20.5" cy="13.5" rx="3.2" ry="4.6" transform="rotate(-8 20.5 13.5)"/>
    <ellipse cx="27.5" cy="13.5" rx="3.2" ry="4.6" transform="rotate(8 27.5 13.5)"/>
    <ellipse cx="33.5" cy="19" rx="3" ry="4.2" transform="rotate(24 33.5 19)"/>
    <path d="M24 21c-4.6 0-9.8 5.3-9.8 10.2 0 3.5 2.8 5.3 5.6 4.6 1.8-.5 2.8-1.4 4.2-1.4s2.4.9 4.2 1.4c2.8.7 5.6-1.1 5.6-4.6 0-4.9-5.2-10.2-9.8-10.2z"/>
  </g>
</svg>`;

function pinElement(): HTMLElement {
  const wrapper = document.createElement("div");
  const svg = new DOMParser().parseFromString(PIN_SVG, "image/svg+xml").documentElement;
  wrapper.append(document.importNode(svg, true));
  return wrapper;
}

/** Draws the map with one pin; returns a cleanup function. Throws if the style can't load. */
export async function mountShopMap(
  container: HTMLElement,
  { latitude, longitude }: { latitude: number; longitude: number },
): Promise<() => void> {
  const response = await fetch(MAP_STYLE_URL);
  if (!response.ok) throw new Error(`map style: HTTP ${response.status}`);
  const style = prepareMapStyle((await response.json()) as MapStyle, {
    background: MAP_BACKGROUND,
  });

  setWorkerUrl(WORKER_URL);
  const center: [number, number] = [longitude, latitude];
  const map = new Map({
    container,
    // The prepared JSON is a valid StyleSpecification; MapLibre validates it at runtime.
    style: style as unknown as ConstructorParameters<typeof Map>[0]["style"],
    center,
    zoom: 15.5,
    minZoom: 11,
    maxZoom: 18,
    cooperativeGestures: true,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    attributionControl: { compact: true },
    locale: TURKISH_UI,
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new NavigationControl({ showCompass: false }), "top-right");
  new Marker({ element: pinElement(), anchor: "bottom" }).setLngLat(center).addTo(map);

  return () => map.remove();
}
