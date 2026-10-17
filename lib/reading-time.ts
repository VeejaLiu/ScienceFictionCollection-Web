/**
 * 根据文件大小（字节）预估阅读时长
 * 假设：中文 UTF-8 约 3 字节/字，阅读速度约 400 字/分钟
 */
export function estimateReadingTime(
  sizeInBytes: number,
  format: (key: 'minutes' | 'hours' | 'hoursMinutes', values: Record<string, number>) => string,
): string {
  const charsEstimated = Math.floor(sizeInBytes / 3)
  const minutes = Math.max(1, Math.ceil(charsEstimated / 400))

  if (minutes < 60) return format('minutes', { minutes })
  const hours = Math.floor(minutes / 60)
  const remainMins = minutes % 60
  if (remainMins === 0) return format('hours', { hours })
  return format('hoursMinutes', { hours, minutes: remainMins })
}
