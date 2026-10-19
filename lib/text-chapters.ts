import type { ChapterTitleCorrection } from './metadata.ts'

export type TextChapter = { id: string; title: string; start: number; end: number; level: number }
type TextLine = { text: string; start: number; end: number; normalizedStart: number }

export function normalizeChapterInput(content: string) { return content.replace(/\r\n?/g, '\n') }

function textLines(content: string): TextLine[] {
  const lines: TextLine[] = []
  let start = 0, normalizedStart = 0
  const breaks = /\r\n|\r|\n/g
  for (const match of content.matchAll(breaks)) {
    const end = match.index!
    lines.push({ text: content.slice(start, end), start, end, normalizedStart })
    normalizedStart += end - start + 1
    start = end + match[0].length
  }
  lines.push({ text: content.slice(start), start, end: content.length, normalizedStart })
  return lines
}

const numberedHeading = /^(?:第\s*[0-9０-９〇零一二三四五六七八九十百千万萬两]+\s*[章节節回卷部篇集幕](?:$|[\s:：、.．\-—])|(?:chapter|part|book)\s+(?:\d+|[ivxlcdm]+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b)/iu
const partHeading = /^(?:第\s*[0-9０-９〇零一二三四五六七八九十百千万萬两]+\s*[卷部篇集幕]|(?:part|book)\s+)/iu
const namedHeading = /^(?:序(?:章|言)?|前言|楔子|引子|后记|後記|尾声|尾聲|终章|終章|附录|附錄|结束语|結束語)(?:$|[\s:：])/u

function headingNumber(value: string) {
  if (/^[0-9０-９]+$/u.test(value)) return Number(value.replace(/[０-９]/gu, digit => String(digit.charCodeAt(0) - 0xff10)))
  const digits: Record<string, number> = { 〇: 0, 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }
  const units: Record<string, number> = { 十: 10, 百: 100, 千: 1000, 万: 10000, 萬: 10000 }
  if (/^[〇零一二三四五六七八九两]+$/u.test(value)) return Number([...value].map(char => digits[char]).join(''))
  if (/^[〇零一二三四五六七八九十百千万萬两]+$/u.test(value)) {
    let total = 0, section = 0, number = 0
    for (const char of value) {
      if (char in digits) number = digits[char]
      else if (units[char] === 10000) { total += (section + number) * 10000; section = 0; number = 0 }
      else { section += (number || 1) * units[char]; number = 0 }
    }
    return total + section + number
  }
  if (/^(?=[IVXLCDM]+$)M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/iu.test(value)) {
    const roman: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
    const chars = [...value.toUpperCase()]
    return chars.reduce((sum, char, index) => sum + (roman[char] < (roman[chars[index + 1]] || 0) ? -roman[char] : roman[char]), 0)
  }
  return null
}

function numberedSections(lines: TextLine[], content: string) {
  const groups = new Map<string, { line: TextLine; number: number }[]>()
  for (const line of lines) {
    const title = line.text.trim()
    if (title.length > 100) continue
    const match = title.match(/^([0-9０-９]{1,4}|[〇零一二三四五六七八九十百千万萬两]{1,8}|[IVXLCDM]{1,8})($|[.．、]\s*|\s+)(.*)$/iu)
    if (!match) continue
    const number = headingNumber(match[1])
    if (number === null) continue
    const script = /^[0-9０-９]/u.test(match[1]) ? 'arabic' : /^[IVXLCDM]/iu.test(match[1]) ? 'roman' : 'chinese'
    const separator = !match[2] ? 'bare' : /^\s+$/u.test(match[2]) ? 'space' : match[2].trim().replace('．', '.')
    const key = `${script}:${separator}`
    const group = groups.get(key) || []
    group.push({ line, number }); groups.set(key, group)
  }
  const result: TextLine[] = []
  for (const group of groups.values()) {
    const filtered = new Set(withoutPrintedContents(group.map(item => item.line), lines, content).map(line => line.start))
    const candidates = group.filter(item => filtered.has(item.line.start))
    if (candidates.length < 3) continue
    let sequential = 0, substantial = 0, totalBody = 0
    for (let index = 1; index < candidates.length; index++) {
      const previous = candidates[index - 1], current = candidates[index]
      if (current.number === previous.number + 1) sequential++
      const body = content.slice(previous.line.end, current.line.start).trim().length
      totalBody += body
      if (body >= 80) substantial++
    }
    const intervals = candidates.length - 1
    if (sequential / intervals >= 0.75 && substantial / intervals >= 0.6 && totalBody / intervals >= 120) {
      result.push(...candidates.map(item => item.line))
    }
  }
  return result
}

function withoutPrintedContents(candidates: TextLine[], lines: TextLine[], content: string) {
  const marker = lines.find(line => line.start < 5000 && /^(?:目\s*录|目\s*錄|目次|contents|table of contents)$/iu.test(line.text.trim()))
  if (!marker) return candidates
  const first = candidates.findIndex(line => line.start > marker.end)
  if (first < 0) return candidates
  const seen = new Set<string>()
  for (let index = first; index < candidates.length; index++) {
    const line = candidates[index]
    if (index > first && content.slice(candidates[index - 1].end, line.start).trim()) break
    const key = line.text.trim().replace(/\s+/g, ' ')
    // An adjacent repetition after a dense printed TOC is the start of the
    // actual chapters. Keep that occurrence and every byte of the original text.
    if (seen.has(key) && seen.size >= 2) return [...candidates.slice(0, first), ...candidates.slice(index)]
    seen.add(key)
  }
  return candidates
}

/** Map worker offsets back to untouched source text, with a conservative
 * fallback for short books the statistical detector cannot score reliably. */
export function createTextChapters(content: string, detected: unknown, format = 'txt', corrections: ChapterTitleCorrection[] = []): TextChapter[] {
  const lines = textLines(content)
  const byOffset = new Map(lines.map(line => [line.normalizedStart, line]))
  const selected = new Map<number, TextLine>()
  const items = detected && typeof detected === 'object' ? (detected as { items?: unknown }).items : null
  if (Array.isArray(items)) {
    for (const item of items) {
      if (!item || typeof item.title !== 'string' || !Number.isSafeInteger(item.cursor)) continue
      const line = byOffset.get(item.cursor)
      if (line && line.text.trim() && line.text.trim() === item.title.trim() && line.text.trim().length <= 100) selected.set(line.start, line)
    }
  }
  const shortLines = lines.filter(line => line.text.trim().length > 0 && line.text.trim().length <= 100)
  const numbered = shortLines.filter(line => numberedHeading.test(line.text.trim()))
  if (numbered.length >= 2) for (const line of numbered) selected.set(line.start, line)
  for (const line of numberedSections(lines, content)) selected.set(line.start, line)
  if (format === 'md') for (const line of shortLines.filter(line => /^#{1,6}\s+\S/u.test(line.text.trim()))) selected.set(line.start, line)
  // Missing line breaks cannot be split reliably by punctuation or length.
  // Apply reviewed boundaries only to a unique, still-matching source prefix.
  for (const { prefix, title } of corrections) {
    if (!title || title.length > 100 || !prefix.startsWith(title) || /[\r\n]/u.test(prefix)) continue
    const matches = lines.filter(line => line.text.trimStart().startsWith(prefix))
    if (matches.length !== 1) continue
    const line = matches[0]
    const length = line.text.length - line.text.trimStart().length + title.length
    selected.set(line.start, { ...line, text: line.text.slice(0, length), end: line.start + length })
  }
  if (selected.size < 2 && format !== 'md') return []
  if (selected.size >= 2) for (const line of shortLines.filter(line => namedHeading.test(line.text.trim()))) {
    if (!selected.has(line.start)) selected.set(line.start, line)
  }
  if (selected.size > 5000) return []
  const candidates = withoutPrintedContents([...selected.values()].sort((a, b) => a.start - b.start), lines, content)
  const hasParts = candidates.some(line => partHeading.test(line.text.trim()))
  return candidates.map(line => {
    const title = line.text.trim()
    const markdown = format === 'md' ? title.match(/^(#{1,6})\s+/u) : null
    const level = markdown ? Math.min(2, markdown[1].length - 1) : hasParts && numberedHeading.test(title) && !partHeading.test(title) ? 1 : 0
    return { id: `text-chapter-${line.start}`, title, start: line.start, end: line.end, level }
  })
}
