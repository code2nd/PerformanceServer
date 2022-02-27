import { Validator, Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'
import { NotEmptyValidator } from './validators'

class VisiterCreate extends NotEmptyValidator {
  constructor(ip: string) {
    super(ip)
  }
}

class VisiterRetrieve extends Validator {
  constructor(ip: string, dateTime: string) {
    super()
    this[ip] = [
      new Rule(RuleType.IS_OPTIONAL, '', { default: '' }),
      new Rule(RuleType.MATCHES, '格式错误', {
        reg: /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/
      })
    ]
    this[dateTime] = [new Rule(RuleType.IS_OPTIONAL, '', { default: '' })]
  }
}

class VisiterDelete extends NotEmptyValidator {
  constructor(id: string) {
    super(id)
  }
}

export { VisiterCreate, VisiterRetrieve, VisiterDelete }
