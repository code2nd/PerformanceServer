import * as https from 'https'
import { WebSocketServer } from 'ws'
import Subscriber from '../utils/subscriber'

const subscriber = Subscriber.getInstance()

function socket(https: https.Server) {
  const socketServer = new WebSocketServer({ server: https })

  socketServer.on('connection', (ws) => {
    ws.on('message', (message) => {
      const { data } = JSON.parse(message.toString())
      if (data instanceof Object) {
        // 对象
        const { path } = data
        if (path === '/alarm') {
          subscriber.excutor(ws as any)
        }
      } else {
        // 字符串
        if (data === 'ping') {
          ws.send('pong')
        }
      }
    })

    ws.on('close', (code, reason) => {
      console.log('关闭连接', code, reason)
    })
  })
}

export default socket
