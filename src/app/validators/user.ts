import { Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'
import {
  NotEmptyValidator,
  IntegerValidator,
  OptionalValidator
} from './validators'
import { USERNAME, PASSWORD, TIME_INTERVAL } from '../../core/validator/regs'

// 修改密码(不需要原始密码的情况)
class ChangePasswordValidator extends NotEmptyValidator {
  constructor(password1: string, password2: string) {
    super()
    this[password1] = [
      new Rule(
        RuleType.MATCHES,
        '必须是8-16位字母和数字组合，且必须以字母开头',
        {
          reg: PASSWORD
        }
      )
    ]
    this[password2] = this[password1]
  }
}

// 注册
class RegisterValidator extends ChangePasswordValidator {
  constructor(
    username: string,
    role: string,
    password1: string,
    password2: string
  ) {
    super(password1, password2)
    this[username] = [
      new Rule(
        RuleType.MATCHES,
        '必须是4-10位之间，只能包含字母、数字、下划线，且必须以字母开头',
        {
          reg: USERNAME
        }
      )
    ]
    this[role] = [
      new Rule(RuleType.IS_OPTIONAL, '', { default: null }),
      new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })
    ]
  }
}

// 登录
class LoginValidator extends NotEmptyValidator {
  constructor(username: string, password: string) {
    super()
    this[username] = [
      new Rule(
        RuleType.MATCHES,
        '必须是4-10位之间，只能包含字母、数字、下划线，且必须以字母开头',
        {
          reg: USERNAME
        }
      )
    ]
    this[password] = [
      new Rule(
        RuleType.MATCHES,
        '必须是8-16位字母和数字组合，且必须以字母开头',
        {
          reg: PASSWORD
        }
      )
    ]
  }
}

// 获取用户信息
class GetUserInfo extends IntegerValidator {
  constructor(id: string) {
    super(id)
  }
}

// 获取用户列表
class GetUserList extends OptionalValidator {
  constructor(
    role: string,
    username: string,
    create_time: string,
    page: string,
    pageSize: string
  ) {
    super(role, username, create_time)
    this[role] = this[role].concat([
      new Rule(RuleType.IS_INT, '必须是整数', { min: 0 })
    ])
    this[create_time] = this[create_time].concat([
      new Rule(RuleType.MATCHES, '时间段格式错误', { reg: TIME_INTERVAL })
    ])
    this[page] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[pageSize] = this[page]
  }
}

// 修改用户信息
class UserRetrieve extends OptionalValidator {
  constructor(
    id: string,
    username: string,
    role: string,
    password1: string,
    password2: string
  ) {
    super(role, password1, password2)
    this[id] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[username] = [
      new Rule(RuleType.IS_LENGTH, '不能为空', { min: 1 }),
      new Rule(
        RuleType.MATCHES,
        '必须是4-10位之间，只能包含字母、数字、下划线，且必须以字母开头',
        {
          reg: USERNAME
        }
      )
    ]
    this[password1] = this[password1].concat([
      new Rule(
        RuleType.MATCHES,
        '必须是8-16位字母和数字组合，且必须以字母开头',
        {
          reg: PASSWORD
        }
      )
    ])
    this[password2] = this[password1]
    this[role] = this[role].concat([
      new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })
    ])
  }
}

export {
  ChangePasswordValidator,
  RegisterValidator,
  LoginValidator,
  GetUserInfo,
  GetUserList,
  UserRetrieve
}
