import type { Redis } from '../../types'
import { RedisException } from '../../core/http-exception'

class RedisSessionStore {
  client: Redis

  constructor(client: Redis) {
    this.client = client
  }

  // 获取 redis 中存储的 session 数据
  async get(sid: string) {
    const id = this.getRedisSessionId(sid)
    const data = await this.client.get(id)

    if (!data) {
      return null
    }

    try {
      return JSON.parse(data)
    } catch (err) {
      throw new RedisException(err)
    }
  }

  // 存储 session 数据到 redis
  async set(sid: string, value: any, ttl?: any) {
    const id = this.getRedisSessionId(sid)
    if (typeof ttl === 'number') {
      ttl = Math.ceil(ttl / 1000)
    }

    try {
      const sessStr = JSON.stringify(value)
      if (ttl) {
        await this.client.setex(id, ttl, sessStr)
      } else {
        await this.client.set(id, sessStr)
      }
    } catch (err) {
      throw new RedisException(err)
    }
  }

  async destroy(sid: string) {
    const id = this.getRedisSessionId(sid)
    await this.client.del(id)
  }

  private getRedisSessionId(sid: string) {
    return `ssid:${sid}`
  }
}

export default RedisSessionStore
