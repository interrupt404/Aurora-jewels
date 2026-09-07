// lib/utils/haptics.ts
// ──────────────────────────────────────────────────────────────────
// Haptic feedback utility for native-feeling micro-interactions.
// Provides tactile feedback on supported mobile devices (Android
// Chrome primarily) without throwing on SSR or unsupported browsers.
// ──────────────────────────────────────────────────────────────────

/**
 * Triggers a short vibration for tactile feedback on mobile taps.
 *
 * @param duration  Vibration length in milliseconds (default 15ms —
 *                  short enough to feel like a "click", not a buzz).
 *
 * Safety checks:
 *  1. `typeof window !== 'undefined'` — guards against SSR / Node
 *  2. `'vibrate' in navigator`        — guards iOS & older browsers
 */
export function triggerHaptic(duration = 15): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(duration);
  }
}
