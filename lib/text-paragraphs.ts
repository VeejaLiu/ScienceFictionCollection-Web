export type TextParagraph = { start: number; end: number; indentEnd: number }

/** Blank lines and indented CJK paragraphs are reliable boundaries. Ordinary
 * line breaks remain inside the paragraph, including hard-wrapped prose. */
export function textParagraphs(text: string): TextParagraph[] {
  const result: TextParagraph[] = []
  let start = -1, end = 0
  const finish = () => {
    if (start < 0) return
    const indent = text.slice(start, end).match(/^[^\S\r\n]+/u)?.[0].length || 0
    result.push({ start, end, indentEnd: start + indent })
    start = -1
  }
  for (const match of text.matchAll(/[^\r\n]+|\r\n|\r|\n/g)) {
    const line = match[0]
    if (/^[\r\n]/u.test(line)) {
      // Consecutive newlines delimit paragraphs; one newline can be a wrap.
      if (match.index! > end) finish()
      continue
    }
    if (!line.trim()) { finish(); continue }
    if (/^(?:　+|[ \t]{2,})(?=[\p{Script=Han}“‘「『])/u.test(line)) finish()
    if (start < 0) start = match.index!
    end = match.index! + line.length
  }
  finish()
  return result
}
