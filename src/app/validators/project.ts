import { Validator, Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'
import { NotEmptyValidator } from './validators'

import { TIME_INTERVAL } from '../../core/validator/regs'

/**
 * 获取项目列表 GET /project
 * category 可根据项目类型筛选 -- 可选，默认为 0 （所有类型）
 * keyword 可根据项目名称进行模糊查找 -- 可选无默认
 * page 页数
 * pageSize 一页数据条数
 */

class ProjectRetrieve extends Validator {
  constructor(
    page: string,
    pageSize: string,
    category: string,
    project: string,
    create_time: string
  ) {
    super()
    this[page] = [new Rule(RuleType.IS_INT, '为正整数')]
    this[pageSize] = this[page]
    this[category] = [
      new Rule(RuleType.IS_OPTIONAL, '', { default: 0 }),
      new Rule(RuleType.IS_INT, '为正整数')
    ]
    this[project] = [new Rule(RuleType.IS_OPTIONAL, '', { default: '' })]
    this[create_time] = [
      new Rule(RuleType.IS_OPTIONAL, '', { default: '' }),
      new Rule(RuleType.MATCHES, '时间段格式错误', { reg: TIME_INTERVAL })
    ]
  }
}

// 新增
class ProjectCreate extends NotEmptyValidator {
  constructor(project: string, website: string, category: string) {
    super(project, website)
    this[category] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
  }
}

// 更新
class ProjectUpdate extends ProjectCreate {}

// 删除
class ProjectDelete extends NotEmptyValidator {
  constructor(id: string) {
    super()
    this[id] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
  }
}

// 获取项目列表（包含统计信息）
class ProjectStatiticsRetrieve extends Validator {
  constructor(
    category: string,
    project: string,
    page: string,
    pageSize: string
  ) {
    super()
    this[category] = [
      new Rule(RuleType.IS_OPTIONAL, '', { default: 0 }),
      new Rule(RuleType.IS_INT, '必须是正整数')
    ]

    this[project] = [new Rule(RuleType.IS_OPTIONAL, '', { default: '' })]
    this[page] = [new Rule(RuleType.IS_INT, '必须是正整数')]
    this[pageSize] = this[page]
  }
}

export {
  ProjectRetrieve,
  ProjectCreate,
  ProjectUpdate,
  ProjectDelete,
  ProjectStatiticsRetrieve
}
