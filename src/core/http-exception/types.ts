/**
 * ErrorCode 规范
 * 通用的错误码为10000~段
 * 客户端具体错误码为60000~段
 * 服务端具体错误码为80000~段
 */

export enum ErrorCode {
  SUCCESS = 0, // 请求成功
  SERVER_ERROR_CODE = 10000, // 服务器异常
  PARAMETER_ERROR_CODE = 10001, // 参数错误
  FORBBIDEN_ERROR_CODE = 10002, // 禁止访问(没有权限)
  AUTH_FAILED_ERROR_CODE = 10003, // 授权失败
  NOT_FOUND_ERROR_CODE = 10004, // 资源未找到
  REDIS_GET_ERROR_CODE = 80000, // redis存储错误
  REDIS_SET_ERROR_CODE = 80001, // redis取值错误
  EXIST_ERROR_CODE = 80002, // 已经存在
  TOKEN_ERROR_CODE = 60000 // 非法token
}

export enum HttpStatusCode {
  OK = 200, // 请求成功，一般用于GET与POST请求
  CREATED = 201, // 已创建。成功请求并创建了新的资源
  ACCEPTED = 202, // 已接受。已经接受请求，但未处理完成
  NO_CONTENT = 204, // 无内容。服务器成功处理，但未返回内容
  BAD_REQUEST = 400, // 客户端请求的语法错误，服务端无法理解
  UNAUTHORIZED = 401, // 请求要求用户的身份认证
  FORBIDDEN = 403, // 服务器理解请求客户端的请求，但是拒绝执行此请求
  NOT_FOUND = 404, // 服务器无法根据客户端的请求找到资源（网页）
  METHOD_NOT_ALLOWED = 405, // 客户端请求中的方法被禁止
  INTERNAL_SERVER_ERROR = 500 // 服务器内部错误，无法完成请求
}
