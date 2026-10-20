"use client";

import { startTransition } from "react";

/**
 * Hands a form to its Server Action without React emptying it on the way.
 *
 * `<form action={fn}>` calls `requestFormReset` *before* it runs the action, so
 * every uncontrolled field snaps back to its default the moment you submit —
 * including the two file inputs, which nothing can refill. A form that comes
 * back saying "check the fields below" has already thrown away the spec, the
 * copy and both photographs, and because the file inputs are `required` the
 * next click is refused by the browser with nothing on screen to explain it.
 * The photo previews are React state, so they survive and keep showing shots
 * that are no longer attached.
 *
 * Dispatching the action ourselves skips that reset: React sees the submit was
 * already handled inside a transition and only tracks the pending state. The
 * `action` prop stays on the form for the pre-hydration submit, where there is
 * no reset to avoid.
 */
export function submitWithoutReset(
  event: React.FormEvent<HTMLFormElement>,
  formAction: (formData: FormData) => void,
) {
  event.preventDefault();

  // Read the fields now — `currentTarget` is null once the handler returns.
  const formData = new FormData(event.currentTarget);

  startTransition(() => formAction(formData));
}
