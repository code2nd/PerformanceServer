const date = new Date()

export const ONE_HOUR = 60 * 60 * 1000
export const ONE_DAY = 24 * ONE_HOUR

const thisYear = date.getFullYear()
const thisMonth = date.getMonth() + 1
const thisDay = date.getDate()

export const today = `${thisYear}-${thisMonth}-${thisDay}`
export const tomorrow = `${thisYear}-${thisMonth}-${thisDay + 1}`

export function getTimeInterval(timeIntervalStr?: string) {
  let startDate, endDate
  if (timeIntervalStr) {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;[startDate, endDate] = timeIntervalStr.split(',')
    startDate = new Date(startDate).getTime() - 8 * ONE_HOUR
    endDate = new Date(endDate).getTime() + 16 * ONE_HOUR
  }

  return {
    startDate,
    endDate
  }
}

export function getLatestTime(days: number) {
  // let startDate, endDate
  const times: string[] = []

  const startDate = new Date(today).getTime() - (days * 24 - 8) * ONE_HOUR
  const endDate = new Date(tomorrow).getTime() - 8 * ONE_DAY

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    times.push(`${year}-${month}-${day}`)
  }

  return {
    startDate,
    endDate,
    times
  }
}
