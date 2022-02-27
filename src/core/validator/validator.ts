/**
 * koa-router 接受的传参方式
 * 1 get /list/:id ===> ctx.params => { id: xxx }
 * 2 get /list?name=zhangsan ===> ctx.query => { name: zhangsan }
 * 3 post { name: 'zhansan' } ===> ctx.request.body => { name: zhangsan }
 * 4 patch { name: 'zhangsan' } ===> ctx.request.body => { name: zhangsan }
 * 5 delete /list/:id ===> ctx.params => { id: 5 }
 * 6 delete /list?id=5 ===> ctx.query => { id: 5 }
 */

import { Context } from 'koa'
import { get, cloneDeep, set, last } from 'lodash'
import validators, { RuleType } from './validators'
import { IRuleConfig } from './types'

import { ParameterException } from '../http-exception'

class Validator {
  [index: string]: any
  data: any

  constructor() {
    this.data = {}
  }

  validate(ctx: Context) {
    const params = this.assembleAllParams(ctx)
    this.data = cloneDeep(params)

    // 获取要验证的字段名数组, 例如['page', 'pageSize']
    const memberKeys = this.findMembers(this, this.findMemberFilter.bind(this))

    const errorMsgs = []

    for (const key of memberKeys) {
      // 验证
      const result = this.check(key)
      if (!result.success) {
        errorMsgs.push(result.msg)
      }
    }

    if (errorMsgs.length != 0) {
      throw new ParameterException(errorMsgs)
    }
    ctx.v = this

    return this
  }

  // { query: { keyword: '' }, params: { id: 5 }, request: { body: { name: 'zhangsan' } } }
  get(path: string) {
    const value = get(this.data, path, null)

    if (value === null) {
      const keys = path.split('.')
      const key = last(keys)
      return get(this.data.default, key)
    }

    return value
  }

  private assembleAllParams(ctx: Context) {
    const {
      request: { body, query, header },
      params
    } = ctx

    return {
      body,
      query,
      header,
      path: params
    }
  }

  private findMembers(
    instance: Validator,
    memberfilter: (key: string) => boolean
  ) {
    let fields = Reflect.ownKeys(instance) as string[]
    fields = fields.filter((field) => {
      return memberfilter(field)
    })

    return fields
  }

  private findMemberFilter(key: string) {
    if (this[key] instanceof Array) {
      this[key].forEach((value: unknown) => {
        const isRuleType = value instanceof Rule
        if (!isRuleType) {
          throw new Error('验证数组必须全部为Rule类型')
        }
      })

      return true
    }

    return false
  }

  private check(key: string) {
    // 属性验证, 数组，内有一组Rule
    const rules = this[key]

    const ruleField = new RuleField(rules)
    const param = this.findParam(key)

    const result = ruleField.validate(param.value)

    if (result.pass) {
      // 如果参数路径不存在，往往是因为用户传了空值，而又设置了默认值(接口设置了默认值，而用户传了空值)
      if (param.path.length == 0) {
        set(this.data, ['default', key], result.legalValue)
      } else {
        set(this.data, param.path, result.legalValue)
      }

      return {
        msg: 'ok',
        success: true
      }
    }

    return {
      msg: key + result.msg,
      success: false
    }
  }

  private findParam(key: string) {
    let value
    value = get(this.data, ['query', key])
    if (value != null) {
      return {
        value,
        path: ['query', key]
      }
    }
    value = get(this.data, ['body', key])
    if (value != null) {
      return {
        value,
        path: ['body', key]
      }
    }
    value = get(this.data, ['path', key])
    if (value != null) {
      return {
        value,
        path: ['path', key]
      }
    }
    value = get(this.data, ['header', key])
    if (value != null) {
      return {
        value,
        path: ['header', key]
      }
    }
    return {
      value: null,
      path: []
    }
  }
}

class Rule {
  type: RuleType
  msg: string
  params: IRuleConfig

  constructor(type: RuleType, msg = '参数错误', params: IRuleConfig = {}) {
    Object.assign(this, {
      type,
      msg,
      params
    })
  }

  validate(field: string) {
    if (this.type === RuleType.IS_OPTIONAL) {
      return new RuleResult(true)
    }

    if (!validators[this.type](field + '', this.params)) {
      return new RuleResult(false, this.msg)
    }

    return new RuleResult(true, '')
  }
}

class RuleResult {
  pass: boolean
  msg: string

  constructor(pass: boolean, msg = '') {
    Object.assign(this, {
      pass,
      msg
    })
  }
}

class RuleField {
  rules: Rule[]

  constructor(rules: Rule[]) {
    this.rules = rules
  }

  validate(field: string) {
    if (field == null) {
      // 如果字段为空
      const allowEmpty = this.allowEmpty()
      const defaultValue = this.hasDefault()

      if (allowEmpty) {
        return new RuleFieldResult(true, '', defaultValue)
      } else {
        return new RuleFieldResult(false, '字段是必填参数')
      }
    }

    const filedResult = new RuleFieldResult(false)
    for (const rule of this.rules) {
      const result = rule.validate(field)
      if (!result.pass) {
        filedResult.msg = result.msg
        filedResult.legalValue = null
        // 一旦一条校验规则不通过，则立即终止这个字段的验证
        return filedResult
      }
    }
    return new RuleFieldResult(true, '', this.convert(field))
  }

  private allowEmpty() {
    for (const rule of this.rules) {
      if (rule.type === RuleType.IS_OPTIONAL) {
        return true
      }
    }

    return false
  }

  private hasDefault() {
    for (const rule of this.rules) {
      const config = rule.params
      if (rule.type === RuleType.IS_OPTIONAL && config !== undefined) {
        return config.default
      } else {
        return null
      }
    }
  }

  private convert(value: string) {
    for (const rule of this.rules) {
      if (rule.type === RuleType.IS_INT) {
        return parseInt(value)
      }

      // isFloat isBoolean
    }
    return value
  }
}

class RuleFieldResult extends RuleResult {
  pass: boolean
  msg: string
  legalValue: unknown

  constructor(pass: boolean, msg = '', legalValue: unknown = null) {
    super(pass, msg)
    this.legalValue = legalValue
  }
}

export { Validator, Rule }

// 用法
// const v = new Validator().validate(ctx).get

/* class NotEmptyValidator extends Validator {
  constructor(...params) {
    super()
    params.map((item) => {
      return this[item] = [
        new Rule('isLength', '不允许为空', { min: 1 })
      ]
    })
  }
} */

// const v = new NotEmptyValidator('page', 'pageSize').validate(ctx)
