import * as https from 'https'
import * as fs from 'fs'

import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as session from 'koa-session'
import * as Redis from 'ioredis'

import SessionStore from './app/services/sessionStore'
import socket from './core/socket'

import catchError from './middlewares/exception'
import Init from './core/init'
import config from './config'

const { appKeys, port, redis: redisConfig, sessionConfig } = config

const app = new Koa()
app.keys = appKeys

// 创建redis
const redis = new Redis(redisConfig)

const SESSION_CONFIG = {
  ...sessionConfig,
  store: new SessionStore(redis)
}

app.use(catchError)

app.use(bodyParser())

app.use(session(SESSION_CONFIG, app))

new Init(app)

const dirname = process.cwd() + '/src'
const options = {
  key: fs.readFileSync(dirname + '/cert/stu.jalamy.cn.key'),
  cert: fs.readFileSync(dirname + '/cert/stu.jalamy.cn.pem')
}

const server = https.createServer(options, app.callback()).listen(port, () => {
  console.log(`服务器在${port}端口启动成功！`)
})

socket(server)
