import { Validator, Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'
import { IntegerValidator } from './validators'

class RoleCreate extends Validator {
  constructor(
    name: string,
    description: string,
    auth_level: string,
    menuList: string
  ) {
    super()
    this[name] = [new Rule(RuleType.IS_LENGTH, '不允许为空', { min: 1 })]
    this[auth_level] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[description] = [new Rule(RuleType.IS_OPTIONAL, '', { default: '' })]
    this[menuList] = this[description]
  }
}

class RoleUpdate extends RoleCreate {
  constructor(
    id: string,
    name: string,
    description: string,
    auth_level: string,
    menuList: string
  ) {
    super(name, description, auth_level, menuList)
    this[id] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[menuList] = [new Rule(RuleType.IS_OPTIONAL, '', { default: '' })]
  }
}

class RoleDelete extends IntegerValidator {
  constructor(id: string) {
    super(id)
  }
}

export { RoleCreate, RoleUpdate, RoleDelete }
