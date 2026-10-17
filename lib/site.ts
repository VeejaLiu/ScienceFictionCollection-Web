export const CONTENT_REPO_OWNER = 'VeejaLiu'
export const CONTENT_REPO_NAME = 'ScienceFictionCollection'
export const CONTENT_REPO_URL = `https://github.com/${CONTENT_REPO_OWNER}/${CONTENT_REPO_NAME}`
export const APP_REPO_URL = 'https://github.com/VeejaLiu/ScienceFictionCollection-Web'
export const APP_REPO_NAME = 'VeejaLiu/ScienceFictionCollection-Web'
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''
export const SITE_URL = (process.env.SITE_URL || 'https://veejaliu.github.io/ScienceFictionCollection-Web/').replace(/\/?$/, '/')
export function withBasePath(path: string) { return `${BASE_PATH}${path}` }
export function absoluteUrl(path: string) { return new URL(path.replace(/^\//, ''), SITE_URL).href }
export function assetHref(path: string) {
  return withBasePath(`/collection/${path.split('/').map(encodeURIComponent).join('/')}`)
}
