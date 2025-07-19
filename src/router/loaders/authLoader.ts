import { getToken } from '@/utils/session'
import { redirect } from 'react-router'
import { PATHS } from '../paths'

export async function authLoader({ request }: { request: Request }) {
  const token = getToken()
  if (!token) {
    const url = new URL(request.url)

    throw redirect(`${PATHS.login}?from=${encodeURIComponent(url.pathname + url.search)}`)
  }

  return null
}
