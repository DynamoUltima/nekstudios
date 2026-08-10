/**
 * Form state shared between the product editor and its Server Action.
 *
 * It lives outside `actions.ts` because a `"use server"` module may only
 * export async functions — a plain object there is a build error.
 */

export type ProductFormState = {
  ok: boolean;
  message: string;
  /** Field name → problem, keyed for inline display. */
  errors: Record<string, string>;
};

export const emptyProductFormState: ProductFormState = {
  ok: false,
  message: "",
  errors: {},
};
