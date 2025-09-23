import { redirect } from 'react-router'
import { PATHS } from '../paths'
import type { QueryClient } from '@tanstack/react-query'
import { authService, type User } from '@/services/authService'

export const authLoader = (queryClient: QueryClient) => async () =>  {
  try{
    const user = queryClient.getQueryData<User>(['user'])

  if (user){
    return user
  }

  const freshUser = await authService.getMe()
  queryClient.setQueryData(['user'], freshUser)

  return freshUser
  }catch(error){
    const url = new URL(window.location.href)
    throw redirect(`${PATHS.login}?from=${encodeURIComponent(url.pathname + url.search)}`)
  }
  
}
