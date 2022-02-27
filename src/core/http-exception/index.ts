import { HttpStatusCode, ErrorCode } from './types'
import errorMsg from './config'

class HttpException extends Error {
  errorCode: ErrorCode
  code: HttpStatusCode
  msg: string | string[]

  constructor(
    msg = errorMsg.SERVER_ERROR_CODE,
    errorCode = ErrorCode.SERVER_ERROR_CODE,
    code = HttpStatusCode.INTERNAL_SERVER_ERROR
  ) {
    super()
    this.errorCode = errorCode
    this.code = code
    this.msg = msg
  }
}

class ParameterException extends HttpException {
  errorCode: ErrorCode
  code: HttpStatusCode
  msg: string | string[]

  constructor(
    msg: string | string[] = errorMsg.PARAMETER_ERROR_CODE,
    errorCode = ErrorCode.PARAMETER_ERROR_CODE
  ) {
    super()
    this.code = HttpStatusCode.BAD_REQUEST
    this.msg = msg
    this.errorCode = errorCode
  }
}

class Forbbiden extends HttpException {
  errorCode: ErrorCode
  msg: string | string[]

  constructor(
    msg = errorMsg.FORBBIDEN_ERROR_CODE,
    errorCode = ErrorCode.FORBBIDEN_ERROR_CODE
  ) {
    super()
    this.msg = msg
    this.errorCode = errorCode
    this.code = HttpStatusCode.FORBIDDEN
  }
}

class RedisException extends HttpException {
  msg: string | string[]
  errorCode: ErrorCode

  constructor(
    msg = errorMsg.REDIS_GET_ERROR_CODE,
    errorCode = ErrorCode.REDIS_GET_ERROR_CODE
  ) {
    super()
    this.msg = msg
    this.errorCode = errorCode
  }
}

class Exist extends HttpException {
  constructor(
    msg = errorMsg.EXIST_ERROR_CODE,
    errorCode = ErrorCode.EXIST_ERROR_CODE
  ) {
    super()
    this.code = HttpStatusCode.FORBIDDEN
    this.msg = msg
    this.errorCode = errorCode
  }
}

class NotFound extends HttpException {
  constructor(
    msg = errorMsg.NOT_FOUND_ERROR_CODE,
    errorCode = ErrorCode.NOT_FOUND_ERROR_CODE
  ) {
    super()
    this.code = HttpStatusCode.NOT_FOUND
    this.msg = msg
    this.errorCode = errorCode
  }
}

class AuthFailed extends HttpException {
  constructor(
    msg = errorMsg.AUTH_FAILED_ERROR_CODE,
    errorCode = ErrorCode.AUTH_FAILED_ERROR_CODE
  ) {
    super()
    this.code = HttpStatusCode.FORBIDDEN
    this.msg = msg
    this.errorCode = errorCode
  }
}

class Success extends HttpException {
  msg: string | string[]
  errorCode: ErrorCode
  code: HttpStatusCode

  constructor(
    msg = errorMsg.SUCCESS,
    code = HttpStatusCode.OK,
    errorCode = ErrorCode.SUCCESS
  ) {
    super()
    this.msg = msg
    this.code = code
    this.errorCode = errorCode
  }
}

class InvalidToken extends HttpException {
  msg: string | string[]
  code: HttpStatusCode
  errorCode: ErrorCode

  constructor(msg = errorMsg.TOKEN_ERROR_CODE) {
    super()
    this.msg = msg
    this.code = HttpStatusCode.FORBIDDEN
    this.errorCode = ErrorCode.TOKEN_ERROR_CODE
  }
}

export {
  HttpException,
  ParameterException,
  Forbbiden,
  RedisException,
  Exist,
  NotFound,
  AuthFailed,
  Success,
  InvalidToken
}
