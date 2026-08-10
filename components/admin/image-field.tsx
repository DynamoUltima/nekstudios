"use client";

/**
 * A photo slot: what the storefront shows today, and what you're about to
 * replace it with.
 *
 * The preview is a local object URL, so nothing is uploaded until the form is
 * submitted and every other field has passed validation.
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/admin/image-limits";
import { Field } from "./ui";

export function ImageField({
  name,
  label,
  hint,
  error,
  /** The photo already on the piece, if there is one. */
  current,
  required = false,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  current?: string;
  required?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  // Revoked when the pick changes and when the field unmounts. Without this,
  // every re-pick leaks a blob for the life of the document.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <Field label={label} htmlFor={name} error={error} hint={hint}>
      <div className="flex items-start gap-4">
        <div className="relative aspect-4/5 w-20 shrink-0 border border-line bg-bone-2">
          {preview ? (
            // A blob: URL can't go through the image optimiser, and there is
            // nothing to optimise — the bytes are already on this machine.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : current ? (
            <Image
              src={current}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span className="label absolute inset-0 grid place-items-center text-center text-[0.5625rem] text-ash">
              No photo
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            id={name}
            name={name}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            required={required}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
            className="label w-full cursor-pointer text-[0.5625rem] text-ash file:mr-3 file:cursor-pointer file:border file:border-line file:bg-bone file:px-3 file:py-2 file:text-[0.5625rem] file:uppercase file:tracking-[0.12em] file:text-ink file:transition-colors hover:file:border-ink"
          />
          {preview && (
            <p className="label mt-2 text-[0.5625rem] text-red">
              Replaces the current shot on save
            </p>
          )}
        </div>
      </div>
    </Field>
  );
}
