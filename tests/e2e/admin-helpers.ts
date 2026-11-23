// Helpers for the admin E2E tests: a throwaway admin account on the LOCAL Supabase,
// TOTP codes like an authenticator app makes them, and the local Mailpit inbox.
import { createHmac } from "node:crypto";
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

if (existsSync(".env.local") && !process.env.SUPABASE_SECRET_KEY) process.loadEnvFile(".env.local");
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const DB_URL =
  process.env.SUPABASE_DB_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const MAILPIT = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

function assertLocal() {
  if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(SUPABASE_URL)) {
    throw new Error(
      `admin E2E only runs against the local Supabase, not ${SUPABASE_URL || "(unset)"}`,
    );
  }
}

/** Creates (or recreates) a confirmed user and lists it in private.admins. */
export async function createAdmin(email: string, password: string, displayName: string) {
  assertLocal();
  const sql = postgres(DB_URL, { max: 1 });
  try {
    // A leftover account from an earlier run (cascades to private.admins and its factors).
    await sql`delete from auth.users where email = ${email}`;
    const auth = createClient(SUPABASE_URL, process.env.SUPABASE_SECRET_KEY ?? "", {
      auth: { persistSession: false },
    }).auth.admin;
    const { data, error } = await auth.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(`createUser: ${error?.message}`);
    await sql`insert into private.admins (user_id, display_name) values (${data.user.id}, ${displayName})`;
    return data.user.id;
  } finally {
    await sql.end();
  }
}

function base32(secret: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const ch of secret.replace(/=+$/, "").toUpperCase()) {
    bits += alphabet.indexOf(ch).toString(2).padStart(5, "0");
  }
  const bytes = bits.match(/.{8}/g) ?? [];
  return Buffer.from(bytes.map((b) => parseInt(b, 2)));
}

/** RFC 6238 TOTP (SHA-1, 6 digits, 30 s): what Google Authenticator shows. */
export function totp(secret: string, time = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(time / 30_000)));
  const hmac = createHmac("sha1", base32(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const value = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return value.toString().padStart(6, "0");
}

/**
 * A code that hasn't been used yet: Supabase refuses the same code twice, so when the
 * last one came from this 30 s window, wait for the next one.
 */
let lastCode = "";
export async function freshCode(secret: string): Promise<string> {
  let code = totp(secret);
  while (code === lastCode) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    code = totp(secret);
  }
  lastCode = code;
  return code;
}

/** The newest email to `to` in the local Mailpit inbox (polls up to ~10 s). */
export async function latestEmail(to: string): Promise<{ subject: string; html: string }> {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`);
    const { messages } = (await res.json()) as { messages: { ID: string; Subject: string }[] };
    if (messages?.length) {
      const msg = await (await fetch(`${MAILPIT}/api/v1/message/${messages[0]!.ID}`)).json();
      return { subject: msg.Subject as string, html: msg.HTML as string };
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`no email to ${to} in Mailpit`);
}

export async function clearInbox() {
  await fetch(`${MAILPIT}/api/v1/messages`, { method: "DELETE" });
}

/**
 * An admin with 2FA already set up (enrolled through the API, as the setup page would),
 * so editor tests start at the code step. Returns the TOTP secret.
 */
export async function createAdminWith2fa(email: string, password: string, displayName: string) {
  await createAdmin(email, password, displayName);
  const client = createClient(SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`signIn: ${signInError.message}`);
  const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", issuer: "E2E" });
  if (error || !data) throw new Error(`enroll: ${error?.message}`);
  const code = await freshCode(data.totp.secret);
  const { error: verifyError } = await client.auth.mfa.challengeAndVerify({
    factorId: data.id,
    code,
  });
  if (verifyError) throw new Error(`verify: ${verifyError.message}`);
  await client.auth.signOut();
  return data.totp.secret;
}

/** Runs SQL on the local database (test setup and clean-up only). */
export async function localSql<T>(run: (sql: postgres.Sql) => Promise<T>): Promise<T> {
  assertLocal();
  const sql = postgres(DB_URL, { max: 1 });
  try {
    return await run(sql);
  } finally {
    await sql.end();
  }
}
