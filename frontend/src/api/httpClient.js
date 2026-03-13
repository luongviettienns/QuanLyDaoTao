const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000').replace(/\/$/, '')

function parseJsonSafely(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function httpRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const rawBody = await response.text()
  const body = parseJsonSafely(rawBody)

  if (response.ok) {
    return {
      ok: true,
      status: response.status,
      data: body,
    }
  }

  return {
    ok: false,
    status: response.status,
    error: {
      code: body?.code || 'UNKNOWN_ERROR',
      message: body?.message || 'Request failed',
      details: body,
    },
  }
}
