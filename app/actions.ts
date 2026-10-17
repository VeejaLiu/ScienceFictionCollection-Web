
'use server'

import { fetchRepoContents, fetchAuthorBooks, fetchFileContent } from "@/lib/github";
import { CONTENT_REPO_OWNER, CONTENT_REPO_NAME } from '@/lib/site';
import { isCollectionPath } from '@/lib/book-path';

export async function getRepoContentsAction(path: string = "") {
  if (!isCollectionPath(path, true)) return { error: 'Invalid collection path' };
  
  try {
    const contents = await fetchRepoContents(CONTENT_REPO_OWNER, CONTENT_REPO_NAME, path);
    return { contents };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function getAuthorBooksAction(author: string) {
  if (!isCollectionPath(author) || author.includes('/')) return { error: 'Invalid author path' };
  try {
    return { books: await fetchAuthorBooks(CONTENT_REPO_OWNER, CONTENT_REPO_NAME, author) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : '无法加载作品' };
  }
}

export async function getBookAction(path: string) {
  if (!isCollectionPath(path) || !/\.(txt|md)$/i.test(path)) return { error: 'Invalid book path' };
  try {
    const file = await fetchRepoContents(CONTENT_REPO_OWNER, CONTENT_REPO_NAME, path);
    if (Array.isArray(file) || file.type !== 'file' || !file.download_url) return { error: 'Book not found' };
    const url = new URL(file.download_url);
    if (url.origin !== 'https://raw.githubusercontent.com'
      || !url.pathname.toLowerCase().startsWith(`/${CONTENT_REPO_OWNER}/${CONTENT_REPO_NAME}/`.toLowerCase())) {
      return { error: 'Unexpected book source' };
    }
    const content = await fetchFileContent(file.download_url);
    return { file, content };
  } catch (e: any) {
    return { error: e.message };
  }
}
