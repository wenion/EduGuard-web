"use client";

import { useCallback, useEffect } from "react";
import { useLogger } from "@/context/LoggerContext";
import type { Trace } from "@/types/Trace";

import { useAuth } from "@/context/AuthContext";

export function useGlobalEventTracking() {
  const { logEvent } = useLogger();
  const { selectedUnitId, selectedUnitName, selectedUnitCode, selectedWeek } = useAuth();

  const getPageMetrics = () => ({
    pageWidth: document.documentElement.scrollWidth,
    pageHeight: document.documentElement.scrollHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  })

  const getCurrentUnitContext = useCallback(() => ({
    unit_id: selectedUnitId,
    unit_name: selectedUnitName,
    unit_code: selectedUnitCode,
    selected_week: selectedWeek,
  }), [selectedUnitId, selectedUnitName, selectedUnitCode, selectedWeek]);

  const getCurrentTabValue = () => {
    const activeTrigger = document.querySelector(
      'div[role="tabpanel"][data-state="active"]'
    );

    return activeTrigger?.id ?? null;
  };

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
          ...getCurrentUnitContext(),
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
        additional: {...getCurrentUnitContext()},
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
          tag: "body",
          id: getCurrentTabValue(),
          class: null,
          text: null,
        },
        additional: {...getCurrentUnitContext(),},
        ...getPageMetrics(),
        //Scroll events are not pointer events
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
          ...getCurrentUnitContext(),
          data: { ...targetElem?.dataset },
        },
        ...getPageMetrics(),
        eventX: null,
        eventY: null,
      };
      logEvent(data);
    };
    document.addEventListener("keydown", handleKeydown);

    // peerCompareToggle - implemented by useSwitchTracking

    // checkLoginStatus - expired

    // week-selector on change - implemented by useSwitchTracking

    // registerUnitSelect - implemented by useSwitchTracking

    // drag-click on mousedown - implemented
    // drag-icon on mouseleave - implemented
    // draggable-item on dragstart - implemented

    // action-plan-list on drop - implemented

    // date-picker on change - implemented

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
  }, [selectedUnitId, selectedUnitName, selectedUnitCode, selectedWeek]);

}
