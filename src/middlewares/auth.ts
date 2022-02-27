import type { Context, Next } from '../types'
import { AuthLevel } from '../types'

import { Forbbiden } from '../core/http-exception'
import Token from '../core/token'

class Auth {
  level: AuthLevel
  USER: number
  ADMIN: number
  SUPER_ADMIN: number

  constructor(level: number = AuthLevel.USER) {
    this.level = level
    this.USER = 8
    this.ADMIN = 16
    this.SUPER_ADMIN = 32
  }

  get v() {
    return async (ctx: Context, next: Next) => {
      const headers = ctx.request.headers
      if (!headers.authorization) {
        throw new Forbbiden('未登录')
      }

      const token = headers.authorization.slice(7)

      const { userId, authLevel } = Token.verify(token)

      if (authLevel < this.level) {
        throw new Forbbiden('权限不足')
      }

      ctx.auth = {
        userId,
        authLevel
      }

      await next()
    }
  }
}

export default Auth
