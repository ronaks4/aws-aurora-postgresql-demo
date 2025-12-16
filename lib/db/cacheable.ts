export function cacheable<T>(fn: () => T, durationMs: number): () => T {
  let cachedValue: T | undefined = undefined;
  let expiryTime: number | undefined = undefined;

  return () => {
    const now = Date.now();
    if (
      cachedValue !== undefined &&
      expiryTime !== undefined &&
      now < expiryTime
    ) {
      return cachedValue;
    }
    const value = fn();
    cachedValue = value;
    expiryTime = now + durationMs;
    return value;
  };
}
