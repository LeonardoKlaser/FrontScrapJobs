import { getToken } from '@/utils/session'
import { redirect } from 'react-router'
import { PATHS } from '../paths'

export async function authLoader() {
  const token = getToken()
  if (!token) throw redirect(PATHS.login)

  return null
}
