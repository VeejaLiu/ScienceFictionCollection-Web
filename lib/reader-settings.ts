export type ReaderSettings = {
  fontSize: number; lineHeight: number
  width: 'narrow' | 'standard' | 'wide'
  font: 'serif' | 'sans' | 'system'
  palette: 'auto' | 'white' | 'paper' | 'gray' | 'dark'
  paragraphSpacing: 0 | 0.6 | 1.2
  fontWeight: 400 | 600
  indent: 'original' | 'none' | 'two'
  alignment: 'start' | 'justify'
  letterSpacing: 0 | 0.04 | 0.08
}
export const readerSettingsKey = 'novel-reader:display'
export const defaultReaderSettings: ReaderSettings = {
  fontSize: 20, lineHeight: 1.9, width: 'standard', font: 'serif', palette: 'auto',
  paragraphSpacing: 0.6, fontWeight: 400, indent: 'original', alignment: 'justify', letterSpacing: 0,
}
export const readerFonts = {
  serif: 'ui-serif, Georgia, "Times New Roman", "Songti SC", SimSun, "Yu Mincho", Batang, serif',
  sans: '"Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

export function parseReaderSettings(value: unknown, fallback: Partial<ReaderSettings> = defaultReaderSettings): ReaderSettings {
  const settings = value && typeof value === 'object' ? value as Partial<ReaderSettings> : {}
  const defaults = { ...defaultReaderSettings, ...fallback }
  const option = <K extends keyof ReaderSettings>(key: K, choices: readonly ReaderSettings[K][]): ReaderSettings[K] =>
    choices.includes(settings[key] as ReaderSettings[K]) ? settings[key]! : defaults[key]
  return {
    fontSize: typeof settings.fontSize === 'number' && Number.isInteger(settings.fontSize) && settings.fontSize >= 16 && settings.fontSize <= 30 ? settings.fontSize : defaults.fontSize,
    lineHeight: option('lineHeight', [1.6, 1.9, 2.2]),
    width: option('width', ['narrow', 'standard', 'wide']), font: option('font', ['serif', 'sans', 'system']),
    palette: option('palette', ['auto', 'white', 'paper', 'gray', 'dark']),
    paragraphSpacing: option('paragraphSpacing', [0, 0.6, 1.2]), fontWeight: option('fontWeight', [400, 600]),
    indent: option('indent', ['original', 'none', 'two']), alignment: option('alignment', ['start', 'justify']),
    letterSpacing: option('letterSpacing', [0, 0.04, 0.08]),
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
