"use client";

import { useActionState, useState } from "react";
import { saveFabric } from "@/lib/admin/actions";
import {
  emptyProductFormState,
  type ProductFormState,
} from "@/lib/admin/form-state";
import type { FabricContent } from "@/lib/fabric-types";
import { AdminButton, Field, Panel, inputClass } from "./ui";
import { submitWithoutReset } from "./submit";

// Number inputs are held as strings while typing so "20." and "" don't snap
// to a number mid-keystroke; the server does the real validation.
type Row = { size: string; chest: string; length: string; sleeve: string };

const removeButton =
  "label shrink-0 border border-line px-2.5 py-2 text-ash hover:border-red hover:text-red";
const addButton =
  "label border border-line px-4 py-3 hover:bg-ink hover:text-paper";

export function FabricEditor({ initial }: { initial: FabricContent }) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    saveFabric,
    emptyProductFormState,
    "/admin/fabric",
  );

  const [gsm, setGsm] = useState(String(initial.gsm));
  const [points, setPoints] = useState(initial.points);
  const [rows, setRows] = useState<Row[]>(
    initial.sizing.map((r) => ({
      size: r.size,
      chest: String(r.chest),
      length: String(r.length),
      sleeve: String(r.sleeve),
    })),
  );

  const patchPoint = (i: number, patch: Partial<(typeof points)[number]>) =>
    setPoints((cur) => cur.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const patchRow = (i: number, patch: Partial<Row>) =>
    setRows((cur) => cur.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <form
      action={formAction}
      onSubmit={(event) => submitWithoutReset(event, formAction)}
      className="space-y-6"
    >
      <input type="hidden" name="payload" value={JSON.stringify({ gsm, points, sizing: rows })} />

      <Panel title="Fabric points" meta="Numbered in this order">
        <div className="mb-6 max-w-48">
          <Field
            label="Weight tag (GSM)"
            htmlFor="gsm"
            error={state.errors.gsm}
            hint="The big number on the home page band."
          >
            <input
              id="gsm"
              type="number"
              min="1"
              step="1"
              value={gsm}
              onChange={(event) => setGsm(event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <ul className="space-y-6">
          {points.map((point, i) => (
            <li key={i} className="border-t border-line pt-6">
              <div className="flex items-center justify-between gap-4">
                <span className="label text-ash">{String(i + 1).padStart(2, "0")}</span>
                <button
                  type="button"
                  className={removeButton}
                  aria-label={`Remove point ${i + 1}`}
                  onClick={() => setPoints((cur) => cur.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 space-y-5">
                <Field label="Title" htmlFor={`point-title-${i}`} error={state.errors[`point:${i}:title`]}>
                  <input
                    id={`point-title-${i}`}
                    value={point.title}
                    onChange={(event) => patchPoint(i, { title: event.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Text" htmlFor={`point-body-${i}`} error={state.errors[`point:${i}:body`]}>
                  <textarea
                    id={`point-body-${i}`}
                    rows={3}
                    value={point.body}
                    onChange={(event) => patchPoint(i, { body: event.target.value })}
                    className={`${inputClass} resize-y leading-relaxed`}
                  />
                </Field>
              </div>
            </li>
          ))}
        </ul>

        {state.errors.points && <p className="label mt-4 text-red">{state.errors.points}</p>}

        <button
          type="button"
          className={`${addButton} mt-6`}
          onClick={() => setPoints((cur) => [...cur, { title: "", body: "" }])}
        >
          + Add point
        </button>
      </Panel>

      <Panel title="Sizing table" meta="Inches, measured flat">
        <ul className="space-y-3">
          <li className="label hidden grid-cols-[5rem_1fr_1fr_1fr_2.5rem] gap-3 text-ash sm:grid">
            <span>Size</span>
            <span>Chest</span>
            <span>Length</span>
            <span>Sleeve</span>
            <span />
          </li>
          {rows.map((row, i) => {
            const error =
              state.errors[`sizing:${i}:size`] ??
              state.errors[`sizing:${i}:chest`] ??
              state.errors[`sizing:${i}:length`] ??
              state.errors[`sizing:${i}:sleeve`];
            return (
              <li key={i}>
                <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-[5rem_1fr_1fr_1fr_2.5rem]">
                  <input
                    aria-label={`Size ${i + 1}`}
                    value={row.size}
                    onChange={(event) => patchRow(i, { size: event.target.value })}
                    className={inputClass}
                  />
                  {(["chest", "length", "sleeve"] as const).map((key) => (
                    <input
                      key={key}
                      aria-label={`${row.size || `Row ${i + 1}`} ${key} in inches`}
                      placeholder={key}
                      type="number"
                      min="0"
                      step="0.1"
                      value={row[key]}
                      onChange={(event) => patchRow(i, { [key]: event.target.value })}
                      className={inputClass}
                    />
                  ))}
                  <button
                    type="button"
                    className={removeButton}
                    aria-label={`Remove ${row.size || `row ${i + 1}`}`}
                    onClick={() => setRows((cur) => cur.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </div>
                {error && <p className="label mt-2 text-[0.5625rem] text-red">{error}</p>}
              </li>
            );
          })}
        </ul>

        {state.errors.sizing && <p className="label mt-4 text-red">{state.errors.sizing}</p>}

        <button
          type="button"
          className={`${addButton} mt-6`}
          onClick={() =>
            setRows((cur) => [...cur, { size: "", chest: "", length: "", sleeve: "" }])
          }
        >
          + Add size
        </button>
      </Panel>

      <div className="border border-line bg-paper p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {state.message ? (
            <p className={`label ${state.ok ? "text-ink" : "text-red"}`} role="status">
              {state.message}
            </p>
          ) : (
            <p className="label text-ash">Changes save to the live store</p>
          )}
          <AdminButton type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save page"}
          </AdminButton>
        </div>
      </div>
    </form>
  );
}
