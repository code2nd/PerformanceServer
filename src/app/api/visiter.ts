import { Visiter } from '../models'
import { Router } from '../../types'
import { VisiterDelete, VisiterRetrieve, VisiterCreate } from '../validators'
import Auth from '../../middlewares/auth'
import { success } from '../../utils/success'

function VisiterRouter(router: Router) {
  const prefix = '/visiter'

  // 新增
  router.post(prefix, new Auth().v, async (ctx) => {
    const v = new VisiterCreate('ip').validate(ctx)
    const ip = v.get('body.ip')
    await Visiter.addVisiter(ip)
    success()
  })

  // 查询
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new VisiterRetrieve('ip', 'dateTime').validate(ctx)
    const ip = v.get('query.ip')
    const dateTime = v.get('query.dateTime')
    const list = await Visiter.getVisiter(ip, dateTime)
    ctx.body = list
  })

  // 删除
  router.delete(prefix + '/:id', new Auth().v, async (ctx) => {
    const v = new VisiterDelete('id').validate(ctx)
    const id = v.get('path.id')
    await Visiter.deleteVisiter(id)
    success()
  })
}

export default VisiterRouter
