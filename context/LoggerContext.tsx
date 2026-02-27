"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useMemo
} from "react";

import type { Trace } from "@/types/Trace";
import { sendLog } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

type QueuedTrace = {
  data: Trace;
  timestamp: number;
};

/* ============================== IndexedDB ============================== */

const DB_NAME = "event-trace-db";
const STORE_NAME = "traceLogs";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeLocally(batch: QueuedTrace[]) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    batch.forEach((item) => store.add(item));

    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });

    db.close();
  } catch (err) {
    console.error("IndexedDB store failed", err);
  }
}

async function readAndClearStored(): Promise<QueuedTrace[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  const req = store.getAll();

  const logs = await new Promise<QueuedTrace[]>((res, rej) => {
    req.onsuccess = () => res(req.result as QueuedTrace[]);
    req.onerror = () => rej(req.error);
  });

  store.clear();
  db.close();
  return logs;
}

/* ============================== Hook ============================== */
type LoggerState = {
  logEvent: (eventData: Trace) => void;
};

const LoggerContext = createContext<LoggerState | null>(null);

export function LoggerProvider({ children }: { children: ReactNode }) {
  const { authorizedFetch, isAuthenticated } = useAuth();

  const endpoint = `${API_BASE}/logger/log`;
  const flushInterval = 5000;
  const batchSize = 10;

  const queueRef = useRef<QueuedTrace[]>([]);
  const timerRef = useRef<number | null>(null);

  /* ------------------------------ helpers ------------------------------ */

  const sameTarget = (a?: Trace["target"], b?: Trace["target"]) =>
    !!a &&
    !!b &&
    a.tag === b.tag &&
    a.id === b.id &&
    a.class === b.class;

  /* ------------------------------ flush ------------------------------ */

  const flush = useCallback(
    async (sync = false) => {
      const queue = queueRef.current;
      if (queue.length === 0) return;

      if (!isAuthenticated) return;

      const batch = queue.splice(0, batchSize);
      const payload = JSON.stringify(batch);

      if (sync && navigator.sendBeacon) {
      // if (sync) {
        const ok = navigator.sendBeacon(endpoint, payload);
        if (!ok) storeLocally(batch);
        return;
      }

      try {
        sendLog(authorizedFetch, batch);
      } catch {
        await storeLocally(batch);
      }
    },
    [authorizedFetch, endpoint, batchSize, isAuthenticated]
  );

  /* ------------------------------ logEvent ------------------------------ */
  const logEvent = useCallback(
    (eventData: Trace) => {
      const queue = queueRef.current;
      const now = Date.now();

      const newEvent: QueuedTrace = {
        data: {
          ...eventData,
          additional: eventData.additional ?? {},
          source: "web",
        },
        timestamp: now,
      };

      const last = queue[queue.length - 1];

      /* ---------- SCROLL ---------- */
      if (
        eventData.type === "scroll" &&
        last &&
        last.data.type === "scroll" &&
        now - last.timestamp <= 1000 &&
        sameTarget(last.data.target, eventData.target)
      ) {
        const dx =
          (eventData.scrollX ?? eventData.eventX ?? 0) -
          (last.data.scrollX ?? last.data.eventX ?? 0);
        const dy =
          (eventData.scrollY ?? eventData.eventY ?? 0) -
          (last.data.scrollY ?? last.data.eventY ?? 0);

        const vertical = dy > 0 ? "down" : dy < 0 ? "up" : "none";
        const horizontal = dx > 0 ? "right" : dx < 0 ? "left" : "none";

        newEvent.data.additional = { vertical: vertical, horizontal: horizontal };

        if (
          last.data.additional?.vertical === vertical &&
          last.data.additional?.horizontal === horizontal
        ) {
          queue.pop();
        } else if (
          last.data.additional?.vertical == null || last.data.additional?.horizontal == null
        ) {
          last.data.additional = { status: "scrolling start" };
        }
      }
      else if (
        last && eventData &&
        last.data.target && eventData.target &&
        (last.data.target.tag !== eventData.target.tag ||
        last.data.target.id !== eventData.target.id ||
        last.data.target.class !== eventData.target.class)
      ) {
        last.data.additional = { status: "scrolling start" };
      }

      /* ---------- RESIZE ---------- */
      else if (
        eventData.type === "resize" &&
        last &&
        last.data.type === "resize" &&
        now - last.timestamp <= 1000
      ) {
        const dx =
          (eventData.pageWidth ?? 0) - (last.data.pageWidth ?? 0);
        const dy =
          (eventData.pageHeight ?? 0) - (last.data.pageHeight ?? 0);

        const vertical = dy > 0 ? "larger" : dy < 0 ? "smaller" : "none";
        const horizontal = dx > 0 ? "larger" : dx < 0 ? "smaller" : "none";

        newEvent.data.additional = { vertical, horizontal };

        if (
          last.data.additional?.vertical === vertical &&
          last.data.additional?.horizontal === horizontal
        ) {
          queue.pop();
        }
      }

      /* ---------- KEYBOARD ---------- */
      else if (
        eventData.type === "keyboard" &&
        last &&
        last.data.type === "keyboard" &&
        now - last.timestamp <= 1500 &&
        sameTarget(last.data.target, eventData.target)
      ) {
        const t = eventData.target?.text ?? "";
        newEvent.data.target!.text =
          (last.data.target?.text ?? "") +
          (t.length > 1 ? `[${t}]` : t);

        if (last.data.additional?.status !== "keyboard start") {
          queue.pop();
        }
      }

      /* ---------- HOVER ---------- */
      else if (
        eventData.type === "chart data hover" &&
        last &&
        last.data.type === "chart data hover" &&
        now - last.timestamp <= 1000 &&
        sameTarget(last.data.target, eventData.target)
      ) {
        newEvent.data.additional.status = "chart data hover end";
        if (last.data.additional?.status === "chart data hover end") {
          queue.pop();
        }
      }

      /* ---------- DEFAULT START ---------- */
      else if (!last) {
        newEvent.data.additional.status = `${eventData.type} start`;
      }

      queue.push(newEvent);

      if (queue.length >= batchSize) {
        flush();
      }
    },
    [batchSize, flush]
  );

  useEffect(() => {
    timerRef.current = window.setInterval(() => flush(), flushInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      flush(true);
    };
  }, [flush, flushInterval]);

  /* ------------------------------ lifecycle ------------------------------ */

  useEffect(() => {
    // periodic flush
    timerRef.current = window.setInterval(() => flush(), flushInterval);

    // restore previous session logs
    readAndClearStored().then((stored) => {
      if (stored.length) {
        queueRef.current.push(...stored);
        flush();
      }
    });

    // unload handling
    const onUnload = () => flush(true);
    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush(true);
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener("beforeunload", onUnload);
      flush(true);
    };
  }, [flush, flushInterval]);

  const value = useMemo(() => ({
    logEvent,
  }), [logEvent]);

  return <LoggerContext.Provider value={value}>{children}</LoggerContext.Provider>;
}

export function useLogger() {
  const ctx = useContext(LoggerContext);
  if (!ctx) throw new Error("useLogger must be used within <LoggerProvider>");
  return ctx;
}
