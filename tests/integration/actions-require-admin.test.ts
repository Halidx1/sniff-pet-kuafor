// PLAN §9, T5: Server Actions are public HTTP endpoints. This test finds every exported
// action in every module and calls it without a session: each must stop at
// requireAdmin() (a redirect to sign-in) before touching any data.
// Only the sign-in steps themselves may run without an admin; they're listed below.
import { beforeEach, describe, expect, it, vi } from "vitest";

// No cookies = no session. headers() for actions that build absolute URLs.
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: () => {}, get: () => undefined }),
  headers: async () => new Headers({ host: "localhost:3000" }),
}));
class Redirect extends Error {
  constructor(public readonly to: string) {
    super(`redirect ${to}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Redirect(to);
  },
}));
vi.mock("next/server", async (original) => ({
  ...(await original<typeof import("next/server")>()),
  connection: async () => {},
}));
vi.mock("next/cache", () => ({
  updateTag: vi.fn(),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

/** Actions that must work without an admin session: they *are* the way in. */
const PUBLIC_ACTIONS = new Set([
  "identity.signIn",
  "identity.verifyCode",
  "identity.startSetup",
  "identity.confirmSetup",
  "identity.requestPasswordReset",
  "identity.signOut",
]);

const modules = import.meta.glob<Record<string, unknown>>("/src/modules/*/actions.ts");

const actions = await Promise.all(
  Object.entries(modules).map(async ([path, load]) => {
    const name = path.split("/")[3];
    const exports = await load();
    return Object.entries(exports)
      .filter(([, value]) => typeof value === "function")
      .map(([fn, value]) => ({
        id: `${name}.${fn}`,
        fn: value as (...args: unknown[]) => unknown,
      }));
  }),
).then((lists) => lists.flat());

describe("every Server Action without a session", () => {
  beforeEach(() => vi.clearAllMocks());

  it("finds the actions (the glob still matches)", () => {
    expect(actions.length).toBeGreaterThan(PUBLIC_ACTIONS.size);
  });

  it("lists only actions that exist as public", () => {
    const ids = new Set(actions.map((a) => a.id));
    for (const id of PUBLIC_ACTIONS) expect(ids, id).toContain(id);
  });

  for (const { id, fn } of actions.filter((a) => !PUBLIC_ACTIONS.has(a.id))) {
    it(`${id} is rejected (redirect to sign-in)`, async () => {
      const call = fn({}, new FormData());
      await expect(call).rejects.toBeInstanceOf(Redirect);
      await expect(call).rejects.toMatchObject({ to: "/admin/giris" });
    });
  }
});
