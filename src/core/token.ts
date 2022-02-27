import * as jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
import config from '../config'
import { InvalidToken } from './http-exception'

class Token {
  static sign(userId: string, authLevel: number) {
    const { secretKey, expiresIn } = config.security
    const token = jwt.sign({ userId, authLevel }, secretKey, { expiresIn })

    return token
  }

  static verify(token: string) {
    try {
      const { secretKey } = config.security
      const decoded = jwt.verify(token, secretKey) as JwtPayload
      const { userId, authLevel } = decoded

      return {
        userId,
        authLevel
      }
    } catch (error) {
      throw new InvalidToken()
    }
  }
}

export default Token
