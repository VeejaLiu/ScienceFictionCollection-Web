import { cookies } from 'next/headers'
import { localeCookie, resolveLocale } from './i18n'

export async function getServerLocale() {
  return resolveLocale((await cookies()).get(localeCookie)?.value)
}
