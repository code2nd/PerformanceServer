import { Router } from '../../types'

function ipRouter(router: Router) {
  router.get('/ip', async (ctx) => {
    const ip =
      ctx.req.headers['x-real-ip'] ||
      ctx.req.headers['x-forwarded-for'] ||
      ctx.req.socket.remoteAddress
    const realIp = ip.slice(7)
    // ctx.type = 'text'
    ctx.body = `const returnCitySN = { ip: '${realIp}' }`
  })
}

export default ipRouter
