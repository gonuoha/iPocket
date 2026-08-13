/**
 * Item type colors are stored per type and tuned for dark surfaces, so they are
 * too light to read on the light theme. `--type-color-shade-amount` darkens them
 * per theme (0% on dark themes) instead of storing a second palette.
 */
export function adaptTypeColor(color: string): string {
  return `color-mix(in oklab, ${color}, var(--type-color-shade) var(--type-color-shade-amount))`;
}

export function typeColorTint(color: string, amount: string): string {
  return `color-mix(in srgb, ${adaptTypeColor(color)} ${amount}, transparent)`;
}
