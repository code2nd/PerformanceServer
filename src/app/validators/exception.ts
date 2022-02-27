import { Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'
import { NotEmptyValidator, OptionalValidator } from './validators'
import { TIME_INTERVAL } from '../../core/validator/regs'

class ExceptionRetrieve extends OptionalValidator {
  constructor(
    project: string,
    category: string,
    content: string,
    occurred_time: string,
    page: string,
    pageSize: string
  ) {
    super(project, category, content, occurred_time)
    this[page] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[pageSize] = this[page]
    this[category] = this[category].concat([
      new Rule(RuleType.IS_INT, '为整数', { min: 0 })
    ])
    this[occurred_time] = this[occurred_time].concat([
      new Rule(RuleType.MATCHES, '时间段格错误', { reg: TIME_INTERVAL })
    ])
  }
}

// 新增
class ExceptionCreate extends NotEmptyValidator {
  constructor(
    visitor: string,
    website: string,
    category: string,
    content: string
  ) {
    super(visitor, website, category, content)
    this[category] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
  }
}

// 删除
class ExceptionDelete extends NotEmptyValidator {
  constructor(id: string) {
    super(id)
    this[id] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
  }
}

export { ExceptionRetrieve, ExceptionCreate, ExceptionDelete }
