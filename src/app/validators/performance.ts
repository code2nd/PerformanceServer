import { Rule } from '../../core/validator/validator'
import { RuleType } from '../../core/validator/validators'
import { NotEmptyValidator, OptionalValidator } from './validators'
import { TIME_INTERVAL } from '../../core/validator/regs'

class PerformanceRetrieve extends OptionalValidator {
  constructor(
    project: string,
    create_time: string,
    page: string,
    pageSize: string
  ) {
    super(project, create_time)
    this[create_time] = this[create_time].concat([
      new Rule(RuleType.MATCHES, '', { reg: TIME_INTERVAL })
    ])
    this[page] = [new Rule(RuleType.IS_INT, '必须是正整数', { min: 1 })]
    this[pageSize] = this[page]
  }
}

// 新增
class PerformanceCreate extends NotEmptyValidator {
  constructor(
    project: string,
    visitor: string,
    domInteractive: string,
    parseDomTime: string,
    lookupDomainTime: string,
    connectTime: string,
    requestTime: string,
    requestDocumentTime: string,
    responseDocumentTime: string,
    TTFB: string,
    FP: string,
    FCP: string,
    domContentLoaded: string,
    load: string
  ) {
    super(project, visitor)
    ;[
      domInteractive,
      parseDomTime,
      lookupDomainTime,
      connectTime,
      requestTime,
      requestDocumentTime,
      responseDocumentTime,
      TTFB,
      FP,
      FCP,
      domContentLoaded,
      load
    ].map((item) => {
      return (this[item] = [new Rule(RuleType.IS_NUMBER, '为数字')])
    })
  }
}

export { PerformanceRetrieve, PerformanceCreate }
