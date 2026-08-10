"use client";

import { useActionState } from "react";
import { updateProduct } from "@/lib/admin/actions";
import {
  emptyProductFormState,
  type ProductFormState,
} from "@/lib/admin/form-state";
import { BADGES, COLLECTIONS, type StockCell } from "@/lib/admin/types";
import type { Product } from "@/lib/products";
import { AdminButton, Field, Panel, inputClass } from "./ui";
import { ImageField } from "./image-field";

export function ProductForm({
  product,
  stock,
}: {
  product: Product;
  stock: StockCell[];
}) {
  // The permalink is what makes this form work before hydration: React emits
  // the action's hidden fields, and a no-JS submit lands back on this page.
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    updateProduct,
    emptyProductFormState,
    `/admin/products/${product.slug}`,
  );

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <input type="hidden" name="slug" value={product.slug} />

      <div className="space-y-6">
        <Panel title="Listing">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label="Price (₵)"
              htmlFor="price"
              error={state.errors.price}
              hint="Shown on the storefront immediately."
            >
              <input
                id="price"
                name="price"
                type="number"
                min="1"
                step="1"
                defaultValue={product.price}
                className={inputClass}
              />
            </Field>

            <Field
              label="Colourway"
              htmlFor="colorway"
              error={state.errors.colorway}
            >
              <input
                id="colorway"
                name="colorway"
                defaultValue={product.colorway}
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
                defaultValue={product.collection}
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
              hint="Corner flag on the product card. Leave blank for none."
            >
              <select
                id="status"
                name="status"
                defaultValue={product.status ?? ""}
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
          </div>

          <div className="mt-6">
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
                defaultValue={product.description}
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Spec" meta="Read only">
          <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="label text-ash">Fabric</dt>
              <dd className="text-right">{product.fabric}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="label text-ash">Weight</dt>
              <dd className="tabular-nums">{product.weightGsm} GSM</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="label text-ash">Slug</dt>
              <dd className="font-mono text-xs">{product.slug}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="label text-ash">Sizes cut</dt>
              <dd>{product.sizes.join(" · ")}</dd>
            </div>
          </dl>
          <p className="label mt-6 text-ash">
            Fabric and construction are set at the factory — they change with the
            run, not from here.
          </p>
        </Panel>

        <Panel title="Photography" meta="Leave empty to keep">
          <div className="grid gap-6 sm:grid-cols-2">
            <ImageField
              name="image"
              label="Primary shot"
              current={product.image}
              error={state.errors.image}
              hint="Shown on the card and first on the product page."
            />

            <ImageField
              name="imageAlt"
              label="Hover shot"
              current={product.imageAlt}
              error={state.errors.imageAlt}
              hint="The second photo, revealed on hover."
            />
          </div>

          <div className="mt-6">
            <Field
              label="Alt text"
              htmlFor="alt"
              error={state.errors.alt}
              hint="Describes the primary shot. Required when you replace it."
            >
              <input
                id="alt"
                name="alt"
                defaultValue={product.alt}
                className={inputClass}
              />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Stock by size" meta="Units on the shelf">
          <ul className="space-y-3">
            {stock.map((cell) => {
              const key = `stock:${cell.size}`;
              const gone = cell.stock === 0;
              return (
                <li key={cell.size} className="flex items-center gap-4">
                  <span
                    className={`label w-12 shrink-0 ${gone ? "text-red" : "text-ink"}`}
                  >
                    {cell.size}
                  </span>
                  <input
                    id={key}
                    name={key}
                    type="number"
                    min="0"
                    max={cell.run}
                    step="1"
                    defaultValue={cell.stock}
                    aria-label={`Units of size ${cell.size}`}
                    className={`${inputClass} w-24`}
                  />
                  <span className="label text-ash">of {cell.run} cut</span>
                </li>
              );
            })}
          </ul>

          <p className="label mt-6 border-t border-line pt-5 text-ash">
            A size at zero is marked sold out on the storefront the moment this
            saves.
          </p>
          {stock.some((cell) => cell.stock === 0) && (
            <p className="label mt-3 text-red">
              {stock
                .filter((cell) => cell.stock === 0)
                .map((cell) => cell.size)
                .join(", ")}{" "}
              currently sold out
            </p>
          )}
        </Panel>

        <div className="border border-line bg-paper p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              {state.message ? (
                <p
                  className={`label ${state.ok ? "text-ink" : "text-red"}`}
                  role="status"
                >
                  {state.ok && (
                    <span aria-hidden="true" className="mr-2 text-red">
                      ✳
                    </span>
                  )}
                  {state.message}
                </p>
              ) : (
                <p className="label text-ash">Changes save to the live store</p>
              )}
            </div>

            <AdminButton type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save piece"}
            </AdminButton>
          </div>
        </div>
      </div>
    </form>
  );
}
