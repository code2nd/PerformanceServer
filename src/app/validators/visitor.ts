import { Validator, Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'
import { NotEmptyValidator } from './validators'

import { IP, TIME_INTERVAL } from '../../core/validator/regs'

class VisitorCreate extends Validator {
  constructor(ip: string) {
    super()
    this[ip] = [
      new Rule(RuleType.IS_OPTIONAL, '', { default: '' }),
      new Rule(RuleType.MATCHES, '格式错误', { reg: IP })
    ]
  }
}

class VisitorRetrieve extends Validator {
  constructor(
    city: string,
    first_time: string,
    page: string,
    pageSize: string
  ) {
    super()
    this[city] = [new Rule(RuleType.IS_OPTIONAL, '', { default: '' })]
    this[first_time] = [
      new Rule(RuleType.IS_OPTIONAL, '', { default: '' }),
      new Rule(RuleType.MATCHES, '时间段格式错误', { reg: TIME_INTERVAL })
    ]
    this[page] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[pageSize] = this[page]
  }
}

class VisitorDelete extends NotEmptyValidator {
  constructor(id: string) {
    super(id)
  }
}

export { VisitorCreate, VisitorRetrieve, VisitorDelete }
