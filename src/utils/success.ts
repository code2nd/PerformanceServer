import { Success } from '../core/http-exception'
import errorMsg from '../core/http-exception/config'
import { ErrorCode, HttpStatusCode } from '../core/http-exception/types'

const success = (
  msg = errorMsg.SUCCESS,
  code = HttpStatusCode.OK,
  errorCode = ErrorCode.SUCCESS
) => {
  throw new Success(msg, code, errorCode)
}

export { success }
