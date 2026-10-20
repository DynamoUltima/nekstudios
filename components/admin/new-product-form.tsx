"use client";

import { useActionState, useState } from "react";
import { createProduct } from "@/lib/admin/actions";
import {
  emptyProductFormState,
  type ProductFormState,
} from "@/lib/admin/form-state";
import {
  BADGES,
  SIZE_LADDER,
  type FabricOption,
  slugify,
} from "@/lib/admin/types";
import { AdminButton, Field, Panel, inputClass } from "./ui";
import { ImageField } from "./image-field";
import { submitWithoutReset } from "./submit";

/** Starting run per size. Rows are prefilled so a normal piece needs no typing. */
const DEFAULT_RUN: Record<(typeof SIZE_LADDER)[number], number> = {
  XS: 10,
  S: 25,
  M: 40,
  L: 40,
  XL: 25,
  XXL: 10,
};

export function NewProductForm({
  collections,
  fabrics,
}: {
  collections: string[];
  fabrics: FabricOption[];
}) {
  const [sizes, setSizes] = useState<string[]>([...SIZE_LADDER]);
  // Mirrors the fields the alt text is built from, so it can follow them.
  const [draft, setDraft] = useState({ name: "", subtitle: "", colorway: "" });
  const [alt, setAlt] = useState("");
  const [altTouched, setAltTouched] = useState(false);
  const suggestedAlt = draft.name
    ? [`${draft.name} ${draft.subtitle}`.trim(), draft.colorway, "front view"]
        .filter(Boolean)
        .join(", ")
    : "";
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    createProduct,
    emptyProductFormState,
    "/admin/products/new",
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => submitWithoutReset(event, formAction)}
      onChange={(event) => {
        const { name, value } = event.target as HTMLInputElement;
        if (name === "name" || name === "subtitle" || name === "colorway") {
          setDraft((current) => ({ ...current, [name]: value }));
        }
      }}
      className="grid gap-6 xl:grid-cols-[1.3fr_1fr]"
    >
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
                defaultValue={collections[0]}
                className={inputClass}
              >
                {collections.map((collection) => (
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
          <FabricFields
            fabrics={fabrics}
            fabricError={state.errors.fabric}
            weightError={state.errors.weightGsm}
          />

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
              hint={
                altTouched
                  ? "What the photo shows, for anyone who can't see it."
                  : "Filled from the name, subtitle and colourway — edit to describe the shot."
              }
            >
              <input
                id="alt"
                name="alt"
                value={altTouched ? alt : suggestedAlt}
                onChange={(event) => {
                  setAltTouched(true);
                  setAlt(event.target.value);
                }}
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
            {SIZE_LADDER.filter((size) => sizes.includes(size)).map((size) => (
              <SizeRow
                key={size}
                size={size}
                runError={state.errors[`run:${size}`]}
                stockError={state.errors[`stock:${size}`]}
                onRemove={() =>
                  setSizes((current) => current.filter((s) => s !== size))
                }
              />
            ))}
          </ul>

          {sizes.length < SIZE_LADDER.length && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="label text-ash">Add size</span>
              {SIZE_LADDER.filter((size) => !sizes.includes(size)).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSizes((current) => [...current, size])}
                  className="label border border-line px-3 py-2 hover:bg-ink hover:text-paper"
                >
                  + {size}
                </button>
              ))}
            </div>
          )}

          <p className="label mt-6 border-t border-line pt-5 text-ash">
            Remove a size to leave it out of this piece. Stock follows the run
            until you set it yourself.
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
  onRemove,
}: {
  size: (typeof SIZE_LADDER)[number];
  runError?: string;
  stockError?: string;
  onRemove: () => void;
}) {
  const [run, setRun] = useState(String(DEFAULT_RUN[size]));
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

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove size ${size}`}
          className="label ml-auto shrink-0 border border-line px-2.5 py-2 text-ash hover:border-red hover:text-red"
        >
          ✕
        </button>
      </div>

      {error && (
        <p className="label mt-2 pl-13 text-[0.5625rem] text-red">{error}</p>
      )}
    </li>
  );
}

const OTHER = "__other__";

/**
 * Fabric picks from what the catalogue already uses and fills in its usual
 * weight; "Other…" opens a text box for a cloth nobody has cut yet. Either way
 * the submitted field is `fabric`, so the action doesn't know the difference.
 */
function FabricFields({
  fabrics,
  fabricError,
  weightError,
}: {
  fabrics: FabricOption[];
  fabricError?: string;
  weightError?: string;
}) {
  const [choice, setChoice] = useState(fabrics[0]?.fabric ?? OTHER);
  const [weight, setWeight] = useState(String(fabrics[0]?.weightGsm ?? 260));
  const isOther = choice === OTHER;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field label="Fabric" htmlFor="fabricChoice" error={fabricError}>
        <select
          id="fabricChoice"
          value={choice}
          onChange={(event) => {
            const next = event.target.value;
            setChoice(next);
            const known = fabrics.find((f) => f.fabric === next);
            if (known) setWeight(String(known.weightGsm));
          }}
          className={inputClass}
        >
          {fabrics.map((f) => (
            <option key={f.fabric} value={f.fabric}>
              {f.fabric}
            </option>
          ))}
          <option value={OTHER}>Other…</option>
        </select>

        {isOther ? (
          <input
            id="fabric"
            name="fabric"
            aria-label="New fabric name"
            placeholder="Waffle-structure heavyweight cotton"
            className={`${inputClass} mt-3`}
          />
        ) : (
          <input type="hidden" name="fabric" value={choice} />
        )}
      </Field>

      <Field label="Weight (GSM)" htmlFor="weightGsm" error={weightError}>
        <input
          id="weightGsm"
          name="weightGsm"
          type="number"
          min="1"
          step="1"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          className={inputClass}
        />
      </Field>
    </div>
  );
}
