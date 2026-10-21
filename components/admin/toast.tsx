"use client";

import { useEffect, useState } from "react";

/** A short confirmation, bottom-right, that clears itself. */
export function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 flex max-w-[calc(100vw-3rem)] items-center gap-4 border border-ink bg-ink px-5 py-4 text-bone shadow-lg"
    >
      <span aria-hidden="true" className="text-red">
        ✳
      </span>
      <span className="label">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="label text-bone/50 transition-colors hover:text-bone"
      >
        ×
      </button>
    </div>
  );
}

/**
 * A toast for something that happened just before a redirect. The server puts
 * the message in the URL; this shows it once and takes it back out, so a
 * refresh doesn't announce it again.
 */
export function FlashToast({ message, param }: { message?: string; param: string }) {
  const [shown, setShown] = useState(message ?? "");

  useEffect(() => {
    if (!message) return;
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.replaceState(null, "", url);
  }, [message, param]);

  return shown ? <Toast message={shown} onDismiss={() => setShown("")} /> : null;
}
