/** In-memory access token for API calls (refresh cookie restores session). */
let accessToken: string | null = null

export function setAccessTokenStore(token: string | null) {
  accessToken = token
}

export function getAccessTokenFromStore() {
  return accessToken
}
