import { Validator, Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'

// 非空检验
class NotEmptyValidator extends Validator {
  constructor(...params: string[]) {
    super()
    params.map((item) => {
      return (this[item] = [
        new Rule(RuleType.IS_LENGTH, '不允许为空', { min: 1 })
      ])
    })
  }
}

// 正整数
class IntegerValidator extends NotEmptyValidator {
  constructor(...params: string[]) {
    super()
    params.map((item) => {
      return (this[item] = [new Rule(RuleType.IS_INT, '为正整数')])
    })
  }
}

// 数字类型
class NumberValidator extends NotEmptyValidator {
  constructor(...params: string[]) {
    super()
    params.map((item) => {
      return (this[item] = [new Rule(RuleType.IS_NUMBER, '为数字')])
    })
  }
}

// 可选
class OptionalValidator extends Validator {
  constructor(...params: string[]) {
    super()
    params.map((item) => {
      return (this[item] = [
        new Rule(RuleType.IS_OPTIONAL, '', { default: '' })
      ])
    })
  }
}

export {
  NotEmptyValidator,
  IntegerValidator,
  NumberValidator,
  OptionalValidator
}
