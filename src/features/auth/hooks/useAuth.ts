import { useCallback, useSyncExternalStore } from 'react'
import { authService, authSessionStore } from '@/features/auth/services/authService'
import type { AuthUser } from '@/features/auth/types/auth.types'

let cachedRawJson: string | null = null
let cachedUser: AuthUser | null = null

function getSnapshot(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw =
    window.localStorage.getItem('ec_auth_session_user_v1') ??
    window.sessionStorage.getItem('ec_auth_session_user_v1')
  if (raw === cachedRawJson) {
    return cachedUser
  }
  cachedRawJson = raw
  cachedUser = authSessionStore.getCurrentUser()
  return cachedUser
}

export function useAuth() {
  const user = useSyncExternalStore(authSessionStore.subscribe, getSnapshot, () => null)

  const logout = useCallback(async () => {
    await authService.logout()
  }, [])

  return {
    user,
    isAuthenticated: Boolean(user),
    isStudent: user?.role === 'student',
    logout,
  }
}
