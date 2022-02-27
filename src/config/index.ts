import {
  APP_KEYS,
  SERVER_PORT,
  SESSION_KEY,
  SESSION_MAX_AGE,
  DATABASE_DBNAME,
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
  REDIS_HOST,
  REDIS_DB,
  REDIS_PASSWORD,
  REDIS_PORT,
  PASSWORD_HASH,
  SECRET_KEY,
  EXPIRES_IN,
  MAP_URL,
  MAP_AK,
  MAP_COOR
} from './config'

const config = {
  appKeys: APP_KEYS,
  dev: process.env.NODE_ENV,
  port: SERVER_PORT,
  passHash: PASSWORD_HASH,
  sessionConfig: {
    key: SESSION_KEY,
    maxAge: SESSION_MAX_AGE
  },
  database: {
    dbName: DATABASE_DBNAME,
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD
  },
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    db: REDIS_DB
  },
  security: {
    secretKey: SECRET_KEY,
    expiresIn: EXPIRES_IN
  },
  map: {
    url: MAP_URL,
    ak: MAP_AK,
    coor: MAP_COOR
  }
}

export default config
