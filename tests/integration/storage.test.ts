import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { service, visitor } from "./clients";

const bucket = "media";
const prefix = `gallery/${randomUUID()}`;
const uploaded: string[] = [];
const tinyWebp = Buffer.from("UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==", "base64"); // 1×1 px

// The bucket enforces its limits for every uploader, even the secret key
// (threat T7); visitors can't list or upload (ADR-009).
describe("media storage bucket", () => {
  afterAll(async () => {
    if (uploaded.length) await service.storage.from(bucket).remove(uploaded);
  });

  it("accepts a small WebP and serves it at its public URL", async () => {
    const path = `${prefix}/480.webp`;
    const { error } = await service.storage
      .from(bucket)
      .upload(path, tinyWebp, { contentType: "image/webp" });
    expect(error).toBeNull();
    uploaded.push(path);

    const response = await fetch(service.storage.from(bucket).getPublicUrl(path).data.publicUrl);
    expect(response.status).toBe(200);
  });

  it("rejects SVG files, which can carry scripts", async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    );
    const { error } = await service.storage
      .from(bucket)
      .upload(`${prefix}/evil.svg`, svg, { contentType: "image/svg+xml" });
    expect(error).toMatchObject({ code: "InvalidMimeType" });
  });

  it("rejects files over 2 MB", async () => {
    const big = Buffer.alloc(2 * 1024 * 1024 + 1);
    const { error } = await service.storage
      .from(bucket)
      .upload(`${prefix}/big.jpg`, big, { contentType: "image/jpeg" });
    expect(error).toMatchObject({ code: "EntityTooLarge" });
  });

  it("does not let visitors list or upload files", async () => {
    const list = await visitor.storage.from(bucket).list(prefix.split("/")[0]);
    expect(list.data ?? []).toEqual([]);

    const upload = await visitor.storage
      .from(bucket)
      .upload(`${prefix}/960.webp`, tinyWebp, { contentType: "image/webp" });
    expect(upload.error).toMatchObject({ code: "AccessDenied" });
  });
});
