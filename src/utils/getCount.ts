import { cloneDeep } from 'lodash'

interface IItem {
  [key: string]: any
}

// 获取两个对象数组中相同项的数量
export function getCount(
  arr1: IItem[],
  key1: string,
  arr2: IItem[],
  key2: string
) {
  let count = 0
  const clonedArr1 = cloneDeep(arr1)
  const clonedArr2 = cloneDeep(arr2)
  clonedArr1.forEach((item1) => {
    for (let i = 0, len = clonedArr2.length; i < len; i++) {
      if (item1[key1] === clonedArr2[i][key2]) {
        count++
        clonedArr2.splice(i, 1)
        break
      }
    }
  })

  return count
}
