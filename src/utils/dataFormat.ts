import { cloneDeep } from 'lodash'

interface IData {
  date: string
  count: number
}

export function dateBarChartData(data: IData[], dates: string[]) {
  const copiedData = cloneDeep(data)
  const res = []
  for (let i = 0, len = dates.length; i < len; i++) {
    res.push(0)
    for (let j = 0; j < copiedData.length; j++) {
      if (dates[i] === copiedData[j].date) {
        res[i] = copiedData[j].count
        copiedData.splice(j, 1)
        j--
        break
      }
    }
  }

  return res
}
