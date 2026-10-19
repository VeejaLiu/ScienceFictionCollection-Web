'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Minus, Plus, RotateCcw, X } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import type { MessageKey } from '@/lib/i18n'
import { parseReaderSettings, readerSettingsKey, defaultReaderSettings, type ReaderSettings } from '@/lib/reader-settings'
import './reader-settings.css'

export function useReaderSettings() {
  const [settings, setSettings] = useState(defaultReaderSettings)
  const current = useRef(settings)
  current.current = settings
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const fallback = { ...defaultReaderSettings, fontSize: window.matchMedia('(max-width: 639px)').matches ? 18 : 20 }
    try { setSettings(parseReaderSettings(JSON.parse(localStorage.getItem(readerSettingsKey) || 'null'), fallback)) }
    catch { setSettings(fallback) }
    setReady(true)
    const useSiteTheme = () => {
      const next = { ...current.current, palette: 'auto' as const }
      setSettings(next)
      try { localStorage.setItem(readerSettingsKey, JSON.stringify(next)) } catch { /* Optional preferences. */ }
    }
    window.addEventListener('reader-use-site-theme', useSiteTheme)
    return () => window.removeEventListener('reader-use-site-theme', useSiteTheme)
  }, [])
  const update = (value: ReaderSettings) => {
    const next = parseReaderSettings(value)
    setSettings(next)
    try { localStorage.setItem(readerSettingsKey, JSON.stringify(next)) } catch { /* Preferences are optional. */ }
  }
  return { settings, update, ready }
}

function SettingsControls({ settings, onChange, onClose, sheet }: {
  settings: ReaderSettings; onChange: (settings: ReaderSettings) => void; onClose: () => void; sheet: boolean
}) {
  const { t } = useLanguage()
  const [more, setMore] = useState(false)
  const moreId = useId()
  const change = (key: keyof ReaderSettings, value: unknown) => onChange(parseReaderSettings({ ...settings, [key]: value }))
  const select = (key: keyof ReaderSettings, label: MessageKey, choices: readonly (readonly [string | number, MessageKey])[]) => <label className="reader-setting-field">
    <span>{t(label)}</span>
    <select aria-label={t(label)} value={settings[key]} onChange={event => change(key, typeof choices[0][0] === 'number' ? Number(event.target.value) : event.target.value)}>
      {choices.map(([value, name]) => <option key={value} value={value}>{t(name)}</option>)}
    </select>
  </label>
  return <>
    <div className="reader-settings-heading">
      {sheet ? <SheetTitle>{t('readingSettings')}</SheetTitle> : <h2>{t('readingSettings')}</h2>}
      <Button variant="ghost" size="icon" className="size-11 rounded-full" aria-label={t('closeReadingSettings')} onClick={onClose}><X aria-hidden="true" className="size-4" /></Button>
    </div>
    {sheet && <SheetDescription className="sr-only">{t('settingsDescription')}</SheetDescription>}
    <div className="reader-settings-fields">
      <div className="reader-setting-size">
        <span>{t('fontSize')}</span>
        <div className="reader-size-stepper">
          <Button variant="ghost" size="icon" className="size-11" disabled={settings.fontSize <= 16} aria-label={t('smallerText')} onClick={() => change('fontSize', Math.max(16, settings.fontSize - 2))}><Minus aria-hidden="true" className="size-4" /></Button>
          <output aria-label={t('fontSize')}>{settings.fontSize}</output>
          <Button variant="ghost" size="icon" className="size-11" disabled={settings.fontSize >= 30} aria-label={t('largerText')} onClick={() => change('fontSize', Math.min(30, settings.fontSize + 2))}><Plus aria-hidden="true" className="size-4" /></Button>
        </div>
      </div>
      <div className="reader-settings-grid">
        {select('font', 'fontFamily', [['serif', 'fontSerif'], ['sans', 'fontSans'], ['system', 'fontSystem']])}
        {select('lineHeight', 'lineSpacing', [[1.6, 'compactSpacing'], [1.9, 'normalSpacing'], [2.2, 'wideSpacing']])}
      </div>
      <fieldset className="reader-setting-field">
        <legend>{t('textWidth')}</legend>
        <div className="reader-setting-segments">
          {(['narrow', 'standard', 'wide'] as const).map((width, index) => <button key={width} type="button" aria-pressed={settings.width === width} onClick={() => change('width', width)}>
            {t((['widthNarrow', 'widthStandard', 'widthWide'] as const)[index])}
          </button>)}
        </div>
      </fieldset>
      <fieldset className="reader-setting-field">
        <legend>{t('readingPalette')}</legend>
        <div className="reader-palette-choices">
          {(['auto', 'white', 'paper', 'gray', 'dark'] as const).map((palette, index) => <button key={palette} type="button" aria-label={t((['paletteAuto', 'paletteWhite', 'palettePaper', 'paletteGray', 'paletteDark'] as const)[index])} aria-pressed={settings.palette === palette} onClick={() => change('palette', palette)}>
            <span className="reader-palette-swatch" data-palette={palette} aria-hidden="true">Aa</span>
            <span>{t((['paletteAuto', 'paletteWhite', 'palettePaper', 'paletteGray', 'paletteDark'] as const)[index])}</span>
          </button>)}
        </div>
      </fieldset>
      <div className="reader-settings-actions">
        <button type="button" aria-expanded={more} aria-controls={moreId} onClick={() => setMore(!more)}>{t('moreTypography')}<ChevronDown className={`size-4 ${more ? 'rotate-180' : ''}`} aria-hidden="true" /></button>
        <button type="button" onClick={() => onChange({ ...defaultReaderSettings, fontSize: window.matchMedia('(max-width: 639px)').matches ? 18 : 20 })}><RotateCcw className="size-3.5" aria-hidden="true" />{t('resetReadingSettings')}</button>
      </div>
      {more && <div id={moreId} className="reader-settings-grid reader-settings-advanced">
        {select('paragraphSpacing', 'paragraphSpacing', [[0, 'compactSpacing'], [0.6, 'normalSpacing'], [1.2, 'wideSpacing']])}
        {select('fontWeight', 'textWeight', [[400, 'weightRegular'], [600, 'weightMedium']])}
        {select('indent', 'firstLineIndent', [['original', 'indentOriginal'], ['none', 'indentNone'], ['two', 'indentTwo']])}
        {select('alignment', 'textAlignment', [['start', 'alignStart'], ['justify', 'alignJustify']])}
        {select('letterSpacing', 'letterSpacing', [[0, 'normalSpacing'], [0.04, 'slightSpacing'], [0.08, 'wideSpacing']])}
      </div>}
    </div>
  </>
}

