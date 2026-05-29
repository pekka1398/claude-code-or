export type ModifierKey = 'shift' | 'command' | 'control' | 'option'

/**
 * Pre-warm the native modifier module.
 * No-op — modifiers-napi removed.
 */
export function prewarmModifiers(): void {
  // no-op
}

/**
 * Check if a specific modifier key is currently pressed.
 * Always returns false — modifiers-napi removed.
 */
export function isModifierPressed(_modifier: ModifierKey): boolean {
  return false
}
