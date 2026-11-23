import { describe, expect, it } from "vitest";
import { businessProfileSchema } from "./schemas";

const base = {
  business_name: "Sniff Pet Kuaför",
  slogan: "",
  address: "Gölbaşı, Ankara",
  maps_url: "",
  instagram_url: "",
  phone_e164: "",
  whatsapp_e164: "",
  email: "",
  latitude: "",
  longitude: "",
};

describe("businessProfileSchema", () => {
  it("turns empty optional fields into null and phones into E.164", () => {
    const result = businessProfileSchema.parse({
      ...base,
      phone_e164: "0532 123 45 67",
      whatsapp_e164: "+90 532 765 43 21",
      latitude: "39,797668",
      longitude: "32.8024741",
    });
    expect(result).toMatchObject({
      slogan: null,
      maps_url: null,
      phone_e164: "+905321234567",
      whatsapp_e164: "+905327654321",
      latitude: 39.797668,
      longitude: 32.802474,
    });
  });

  it("explains each wrong field in Turkish", () => {
    const result = businessProfileSchema.safeParse({
      ...base,
      business_name: " ",
      phone_e164: "123",
      email: "nope",
      maps_url: "http://maps.example",
      instagram_url: "https://facebook.com/x",
      latitude: "200",
      longitude: "32",
    });
    expect(result.success).toBe(false);
    const byField = Object.fromEntries(result.error!.issues.map((i) => [i.path[0], i.message]));
    expect(byField).toMatchObject({
      business_name: "İşletme adını girin.",
      phone_e164: expect.stringContaining("telefon"),
      email: "Geçerli bir e-posta adresi girin.",
      maps_url: expect.stringContaining("https://"),
      instagram_url: expect.stringContaining("Instagram"),
      latitude: expect.stringContaining("koordinat"),
    });
  });

  it("needs latitude and longitude together", () => {
    const result = businessProfileSchema.safeParse({ ...base, latitude: "39.79" });
    expect(result.error?.issues[0]).toMatchObject({ path: ["longitude"] });
  });
});
