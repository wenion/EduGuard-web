import { useEffect, useRef } from "react";

import type { Trace } from "@/types/Trace";
import { sendLog } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";

type QueuedTrace = { data: Trace; timestamp: number };

export function useEventTracking() {
  const { authorizedFetch } = useAuth();
  
  const queueRef = useRef<QueuedTrace[]>([]);

  const getPageMetrics = () => ({
    pageWidth: document.documentElement.scrollWidth,
    pageHeight: document.documentElement.scrollHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  })

  useEffect(() => {
    // button or tr or others - click
    const handleClick = (event: MouseEvent) => {
      const originalTarget = event.target as HTMLElement | null;
      if (!originalTarget) return null;

      const button = originalTarget.closest("button");
      const row = originalTarget.closest("tr");
      const target = (button || row || originalTarget) as HTMLElement;

      const data: Trace = {
        type: "click",
        target: {
          tag: target.tagName,
          id: target.id || null,
          class: target.getAttribute("attr-class"),
          text: target.textContent ? String(target.textContent.trim()) : null,
        },
        additional: {
          data: { ...target.dataset },
        },
        ...getPageMetrics(),
        eventX: event.clientX,
        eventY: event.clientY,
      }

      queueRef.current.push({ data, timestamp: Date.now() });
      console.log("Event queued:", data);
    };
    window.addEventListener("pointerdown", handleClick, { capture: true });

    // window on resize - resize

    // document on scroll - scroll

    // ul on scroll - scroll

    // document on keydown - keydown

    // checkLoginStatus - expired

    // week-selector on change - select

    // drag-icon on mousedown - drag click
    // drag-icon on mouseleave - 
    // draggable-item on dragstart - drag start

    // action-plan-list on drop - drop

    // date-picker on change - select date for action

    // legend -onClick - chart legend click
    // onHover - chart data hover
    // onClick - chart data click
    // *3

    // log out
    // log in

    // chrome.runtime.onConnect/EdvanceSidePanel open Edvance
    // port.onDisconnect close Edvance

    return () => {
      window.removeEventListener("pointerdown", handleClick, { capture: true });
    };
  }, []);
}