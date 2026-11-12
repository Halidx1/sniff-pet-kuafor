import { describe, expect, it } from "vitest";
import { hasLocation, prepareMapStyle, type MapStyle } from "./map-style";

const style: MapStyle = {
  version: 8,
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#fff" } },
    { id: "water", type: "fill", "source-layer": "water" },
    { id: "poi", type: "symbol", "source-layer": "poi", layout: { "text-field": ["get", "name"] } },
    { id: "airport", type: "symbol", "source-layer": "aerodrome_label" },
    { id: "housenumber", type: "symbol", "source-layer": "housenumber" },
    {
      id: "label_town",
      type: "symbol",
      "source-layer": "place",
      layout: { "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]], "text-size": 12 },
    },
    {
      id: "highway-shield",
      type: "symbol",
      "source-layer": "transportation_name",
      layout: { "text-field": ["get", "ref"] },
    },
  ],
};

describe("prepareMapStyle", () => {
  const ids = (s: MapStyle) => s.layers.map((l) => l.id);

  it("removes points of interest, airports and house numbers", () => {
    expect(ids(prepareMapStyle(style))).toEqual([
      "background",
      "water",
      "label_town",
      "highway-shield",
    ]);
  });

  it("labels places with their Turkish name and keeps other layout keys", () => {
    const town = prepareMapStyle(style).layers.find((l) => l.id === "label_town");
    expect(town?.layout).toEqual({
      "text-field": ["coalesce", ["get", "name:tr"], ["get", "name"]],
      "text-size": 12,
    });
  });

  it("leaves road-number shields alone", () => {
    const shield = prepareMapStyle(style).layers.find((l) => l.id === "highway-shield");
    expect(shield?.layout).toEqual({ "text-field": ["get", "ref"] });
  });

  it("recolours the background only when asked", () => {
    const bg = (s: MapStyle) => s.layers[0]?.paint?.["background-color"];
    expect(bg(prepareMapStyle(style))).toBe("#fff");
    expect(bg(prepareMapStyle(style, { background: "#faf6f1" }))).toBe("#faf6f1");
  });

  it("does not change the input style", () => {
    const before = JSON.stringify(style);
    prepareMapStyle(style, { background: "#000" });
    expect(JSON.stringify(style)).toBe(before);
  });
});

describe("hasLocation", () => {
  it("accepts a complete position", () => {
    expect(hasLocation({ latitude: 39.797668, longitude: 32.802474 })).toBe(true);
  });

  it("rejects missing or impossible positions", () => {
    expect(hasLocation({ latitude: null, longitude: null })).toBe(false);
    expect(hasLocation({ latitude: 39.8, longitude: null })).toBe(false);
    expect(hasLocation({ latitude: 91, longitude: 32 })).toBe(false);
    expect(hasLocation({ latitude: Number.NaN, longitude: 32 })).toBe(false);
  });
});
