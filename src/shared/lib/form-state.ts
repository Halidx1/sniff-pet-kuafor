// The result a Server Action hands back to its form (useActionState): one form-level
// error or confirmation, plus a message per invalid field.

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  /** The submitted values, so a form keeps what the person typed after an error. */
  values?: Record<string, string>;
};

/** Zod issues → the first message per field. */
export function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) out[String(issue.path[0] ?? "")] ??= issue.message;
  return out;
}

/** FormData → plain strings (files and repeated keys are not used by these forms). */
export function formValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) out[key] = value;
  }
  return out;
}
