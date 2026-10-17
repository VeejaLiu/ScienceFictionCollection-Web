'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { loadProgress, saveProgress, readScrollMetrics } from '@/lib/reading-progress'

interface ReadingProgressBarProps {
  children: React.ReactNode
  storageKey: string
  layoutKey?: string
  layoutAnchor?: number | null
}

export function ReadingProgressBar({ children, storageKey, layoutKey, layoutAnchor }: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastValidProgressRef = useRef(0)
  const lastResizeRef = useRef({ w: 0, h: 0 })

  const getScrollMetrics = useCallback(readScrollMetrics, [])

  const updateProgress = useCallback(() => {
    const { scrollTop, maxScroll } = getScrollMetrics()
    let ratio: number
    if (maxScroll > 0) {
      ratio = scrollTop / maxScroll
      lastValidProgressRef.current = Math.round(ratio * 1000) / 10
    } else {
      // maxScroll 为 0 时可能是移动端视口切换的中间态，保留上一次有效值避免跳到 0%
      ratio = lastValidProgressRef.current / 100
    }
    setProgress(Math.round(ratio * 1000) / 10)
    return ratio
  }, [getScrollMetrics])

  useEffect(() => {
    const ratio = loadProgress(storageKey)
    lastValidProgressRef.current = Math.round(ratio * 1000) / 10
    const scrollToRatio = () => {
      const { maxScroll } = getScrollMetrics()
      const targetRatio = lastValidProgressRef.current / 100
      const targetTop = targetRatio * maxScroll
      if (maxScroll > 0) {
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth',
        })
      }
      setProgress(Math.round(targetRatio * 1000) / 10)
    }
    const rafId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToRatio)
    })
    lastResizeRef.current = {
      w: typeof window !== 'undefined' ? window.innerWidth : 0,
      h: typeof window !== 'undefined' ? document.documentElement.clientHeight : 0,
    }
    const handleResize = () => {
      const w = window.innerWidth
      const h = document.documentElement.clientHeight
      const prev = lastResizeRef.current
      lastResizeRef.current = { w, h }
      // 移动端地址栏显隐通常只改变高度且变化较小，旋转屏幕会改变宽度；仅对「真实」resize 执行恢复滚动
      const widthChanged = Math.abs(w - prev.w) > 50
      if (widthChanged) {
        scrollToRatio()
      } else {
        updateProgress()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [getScrollMetrics, storageKey, updateProgress])

  useLayoutEffect(() => {
    if (layoutAnchor == null) return
    const restore = () => {
      const { maxScroll } = getScrollMetrics()
      lastValidProgressRef.current = layoutAnchor * 100
      window.scrollTo({ top: layoutAnchor * maxScroll, behavior: 'instant' })
      setProgress(Math.round(layoutAnchor * 1000) / 10)
    }
    restore()
    // Restore again after the browser finishes reflow and scroll anchoring.
    const frame = window.requestAnimationFrame(restore)
    return () => window.cancelAnimationFrame(frame)
  }, [layoutKey, layoutAnchor, getScrollMetrics])

  useEffect(() => {
    const handleScroll = () => {
      updateProgress()
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        const { scrollTop, maxScroll } = getScrollMetrics()
        const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0
        saveProgress(storageKey, ratio)
        saveTimeoutRef.current = null
      }, 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [getScrollMetrics, storageKey, updateProgress])

  const pct = Math.min(100, Math.max(0, progress))

  return (
    <div className="flex-1 min-h-0" style={{ overflowAnchor: 'none' }}>
      <div className="pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {children}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] px-3 border-t border-amber-200/60 dark:border-amber-800/30 bg-amber-100/80 dark:bg-amber-900/50 backdrop-blur-sm">
        <div className="flex-1 h-0.5 min-w-0 bg-amber-200/50 dark:bg-amber-800/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500/80 dark:bg-amber-500/70 rounded-full transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 tabular-nums shrink-0">
          {pct.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}
