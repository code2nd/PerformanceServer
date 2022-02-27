import { Context } from 'koa'
import { HttpException } from '../core/http-exception'
import type { Next } from '../types'

import config from '../config'

const catchError = async (ctx: Context, next: Next) => {
  try {
    await next()
  } catch (error) {
    // 开发环境且不是HttpException类型的错误
    const isHttpException = error instanceof HttpException
    const isDev = config.dev === 'development'

    if (isDev && !isHttpException) {
      throw error
    }

    if (isHttpException) {
      ctx.body = {
        msg: error.msg,
        errorCode: error.errorCode,
        request: `${ctx.method} ${ctx.path}`
      }
      ctx.status = error.code
    } else {
      console.error(error)
      // todo 将错误上传到数据库
      ctx.body = {
        msg: error.toString(),
        errorCode: 999,
        request: `${ctx.method} ${ctx.path}`
      }
      ctx.status = 500
    }
  }
}

export default catchError
