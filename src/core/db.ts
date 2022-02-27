import { Sequelize } from 'sequelize'

import config from '../config'

const {
  database: { dbName, host, port, user, password }
} = config

const sequelize = new Sequelize(dbName, user, password, {
  dialect: 'mysql',
  port,
  host,
  logging: true,
  dialectOptions: {
    dateStrings: true,
    typeCast: true
  },
  timezone: '+08:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_0900_ai_ci',
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: 'update_time'
  }
})

// 将定义的所有模型同步到数据库
sequelize.sync({ alter: true })

export { sequelize }
