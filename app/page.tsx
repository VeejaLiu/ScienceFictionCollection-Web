import { CatalogHome } from '@/components/bookshelf/catalog-home'
import { readCollection } from '@/lib/collection'
import { absoluteUrl } from '@/lib/site'

export const metadata = { alternates: { canonical: absoluteUrl('/') } }

export default function Home() {
  const catalog = readCollection()
  return <CatalogHome authors={catalog.authors} books={catalog.books} />
}
