"use client";

/**
 * Firebase Analytics for the storefront.
 *
 * Analytics only exists in the browser, so it is started in an effect rather
 * than at import time. App Router navigations don't reload the document, so
 * page_view is logged manually on every path change — the automatic collection
 * built into the SDK would only ever see the first page.
 */

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import type { Analytics as FirebaseAnalytics } from "firebase/analytics";
import { initAnalytics } from "@/lib/firebase/client";

function PageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const analytics = useRef<FirebaseAnalytics | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function send() {
      analytics.current ??= await initAnalytics();
      if (cancelled || !analytics.current) return;

      const { logEvent } = await import("firebase/analytics");
      const query = searchParams.toString();

      logEvent(analytics.current, "page_view", {
        page_path: query ? `${pathname}?${query}` : pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }

    void send();
    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  return null;
}

export function Analytics() {
  // useSearchParams needs a Suspense boundary or it opts the whole tree into
  // client-side rendering.
  return (
    <Suspense fallback={null}>
      <PageViews />
    </Suspense>
  );
}
