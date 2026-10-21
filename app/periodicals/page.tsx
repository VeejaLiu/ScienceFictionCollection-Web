import { Bookshelf } from '@/components/bookshelf'
import { readCollection } from '@/lib/collection'
import { isPeriodical } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'

export const metadata = {
  title: '期刊',
  description: '按刊名、年份和期号浏览科幻期刊，在线阅读完整期刊。',
  alternates: { canonical: absoluteUrl('/periodicals/') },
}

export default function PeriodicalsPage() {
  const catalog = readCollection()
  const periodical = catalog.authors.find(isPeriodical)
  if (!periodical) return <main className="mx-auto min-h-screen max-w-screen-2xl p-4"><h1 className="text-xl font-semibold">期刊</h1><p className="mt-4 text-muted-foreground">暂无收录期刊。</p></main>
  return <Bookshelf authors={catalog.authors} author={periodical} books={catalog.books.filter((issue) => issue.authorId === periodical.id)} />
}
