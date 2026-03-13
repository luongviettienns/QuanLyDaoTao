import { httpRequest } from '../../../api/httpClient'

export async function loginApi({ identifier, password, rememberMe = false }) {
  return httpRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifier,
      password,
      rememberMe,
    }),
  })
}

export async function meApi(accessToken) {
  return httpRequest('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function logoutApi(accessToken) {
  return httpRequest('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
