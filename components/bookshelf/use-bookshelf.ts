'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getRepoContentsAction, getAuthorBooksAction, getBookAction } from '@/app/actions'
import { GitHubFile } from '@/lib/github'
import { getBookPath } from '@/lib/book-path'
import type { MessageKey } from '@/lib/i18n'

export function useBookshelf(mode: 'home' | 'author' | 'book') {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!searchParams.has('repo')) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete('repo')
    router.replace(`${mode === 'book' ? '/book' : '/'}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, mode])

  let author = ''
  let book = ''
  if (mode === 'author') {
    author = searchParams.get('name') || ''
  } else if (mode === 'book') {
    author = searchParams.get('author') || ''
    book = searchParams.get('name') || ''
  } else {
    author = searchParams.get('author') || ''
  }

  const [authors, setAuthors] = useState<GitHubFile[]>([])
  const [books, setBooks] = useState<GitHubFile[]>([])
  const [authorsLoading, setAuthorsLoading] = useState(false)
  const [booksLoading, setBooksLoading] = useState(false)
  const [contentLoading, setContentLoading] = useState(false)
  const loading = authorsLoading || booksLoading || contentLoading
  const [error, setError] = useState<MessageKey | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<GitHubFile | null>(null)

  const hasAutoSelected = useRef(false)

  useEffect(() => {
    if (mode !== 'home') return
    hasAutoSelected.current = false
    let cancelled = false

    const loadAuthors = async () => {
      setAuthorsLoading(true)
      setError(null)
      try {
        const result = await getRepoContentsAction()
        if (cancelled) return
        if (result.error) {
          setError('loadError')
          setAuthors([])
          return
        }
        const data = result.contents
        if (Array.isArray(data)) {
          const dirs = data.filter((item) => item.type === 'dir')
          setAuthors(dirs)
          if (!author && dirs.length > 0 && !hasAutoSelected.current) {
            hasAutoSelected.current = true
            const params = new URLSearchParams()
            params.set('author', dirs[0].name)
            router.replace(`/?${params.toString()}`, { scroll: false })
          }
        }
      } catch (e) {
        if (!cancelled) setError('loadError')
      } finally {
        if (!cancelled) setAuthorsLoading(false)
      }
    }
    loadAuthors()
    return () => { cancelled = true }
  }, [mode, author, router])

  useEffect(() => {
    if (!author || (mode !== 'home' && mode !== 'author')) {
      setBooks([])
      setBooksLoading(false)
      return
    }
    let cancelled = false

    const loadBooks = async () => {
      setBooksLoading(true)
      setBooks([])
      setError(null)
      try {
        const result = await getAuthorBooksAction(author)
        if (cancelled) return
        if (result.error) {
          setError('loadError')
          setBooks([])
          return
        }
        setBooks(result.books || [])
      } catch (e) {
        if (!cancelled) setError('loadError')
      } finally {
        if (!cancelled) setBooksLoading(false)
      }
    }
    loadBooks()
    return () => { cancelled = true }
  }, [author, mode])

  useEffect(() => {
    if (mode !== 'book' || !author || !book) return
    let cancelled = false

    const loadBook = async () => {
      setContentLoading(true)
      setError(null)
      setFileContent(null)
      setCurrentFile(null)
      try {
        const filePath = `${author}/${book}`
        const result = await getBookAction(filePath)
        if (cancelled) return
        if (result.error) {
          setError('readError')
          return
        }
        setCurrentFile(result.file || null)
        setFileContent(result.content || '')
      } catch (e) {
        if (!cancelled) setError('readError')
      } finally {
        if (!cancelled) setContentLoading(false)
      }
    }
    loadBook()
    return () => { cancelled = true }
  }, [author, book, mode])

  const handleAuthorSelect = (name: string) => {
    const params = new URLSearchParams()
    params.set('author', name)
    router.push(`/?${params.toString()}`)
  }

  const handleBookClick = (file: GitHubFile) => {
    const params = new URLSearchParams()
    params.set('author', author)
    params.set('name', getBookPath(file, author))
    router.push(`/book?${params.toString()}`)
  }

  return {
    author,
    book,
    authors,
    books,
    loading,
    error,
    fileContent,
    currentFile,
    isReaderMode: mode === 'book',
    handleAuthorSelect,
    handleBookClick,
  }
}
