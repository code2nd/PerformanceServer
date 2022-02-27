/* import { Validator, Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators' */
import { IntegerValidator } from './validators'

class MenuRetrieve extends IntegerValidator {
  constructor(id: string) {
    super(id)
  }
}

export { MenuRetrieve }
