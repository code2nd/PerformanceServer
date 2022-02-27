import { Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'
import { NotEmptyValidator, OptionalValidator } from './validators'
import { TIME_INTERVAL } from '../../core/validator/regs'

class PageVisitCreate extends NotEmptyValidator {
  constructor(visitor: string, website: string, path: string, cost: string) {
    super(visitor, website, path)
    this[cost] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
  }
}

class PageVisitRetrieve extends OptionalValidator {
  constructor(
    visitor: string,
    website: string,
    visit_time: string,
    page: string,
    pageSize: string
  ) {
    super(visitor, website, visit_time)
    this[visit_time] = this[visit_time].concat([
      new Rule(RuleType.MATCHES, ' 时间段格式错误', { reg: TIME_INTERVAL })
    ])
    this[page] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[pageSize] = this[page]
  }
}

class PageVisitDelete extends NotEmptyValidator {
  constructor(id: string) {
    super(id)
    this[id] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
  }
}

export { PageVisitCreate, PageVisitRetrieve, PageVisitDelete }