export function ReaderSettingsBar({ settings, onChange }: { settings: ReaderSettings; onChange: (settings: ReaderSettings) => void }) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [mobile, setMobile] = useState(false)
  const mobileRef = useRef(mobile)
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const wasOpenOnPointerDown = useRef(false)
  const suppressFocus = useRef(false)
  const panelId = useId()
  const inside = (target: EventTarget | null) => target instanceof Node && Boolean(root.current?.contains(target) || panel.current?.contains(target))
  const close = () => {
    clearTimeout(hideTimer.current); hideTimer.current = undefined
    suppressFocus.current = true
    setVisible(false)
    trigger.current?.focus({ preventScroll: true })
    requestAnimationFrame(() => { suppressFocus.current = false })
  }

  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 767px)')
    const change = () => { mobileRef.current = narrow.matches; setMobile(narrow.matches); setVisible(false) }
    change(); narrow.addEventListener('change', change)
    const contains = (target: EventTarget | null) => target instanceof Node && Boolean(root.current?.contains(target) || panel.current?.contains(target))
    const cancelHide = () => { clearTimeout(hideTimer.current); hideTimer.current = undefined }
    const show = () => { cancelHide(); setVisible(true) }
    const hide = () => { cancelHide(); setVisible(false) }
    const focused = () => document.activeElement !== trigger.current && contains(document.activeElement)
    const hideSoon = () => {
      if (hideTimer.current) return
      hideTimer.current = setTimeout(() => { hideTimer.current = undefined; if (!focused()) setVisible(false) }, 240)
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || mobileRef.current) return
      const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
      const bounds = panel.current?.getBoundingClientRect()
      const approachingPanel = bounds && event.clientX >= bounds.left - 16 && event.clientX <= bounds.right + 16
        && event.clientY >= headerBottom && event.clientY <= bounds.bottom + 12
      if (event.clientY <= headerBottom + 24 || approachingPanel || contains(event.target) || focused()) show()
      else hideSoon()
    }
    const dismiss = (event: PointerEvent) => { if (!mobileRef.current && !contains(event.target)) hide() }
    const leaveWindow = (event: PointerEvent) => { if (!mobileRef.current && event.pointerType !== 'touch' && !event.relatedTarget && !focused()) hideSoon() }
    const blur = () => { if (!mobileRef.current && (document.activeElement?.tagName !== 'SELECT' || !focused())) hide() }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', dismiss, { passive: true })
    window.addEventListener('pointerout', leaveWindow)
    window.addEventListener('blur', blur)
    return () => {
      cancelHide(); narrow.removeEventListener('change', change)
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('pointerout', leaveWindow); window.removeEventListener('blur', blur)
    }
  }, [])

  return <div ref={root} onFocusCapture={() => {
    if (suppressFocus.current || mobileRef.current) return
    clearTimeout(hideTimer.current); hideTimer.current = undefined; setVisible(true)
  }} onBlurCapture={event => {
    if (!mobileRef.current && !inside(event.relatedTarget)) setVisible(false)
  }} onKeyDown={event => {
    if (event.key === 'Escape' && !mobileRef.current) { event.preventDefault(); close() }
  }}>
    <Button ref={trigger} variant="ghost" size="icon" className="reader-settings-launcher size-11 rounded-full border bg-background/95 shadow-sm backdrop-blur" aria-label={t('readingSettings')} aria-controls={panelId} aria-expanded={visible} aria-haspopup={mobile ? 'dialog' : undefined}
      onPointerDown={() => { wasOpenOnPointerDown.current = visible }} onClick={event => setVisible(event.detail === 0 ? true : !wasOpenOnPointerDown.current)}>
      <span className="font-serif text-base" aria-hidden="true">Aa</span>
    </Button>
    {!mobile && visible && <div ref={panel} id={panelId} role="group" aria-label={t('readingSettings')} className="reader-settings-panel">
      <SettingsControls settings={settings} onChange={onChange} onClose={close} sheet={false} />
    </div>}
    <Sheet open={mobile && visible} onOpenChange={setVisible}>
      <SheetContent ref={mobile ? panel : undefined} side="bottom" id={mobile ? panelId : undefined} className="reader-settings-sheet gap-0 [&>button]:hidden" onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus({ preventScroll: true }) }}>
        <SettingsControls settings={settings} onChange={onChange} onClose={close} sheet />
      </SheetContent>
    </Sheet>
  </div>
}
