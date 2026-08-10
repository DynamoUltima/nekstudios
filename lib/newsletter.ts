"use server";

/**
 * Newsletter sign-up.
 *
 * Public — anyone can call it, so it validates hard and gives away nothing. An
 * address that is already on the list gets the same confirmation as a new one:
 * telling a stranger which emails are subscribed is a leak, not a feature.
 */

import { addSubscriber } from "./admin/store";
import type { SubscriberSource } from "./admin/types";

export type SubscribeState = {
  status: "idle" | "ok" | "error";
  message: string;
};

const SOURCES: SubscriberSource[] = ["FOOTER", "NEWSLETTER", "POPUP", "CHECKOUT"];

// Deliberately loose: the shape of a valid address is stranger than most
// patterns allow, and the only real proof is a delivered email.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const raw = String(formData.get("source") ?? "NEWSLETTER");
  const source = SOURCES.includes(raw as SubscriberSource)
    ? (raw as SubscriberSource)
    : "NEWSLETTER";

  if (!EMAIL.test(email) || email.length > 254) {
    return { status: "error", message: "That doesn't look like an email address." };
  }

  try {
    await addSubscriber({ email, source });
  } catch {
    return {
      status: "error",
      message: "Couldn't reach the list. Try again in a moment.",
    };
  }

  return {
    status: "ok",
    message: "You're on the list. Watch your inbox.",
  };
}
