"use client";

import { useEffect } from "react";
import { useLogger } from "@/context/LoggerContext";

export function useScrollAreaTracking(
  scrollAreaRef: React.RefObject<HTMLDivElement | null>
) {
  const { logEvent } = useLogger();

  useEffect(() => {
    const root = scrollAreaRef.current;
    if (!root) return;

    const viewport = root.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;

    if (!viewport) return;

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;

      const ul = target.querySelector("ul[id]") as HTMLUListElement | null;
      const listId = ul?.id ?? null;

      logEvent({
        type: "scroll",
        target: {
          tag: ul?.tagName.toLowerCase() ?? null,
          id: listId,
          class: ul?.className || null,
          text: null,
        },
        additional: { ...ul?.dataset, },
        pageWidth: document.documentElement.scrollWidth,
        pageHeight: document.documentElement.scrollHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        eventX: target.scrollLeft,
        eventY: target.scrollTop,
      });
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [scrollAreaRef, logEvent]);
}
