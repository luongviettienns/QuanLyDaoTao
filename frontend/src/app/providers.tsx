import type { PropsWithChildren } from 'react'
import { AuthProvider } from '@/app/auth/auth-provider'

export function AppProviders({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>
}
