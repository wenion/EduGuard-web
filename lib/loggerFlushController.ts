let flushHandler: ((sync?: boolean) => Promise<void>) | null = null;

export function registerLoggerFlush(fn: (sync?: boolean) => Promise<void>) {
  flushHandler = fn;
}

export async function flushLogger(sync = true) {
  if (flushHandler) {
    await flushHandler(sync);
  }
}