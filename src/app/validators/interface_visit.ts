import { Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'
import { NotEmptyValidator, OptionalValidator } from './validators'
import { TIME_INTERVAL } from '../../core/validator/regs'

class InterfaceVisitCreate extends NotEmptyValidator {
  constructor(
    visitor: string,
    website: string,
    interfaceName: string,
    size: string,
    cost: string
  ) {
    super(visitor, website, interfaceName)
    this[size] = [new Rule(RuleType.IS_NUMBER, '必须是数字')]
    this[cost] = this[size]
  }
}

class InterfaceVisitRetrieve extends OptionalValidator {
  constructor(
    visitor: string,
    website: string,
    interfaceName: string,
    create_time: string,
    page: string,
    pageSize: string
  ) {
    super(visitor, website, interfaceName, create_time)
    this[create_time] = this[create_time].concat([
      new Rule(RuleType.MATCHES, ' 时间段格式错误', { reg: TIME_INTERVAL })
    ])
    this[page] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[pageSize] = this[page]
  }
}

class InterfaceVisitDelete extends NotEmptyValidator {
  constructor(id: string) {
    super(id)
    this[id] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
  }
}

export { InterfaceVisitCreate, InterfaceVisitRetrieve, InterfaceVisitDelete }
