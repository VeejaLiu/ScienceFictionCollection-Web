export type ReaderSettings = { fontSize: number; lineHeight: number }
export const readerSettingsKey = 'novel-reader:display'
export const defaultReaderSettings: ReaderSettings = { fontSize: 20, lineHeight: 1.9 }

export function parseReaderSettings(value: unknown, fallback = defaultReaderSettings): ReaderSettings {
  const settings = value && typeof value === 'object' ? value as Partial<ReaderSettings> : {}
  return {
    fontSize: typeof settings.fontSize === 'number' && Number.isInteger(settings.fontSize) && settings.fontSize >= 16 && settings.fontSize <= 30 ? settings.fontSize : fallback.fontSize,
    lineHeight: [1.6, 1.9, 2.2].includes(settings.lineHeight as number) ? settings.lineHeight! : fallback.lineHeight,
  }
}

export type ContentsItem = { href: string; label: string; subitems?: ContentsItem[] }

export function flattenContents(items: ContentsItem[], depth = 0): { href: string; label: string }[] {
  return items.flatMap((item) => [
    { href: item.href, label: `${'　'.repeat(depth)}${item.label.trim()}` },
    ...flattenContents(item.subitems || [], depth + 1),
  ])
}

export function validEpubCfi(value: unknown): value is string {
  return typeof value === 'string' && value.length < 8192 && /^epubcfi\(.+\)$/.test(value)
}
