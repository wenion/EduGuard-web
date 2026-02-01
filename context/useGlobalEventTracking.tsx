"use client";

import { useEffect } from "react";
import { useLogger } from "@/context/LoggerContext";
import type { Trace } from "@/types/Trace";

export function useGlobalEventTracking() {
  const { logEvent } = useLogger();

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

      logEvent(data);
    };
    window.addEventListener("pointerdown", handleClick, { capture: true });

    // window on resize - resize
    const handleResize = () => {
      const data: Trace = {
        type: "resize",
        target: {
          tag: "window",
          id: null,
          class: null,
          text: null,
        },
        additional: {},
        ...getPageMetrics(),
        eventX: null,
        eventY: null,
      };

      logEvent(data);
    };
    window.addEventListener("resize", handleResize);

    // document on scroll - scroll
    const handleScroll = (event: Event) => {
      const data: Trace = {
        type: "scroll",
        target: {
          tag: "document",
          id: null,
          class: null,
          text: null,
        },
        additional: {},
        ...getPageMetrics(),
        //Scroll events are not pointer events
        eventX: null, // event.pageX,
        eventY: null, // event.pageY,
      };
      logEvent(data);
    };
    document.addEventListener("scroll", handleScroll);

    // ul on scroll - implemented in useScrollAreaTracking

    // document on keydown - keydown
    const handleKeydown = (event: KeyboardEvent) => {
      const targetElem = event.target as HTMLElement | null;
      const data: Trace = {
        type: "keyboard",
        target: {
          tag: targetElem ? targetElem.tagName : null,
          id: targetElem ? targetElem.id : null,
          class: targetElem ? targetElem.getAttribute("attr-class") : null,
          text: event.key,
        },
        additional: {
          data: { ...targetElem?.dataset },
        },
        ...getPageMetrics(),
        eventX: null,
        eventY: null,
      };
      logEvent(data);
    };
    document.addEventListener("keydown", handleKeydown);

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
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

}
