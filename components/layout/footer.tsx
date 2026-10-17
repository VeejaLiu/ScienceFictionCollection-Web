"use client"

import { Github, BookOpen } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { APP_REPO_URL, APP_REPO_NAME, CONTENT_REPO_URL, withBasePath } from "@/lib/site"

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-auto">
      <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-medium">{t('siteTitle')}</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-end gap-3 min-w-0 text-sm text-muted-foreground">
            <a href={CONTENT_REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-foreground">
              {t('contentRepository')}
            </a>
            <a href={withBasePath('/third-party-notices.txt')} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-foreground">
              {t('licenses')}
            </a>
            <a href={APP_REPO_URL} target="_blank" rel="noopener noreferrer" aria-label={t('sourceCode')}
              className="inline-flex min-h-11 items-center gap-2 hover:text-foreground break-all">
              <Github className="h-5 w-5 shrink-0" />
              <span>{APP_REPO_NAME}</span>
            </a>
          </div>
        </div>
        <p className="mt-4 pt-4 border-t border-border/40 text-center text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
    </footer>
  )
}
