"use client";

import { useActionState } from "react";
import { renameCollection } from "@/lib/admin/actions";
import {
  emptyProductFormState,
  type ProductFormState,
} from "@/lib/admin/form-state";
import { AdminButton, Field, Panel, inputClass } from "./ui";

export function RenameCollectionForm({ name }: { name: string }) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    renameCollection,
    emptyProductFormState,
  );

  return (
    <Panel title="Rename collection">
      {/* Keyed on the name so the field resets after a rename lands on the new tab. */}
      <form key={name} action={formAction} className="flex flex-wrap items-end gap-4">
        <input type="hidden" name="from" value={name} />
        <div className="min-w-64 flex-1">
          <Field
            label="Name"
            htmlFor="to"
            error={state.errors.to}
            hint="Every piece in it moves to the new name, here and on the storefront. An existing name merges the two."
          >
            <input
              id="to"
              name="to"
              defaultValue={name}
              maxLength={40}
              className={inputClass}
            />
          </Field>
        </div>
        <AdminButton type="submit" disabled={pending}>
          {pending ? "Renaming…" : "Rename"}
        </AdminButton>
      </form>
      {state.message && <p className="label mt-4 text-red">{state.message}</p>}
    </Panel>
  );
}
