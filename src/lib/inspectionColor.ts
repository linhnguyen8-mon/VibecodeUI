/** Preserve alpha while displaying browser-computed sRGB colors as HEX. */
export function inspectionColor(value: string): string {
  const match = value.match(/^rgba?\(([^)]+)\)$/);
  if (!match) return value;
  const channels = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  if (channels.length < 3 || channels.some(channel => !Number.isFinite(channel))) return value;
  const hex = channels.slice(0, 3).map(channel => Math.round(channel).toString(16).padStart(2, '0')).join('');
  const alpha = channels[3];
  return `#${hex}${alpha !== undefined && alpha < 1 ? Math.round(alpha * 255).toString(16).padStart(2, '0') : ''}`.toUpperCase();
}
