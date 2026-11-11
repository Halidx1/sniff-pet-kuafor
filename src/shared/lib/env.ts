// Reads a server-side environment variable, failing loudly when it's missing
// instead of sending requests to "undefined".
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}
