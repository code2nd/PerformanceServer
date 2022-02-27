import { Rule } from '../../core/validator/validator'
import { NotEmptyValidator } from '../validators'
import { RuleType } from '../../core/validator/validators'

class ProjectCategoryCreate extends NotEmptyValidator {
  constructor(category_name: string) {
    super(category_name)
  }
}

// class ProjectCategoryRetrieve extends Validator  {}

class ProjectCategoryUpdate extends NotEmptyValidator {
  constructor(category: string, category_name: string) {
    super(category_name)
    this[category] = [new Rule(RuleType.IS_INT, '必须是正整数')]
  }
}

class ProjectCategoryDelete extends NotEmptyValidator {
  constructor(category: string) {
    super()
    this[category] = [new Rule(RuleType.IS_INT, '必须是正整数')]
  }
}

export { ProjectCategoryCreate, ProjectCategoryUpdate, ProjectCategoryDelete }
