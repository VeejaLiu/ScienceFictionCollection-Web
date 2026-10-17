"use client"

import Link from "next/link"
import { Github, Moon, Sun, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { locales, localeNames } from "@/lib/i18n"
import { CONTENT_REPO_URL } from "@/lib/site"

export function Header() {
  const { locale, setLocale, t } = useLanguage()
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    let next: "light" | "dark" = document.documentElement.classList.contains("dark") ? "dark" : "light"
    try {
      const saved = localStorage.getItem('reader-theme')
      if (saved === 'light' || saved === 'dark') next = saved
    } catch { /* Optional theme preference. */ }
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.style.colorScheme = next
    setTheme(next)
  }, [])

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    document.documentElement.classList.toggle("dark", next === "dark")
    document.documentElement.style.colorScheme = next
    try { localStorage.setItem('reader-theme', next) } catch { /* Optional theme preference. */ }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 sm:h-14 max-w-screen-2xl items-center gap-2 mx-auto px-3 sm:px-4">
        <Link href="/" className="flex flex-1 min-w-0 items-center gap-2">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-primary" />
          <span className="font-bold text-base sm:text-xl truncate">{t('siteTitle')}</span>
        </Link>
        <select
          aria-label={t('language')}
          value={locale}
          onChange={(event) => setLocale(event.target.value)}
          className="h-11 max-w-24 sm:max-w-36 rounded-md border border-input bg-background px-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {locales.map((code) => <option key={code} value={code} lang={code}>{localeNames[code]}</option>)}
        </select>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t('theme')} className="size-11 shrink-0">
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" asChild className="hidden size-11 shrink-0 sm:inline-flex">
          <a href={CONTENT_REPO_URL} target="_blank" rel="noopener noreferrer" aria-label={t('contentRepository')}>
            <Github className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </header>
  )
}
