import { Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'
import { NotEmptyValidator } from './validators'

class SourceVisitCreate extends NotEmptyValidator {
  constructor(
    visitor: string,
    website: string,
    sourceName: string,
    size: string,
    cost: string
  ) {
    super(visitor, website, sourceName)
    this[size] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[cost] = this[size]
  }
}

class SourceVisitRetrieve extends NotEmptyValidator {
  constructor(visitor: string, website: string, size: string, cost: string) {
    super(visitor, website, size, cost)
    this[visitor] = [
      new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 }),
      new Rule(RuleType.IS_OPTIONAL, '', { default: null })
    ]
    this[website] = this[visitor]
    this[size] = this[visitor]
    this[cost] = this[visitor]
  }
}

class SourceVisitDelete extends NotEmptyValidator {
  constructor(id: string) {
    super(id)
    this[id] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
  }
}

export { SourceVisitCreate, SourceVisitRetrieve, SourceVisitDelete }
