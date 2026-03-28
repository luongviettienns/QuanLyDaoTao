export const SESSION_EXPIRED_EVENT = 'app:session-expired'

let emitted = false

/** Báo phiên không còn hợp lệ (JWT/refresh thất bại). Chỉ phát một lần cho đến khi reset. */
export function emitSessionExpired() {
  if (emitted) return
  emitted = true
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
}

export function resetSessionExpiredEmitter() {
  emitted = false
}
