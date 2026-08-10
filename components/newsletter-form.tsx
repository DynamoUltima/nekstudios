"use client";

import { useActionState } from "react";
import { subscribe, type SubscribeState } from "@/lib/newsletter";
import { Button } from "./button";

const initial: SubscribeState = { status: "idle", message: "" };

export function NewsletterForm({
  source = "NEWSLETTER",
  permalink = "/",
}: {
  /** Where on the site the address was captured — shown in the admin. */
  source?: "FOOTER" | "NEWSLETTER" | "POPUP" | "CHECKOUT";
  /** The page this form lives on, so a submit before hydration still lands. */
  permalink?: string;
}) {
  const [state, formAction, pending] = useActionState(
    subscribe,
    initial,
    permalink,
  );

  if (state.status === "ok") {
    return (
      <p className="label mx-auto mt-11 max-w-xl border border-ink px-6 py-5 text-ink">
        You&apos;re on the list. <span className="text-red">Watch your inbox.</span>
      </p>
    );
  }

  return (
    <form action={formAction} className="mx-auto mt-11 max-w-xl">
      <input type="hidden" name="source" value={source} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          aria-invalid={state.status === "error"}
          className="label flex-1 border border-ink bg-transparent px-5 py-4 text-ink placeholder:text-ash/70 focus:border-red focus:outline-none"
        />
        <Button type="submit" arrow disabled={pending}>
          {pending ? "Joining…" : "Join"}
        </Button>
      </div>

      {state.status === "error" ? (
        <p className="label mt-5 text-[0.5625rem] text-red" role="alert">
          {state.message}
        </p>
      ) : (
        <p className="label mt-5 text-[0.5625rem] text-ash">
          No spam. Unsubscribe any time.
        </p>
      )}
    </form>
  );
}
