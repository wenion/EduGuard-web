"use client";

import { useCallback } from "react";
import { useLogger } from "@/context/LoggerContext";
import { useAuth } from "@/context/AuthContext";

export function useSwitchTracking() {
  const { logEvent } = useLogger();
  const { selectedUnitId, selectedUnitName, selectedUnitCode, selectedWeek } = useAuth();

  const getCurrentUnitContext = useCallback(() => ({
    unit_id: selectedUnitId,
    unit_name: selectedUnitName,
    unit_code: selectedUnitCode,
    selected_week: selectedWeek,
  }), [selectedUnitId, selectedUnitName, selectedUnitCode, selectedWeek]);

  const logSelectTrace = useCallback(
    ({
      type,
      text,
      tag,
      id,
      className,
      ...extra
    } : {
      type: string;
      text?:string| null;
      tag?:string;
      id?:string | null;
      className?:string| null;
      [key: string]: any;
    }) => {
      logEvent({
        type: type,
        target: {
          tag: tag ?? "",
          id: id ?? null,
          class: className ?? "",
          text: text ?? "",
        },
        additional: {
          ...getCurrentUnitContext(),
          ...extra,
        },
        pageWidth: document.documentElement.scrollWidth,
        pageHeight: document.documentElement.scrollHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        eventX: null,
        eventY: null,
      });
    },
    [logEvent, getCurrentUnitContext]
  );

  return { logSelectTrace };
}
