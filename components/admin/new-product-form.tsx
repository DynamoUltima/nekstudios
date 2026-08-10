"use client";

import { useActionState, useState } from "react";
import { createProduct } from "@/lib/admin/actions";
import {
  emptyProductFormState,
  type ProductFormState,
} from "@/lib/admin/form-state";
import {
  BADGES,
  COLLECTIONS,
  SIZE_LADDER,
  slugify,
} from "@/lib/admin/types";
import { AdminButton, Field, Panel, inputClass } from "./ui";
import { ImageField } from "./image-field";

export function NewProductForm() {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    createProduct,
    emptyProductFormState,
    "/admin/products/new",
  );

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <Panel title="Identity">
          <Naming
            error={state.errors.name}
            subtitleError={state.errors.subtitle}
            slugError={state.errors.slug}
          />

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Field
              label="Price (₵)"
              htmlFor="price"
              error={state.errors.price}
            >
              <input
                id="price"
                name="price"
                type="number"
                min="1"
                step="1"
                defaultValue={68}
                className={inputClass}
              />
            </Field>

            <Field
              label="Compare at (₵)"
              htmlFor="compareAt"
              error={state.errors.compareAt}
              hint="Optional. Strikethrough price — leave blank at full price."
            >
              <input
                id="compareAt"
                name="compareAt"
                type="number"
                min="0"
                step="1"
                className={inputClass}
              />
            </Field>

            <Field
              label="Collection"
              htmlFor="collection"
              error={state.errors.collection}
            >
              <select
                id="collection"
                name="collection"
                defaultValue="THE DROP"
                className={inputClass}
              >
                {COLLECTIONS.map((collection) => (
                  <option key={collection} value={collection}>
                    {collection}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Badge"
              htmlFor="status"
              error={state.errors.status}
              hint="Corner flag on the product card."
            >
              <select
                id="status"
                name="status"
                defaultValue="NEW"
                className={inputClass}
              >
                <option value="">No badge</option>
                {BADGES.map((badge) => (
                  <option key={badge} value={badge}>
                    {badge}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Colourway"
              htmlFor="colorway"
              error={state.errors.colorway}
              hint="Bone / Red"
            >
              <input id="colorway" name="colorway" className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="Spec" meta="Fixed at the factory">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label="Fabric"
              htmlFor="fabric"
              error={state.errors.fabric}
              hint="Waffle-structure heavyweight cotton"
            >
              <input id="fabric" name="fabric" className={inputClass} />
            </Field>

            <Field
              label="Weight (GSM)"
              htmlFor="weightGsm"
              error={state.errors.weightGsm}
            >
              <input
                id="weightGsm"
                name="weightGsm"
                type="number"
                min="1"
                step="1"
                defaultValue={260}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-6 space-y-6">
            <Field
              label="Description"
              htmlFor="description"
              error={state.errors.description}
              hint="Reads on the product page under the title."
            >
              <textarea
                id="description"
                name="description"
                rows={5}
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </Field>

            <Field
              label="Details"
              htmlFor="details"
              error={state.errors.details}
              hint="One line per bullet on the product page."
            >
              <textarea
                id="details"
                name="details"
                rows={4}
                placeholder={"Boxed silhouette, drops at the shoulder\nHand screen-printed in three passes\nPre-shrunk — take your usual size"}
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Photography" meta="Both required">
          <div className="space-y-6">
            <ImageField
              name="image"
              label="Primary shot"
              error={state.errors.image}
              hint="Shown on the card and first on the product page."
              required
            />

            <Field
              label="Alt text"
              htmlFor="alt"
              error={state.errors.alt}
              hint="What the photo shows, for anyone who can't see it."
            >
              <input
                id="alt"
                name="alt"
                placeholder="Heavyweight white box tee worn straight on"
                className={inputClass}
              />
            </Field>

            <ImageField
              name="imageAlt"
              label="Hover shot"
              error={state.errors.imageAlt}
              hint="The second photo, revealed on hover. Decorative — no alt text."
              required
            />
          </div>
        </Panel>

        <Panel title="The run" meta="Units cut per size">
          <ul className="space-y-3">
            {SIZE_LADDER.map((size) => (
              <SizeRow
                key={size}
                size={size}
                runError={state.errors[`run:${size}`]}
                stockError={state.errors[`stock:${size}`]}
              />
            ))}
          </ul>

          <p className="label mt-6 border-t border-line pt-5 text-ash">
            A size left at a run of zero isn't cut for this piece. Stock follows
            the run until you set it yourself.
          </p>
        </Panel>

        <div className="border border-line bg-paper p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {state.message ? (
              <p className="label text-red" role="status">
                {state.message}
              </p>
            ) : (
              <p className="label text-ash">Goes live on the storefront</p>
            )}

            <AdminButton type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create piece"}
            </AdminButton>
          </div>
        </div>
      </div>
    </form>
  );
}

/**
 * Name and permalink. The slug tracks the name until someone edits it, at which
 * point it stops moving — a permalink you have chosen shouldn't change under
 * you because you fixed a typo in the title.
 */
function Naming({
  error,
  subtitleError,
  slugError,
}: {
  error?: string;
  subtitleError?: string;
  slugError?: string;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const slugValue = slugTouched ? slug : slugify(name);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field label="Name" htmlFor="name" error={error} hint="OWN THE STREETS">
        <input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
        />
      </Field>

      <Field
        label="Subtitle"
        htmlFor="subtitle"
        error={subtitleError}
        hint="Heavyweight Box Tee"
      >
        <input id="subtitle" name="subtitle" className={inputClass} />
      </Field>

      <div className="sm:col-span-2">
        <Field
          label="Permalink"
          htmlFor="slug"
          error={slugError}
          hint={
            slugValue
              ? `/shop/${slugValue}`
              : "Follows the name until you change it."
          }
        >
          <input
            id="slug"
            name="slug"
            value={slugValue}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            className={`${inputClass} font-mono text-xs`}
          />
        </Field>
      </div>
    </div>
  );
}

/** One size on the ladder: how many were cut, and how many are on the shelf. */
function SizeRow({
  size,
  runError,
  stockError,
}: {
  size: string;
  runError?: string;
  stockError?: string;
}) {
  const [run, setRun] = useState("");
  const [stock, setStock] = useState("");
  const [stockTouched, setStockTouched] = useState(false);

  // A new run is normally untouched stock, so the shelf mirrors the cut until
  // someone says otherwise.
  const stockValue = stockTouched ? stock : run;
  const error = runError ?? stockError;

  return (
    <li>
      <div className="flex items-center gap-3">
        <span className="label w-10 shrink-0">{size}</span>

        <label className="sr-only" htmlFor={`run:${size}`}>
          Units cut of size {size}
        </label>
        <input
          id={`run:${size}`}
          name={`run:${size}`}
          type="number"
          min="0"
          step="1"
          value={run}
          placeholder="0"
          onChange={(event) => setRun(event.target.value)}
          className={`${inputClass} w-20`}
        />
        <span className="label shrink-0 text-ash">cut</span>

        <label className="sr-only" htmlFor={`stock:${size}`}>
          Units of size {size} on the shelf
        </label>
        <input
          id={`stock:${size}`}
          name={`stock:${size}`}
          type="number"
          min="0"
          step="1"
          value={stockValue}
          placeholder="0"
          onChange={(event) => {
            setStockTouched(true);
            setStock(event.target.value);
          }}
          className={`${inputClass} w-20`}
        />
        <span className="label shrink-0 text-ash">on hand</span>
      </div>

      {error && (
        <p className="label mt-2 pl-13 text-[0.5625rem] text-red">{error}</p>
      )}
    </li>
  );
}
