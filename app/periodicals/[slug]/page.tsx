import { readCollection } from '@/lib/collection'
import { isPeriodical } from '@/lib/metadata'

export { default, generateMetadata } from '../../authors/[slug]/page'
export const dynamicParams = false
export function generateStaticParams() {
  return readCollection().authors.filter(isPeriodical).map(({ slug }) => ({ slug }))
}
