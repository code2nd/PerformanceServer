// 正则
// 用户名
export const USERNAME = /^[a-zA-Z]([a-zA-Z0-9_]){3,9}$/

// 密码
export const PASSWORD = /^[A-Za-z]([A-Za-z0-9]){7,31}$/

// ip 127.0.0.1
export const IP =
  /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/

// 时间段 '2021-11-01,2021-12-01'
export const TIME_INTERVAL =
  /\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}\,\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}/
