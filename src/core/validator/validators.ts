export enum RuleType {
  IS_LENGTH = 'isLength', // 检查字符串长度是否在设置范围之内
  IS_OPTIONAL = 'isOptional', // 是否可选
  IS_INT = 'isInt', // 是否是正整数
  IS_NUMBER = 'isNumber', // 是否是数字类型
  MATCHES = 'matches' // 是否匹配设置的正则表达式
}

const validators = {
  [RuleType.IS_LENGTH](
    str: string,
    options: { min?: number; max?: number } = { min: 0 }
  ) {
    const len = str.length
    const { min, max } = options
    return len >= min && (typeof max === 'undefined' || len <= max)
  },
  [RuleType.IS_INT](str: string, options: { min?: number; max?: number } = {}) {
    let minCheckPassed: boolean, maxCheckPassed: boolean
    const regex = /^(?:[-+]?(?:0|[1-9][0-9]*))$/
    const isInt = regex.test(str)
    if (isInt) {
      minCheckPassed =
        // eslint-disable-next-line no-prototype-builtins
        !options.hasOwnProperty('min') || Number(str) >= options.min
      maxCheckPassed =
        // eslint-disable-next-line no-prototype-builtins
        !options.hasOwnProperty('max') || Number(str) <= options.max
    }

    return minCheckPassed && maxCheckPassed
  },
  [RuleType.MATCHES](str: string, options: { reg?: RegExp }) {
    if (typeof options.reg === undefined) {
      return true
    }

    return options.reg.test(str)
  },
  [RuleType.IS_NUMBER](str: string) {
    return !isNaN(Number(str))
  }
}

export default validators
