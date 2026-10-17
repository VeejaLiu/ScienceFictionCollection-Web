'use client'

import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { parseReaderSettings, readerSettingsKey, defaultReaderSettings, type ReaderSettings } from '@/lib/reader-settings'

export function useReaderSettings() {
  const [settings, setSettings] = useState(defaultReaderSettings)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const fallback = { ...defaultReaderSettings, fontSize: window.matchMedia('(max-width: 639px)').matches ? 18 : 20 }
    try { setSettings(parseReaderSettings(JSON.parse(localStorage.getItem(readerSettingsKey) || 'null'), fallback)) }
    catch { setSettings(fallback) }
    setReady(true)
  }, [])
  const update = (value: ReaderSettings) => {
    const next = parseReaderSettings(value)
    setSettings(next)
    try { localStorage.setItem(readerSettingsKey, JSON.stringify(next)) } catch { /* Preferences are optional. */ }
  }
  return { settings, update, ready }
}

export function ReaderSettingsBar({ settings, onChange }: { settings: ReaderSettings; onChange: (settings: ReaderSettings) => void }) {
  const { t } = useLanguage()
  return <div className="sticky top-16 sm:top-14 z-30 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-y bg-background/95 px-2 py-2 backdrop-blur">
    <div className="flex items-center gap-1">
      <span className="mr-1 text-sm">{t('fontSize')}</span>
      <Button variant="ghost" size="icon" className="size-11" disabled={settings.fontSize <= 16} aria-label={t('smallerText')} onClick={() => onChange({ ...settings, fontSize: Math.max(16, settings.fontSize - 2) })}><Minus aria-hidden="true" /></Button>
      <output className="min-w-6 text-center text-sm tabular-nums" aria-label={t('fontSize')}>{settings.fontSize}</output>
      <Button variant="ghost" size="icon" className="size-11" disabled={settings.fontSize >= 30} aria-label={t('largerText')} onClick={() => onChange({ ...settings, fontSize: Math.min(30, settings.fontSize + 2) })}><Plus aria-hidden="true" /></Button>
    </div>
    <label className="flex min-w-0 items-center gap-2 text-sm">
      <span>{t('lineSpacing')}</span>
      <select className="min-h-11 rounded-md border bg-background px-2 text-base" value={settings.lineHeight} aria-label={t('lineSpacing')} onChange={(event) => onChange({ ...settings, lineHeight: Number(event.target.value) })}>
        <option value="1.6">{t('compactSpacing')}</option>
        <option value="1.9">{t('normalSpacing')}</option>
        <option value="2.2">{t('wideSpacing')}</option>
      </select>
    </label>
  </div>
}
