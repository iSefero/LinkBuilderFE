/** Разбирает строку ссылок по разделителю | */
export function parseLinks(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Нормализует ввод textarea к формату хранения: `url1 | url2` */
export function normalizeLinksInput(raw: string): string {
  return parseLinks(raw).join(" | ");
}

export function hasLinks(raw: string): boolean {
  return parseLinks(raw).length > 0;
}
