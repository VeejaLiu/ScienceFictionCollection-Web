import { redirect } from 'next/navigation'

export default async function AuthorPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>
}) {
  const params = await searchParams
  const author = params.name || ''

  const query = new URLSearchParams()
  if (author) query.set('author', author)

  redirect(`/?${query.toString()}`)
}
