import { ACCESS_TOKEN_KEY } from '@/app/auth/auth-storage'

type TokenSetter = (token: string) => void

let setAccessTokenInReact: TokenSetter | null = null

/** Gắn cập nhật state React khi refresh token thành công (gọi một lần từ AuthProvider). */
export function configureAccessTokenSetter(setter: TokenSetter) {
  setAccessTokenInReact = setter
}

export function getAccessTokenFromStorage(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function persistAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  setAccessTokenInReact?.(token)
}
