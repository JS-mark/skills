/**
 * Ensure a value is an array.
 */
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * No-op function.
 */
export function noop(): void {}

/**
 * Type guard to filter out null and undefined values.
 */
export function notNullish<T>(value: T | null | undefined): value is T {
  return value != null
}

/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
