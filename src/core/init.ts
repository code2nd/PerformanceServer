import * as Router from '@koa/router'
import config from '../config'

const router = new Router()

import { App } from '../types'

class Init {
  app: App

  constructor(app: App) {
    this.app = app
    this.loadRouter()
    config.dev === 'development' && this.handlePromiseRejection()
  }

  loadRouter() {
    const apiDirectory = `${process.cwd()}/src/app/api`

    const routers = require(apiDirectory)

    for (const item in routers) {
      if (typeof routers[item] === 'function') {
        routers[item](router)
      }
    }

    this.app.use(router.routes())
  }

  handlePromiseRejection() {
    process.on('unhandledRejection', (error) => {
      console.log(error)
    })
  }
}

export default Init
