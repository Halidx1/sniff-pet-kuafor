"use client";

import { CheckCircle2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "./button";

/** A labelled input with its error underneath, wired up for screen readers. */
export function Field({
  label,
  name,
  error,
  hint,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}) {
  const id = `f-${name}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return (
    <div>
      <label htmlFor={id} className="block font-heading font-bold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted-text">
          {hint}
        </p>
      )}
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="mt-2 block min-h-12 w-full rounded-xl border-2 border-navy/30 bg-white px-4 text-lg focus:border-navy aria-invalid:border-danger"
        {...input}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** A labelled multi-line text box, same wiring as Field. */
export function TextArea({
  label,
  name,
  error,
  hint,
  ...area
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}) {
  const id = `f-${name}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return (
    <div>
      <label htmlFor={id} className="block font-heading font-bold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted-text">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="mt-2 block w-full rounded-xl border-2 border-navy/30 bg-white px-4 py-3 text-lg leading-relaxed focus:border-navy aria-invalid:border-danger"
        {...area}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Submit button that shows it's working and can't be pressed twice. */
export function SubmitButton({ children, pending: label }: { children: string; pending: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? label : children}
    </Button>
  );
}

/** Form-level feedback: errors in red, confirmations in navy with a tick (SPEC §6). */
export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl border-2 border-danger bg-white p-3 font-semibold text-danger"
      >
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p
        role="status"
        className="flex gap-2 rounded-xl border-2 border-navy bg-white p-3 font-semibold"
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        {message}
      </p>
    );
  }
  return null;
}
