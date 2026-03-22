import type { AuthRequestContext } from './auth-request.js'

declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate` middleware after valid Bearer JWT */
      auth?: AuthRequestContext
    }
  }
}

export {}
