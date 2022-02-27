import { Validator, Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'
import { IntegerValidator } from './validators'

class MenuRetrieve extends IntegerValidator {
  constructor(id: string) {
    super(id)
  }
}

class RoleCreate extends Validator {
  constructor(
    name: string,
    description: string,
    auth_level: string,
    menuIds: string
  ) {
    super()
    this[name] = [new Rule(RuleType.IS_LENGTH, '不允许为空', { min: 1 })]
    this[auth_level] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[description] = [new Rule(RuleType.IS_OPTIONAL, '', { default: '' })]
    this[menuIds] = this[description]
  }
}

class RoleUpdate extends RoleCreate {
  constructor(
    id: string,
    name: string,
    description: string,
    auth_level: string,
    menuIds: string
  ) {
    super(name, description, auth_level, menuIds)
    this[id] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[menuIds] = [new Rule(RuleType.IS_OPTIONAL, '', { default: '' })]
  }
}

class RoleDelete extends IntegerValidator {
  constructor(id: string) {
    super(id)
  }
}

export { MenuRetrieve, RoleCreate, RoleUpdate, RoleDelete }
