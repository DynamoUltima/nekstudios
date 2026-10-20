"use client";

import { useActionState, useState } from "react";
import { deleteProduct } from "@/lib/admin/actions";
import {
  emptyProductFormState,
  type ProductFormState,
} from "@/lib/admin/form-state";
import { Panel } from "./ui";
import { submitWithoutReset } from "./submit";

/**
 * Permanent removal behind a two-step button: the first click only asks, the
 * second one deletes. Enough friction to stop a stray click without making you
 * type anything.
 */
export function DeleteProduct({ slug, name }: { slug: string; name: string }) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    deleteProduct,
    emptyProductFormState,
    `/admin/products/${slug}`,
  );
  const [armed, setArmed] = useState(false);

  return (
    <Panel title="Delete piece" meta="Can't be undone">
      <form
        action={formAction}
        onSubmit={(event) => submitWithoutReset(event, formAction)}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <input type="hidden" name="slug" value={slug} />

        <p className="label text-ash">
          {armed
            ? `Delete ${name}? Its stock and both photos go too.`
            : "Removes it from the storefront, its stock and both photos. Past orders keep their record."}
        </p>

        <div className="flex items-center gap-3">
          {armed ? (
            <>
              <button
                type="button"
                onClick={() => setArmed(false)}
                disabled={pending}
                className="label border border-line px-5 py-3 text-ash transition-colors hover:border-ink hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="label border border-red bg-red px-5 py-3 text-paper disabled:opacity-40"
              >
                {pending ? "Deleting…" : "Yes, delete"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setArmed(true)}
              className="label border border-red px-5 py-3 text-red transition-colors hover:bg-red hover:text-paper"
            >
              Delete piece
            </button>
          )}
        </div>

        {state.message && (
          <p className="label w-full text-red" role="status">
            {state.message}
          </p>
        )}
      </form>
    </Panel>
  );
}
