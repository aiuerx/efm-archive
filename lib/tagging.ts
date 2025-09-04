// Tags you want to show as filters (edit anytime)
export const KNOWN_TAGS = [
  "technique","routing","fx","templates","synthesis","elektron","download","samples","yamaha","patch"
];

export function normalizeTags(raw: string[]): string[] {
  return raw.map(t => t.trim().toLowerCase()).filter(Boolean);
}
