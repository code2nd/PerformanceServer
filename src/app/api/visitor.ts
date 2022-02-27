import { Visitor } from '../models'
import { Router } from '../../types'
import { VisitorDelete, VisitorRetrieve, VisitorCreate } from '../validators'
import Auth from '../../middlewares/auth'
import { success } from '../../utils/success'

function visitorRouter(router: Router) {
  const prefix = '/visitor'

  // 新增
  router.post(prefix, async (ctx) => {
    const v = new VisitorCreate('ip').validate(ctx)
    const ip = v.get('body.ip')

    await Visitor.addVisitor(ip)
    success()
  })

  // 查询
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new VisitorRetrieve(
      'city',
      'first_time',
      'page',
      'pageSize'
    ).validate(ctx)
    const city = v.get('query.city')
    const firstTime = v.get('query.first_time')
    const page = v.get('query.page')
    const pageSize = v.get('query.pageSize')
    const list = await Visitor.getVisitor(city, firstTime, page, pageSize)
    ctx.body = list
  })

  // 删除
  router.delete(prefix + '/:id', new Auth().v, async (ctx) => {
    const v = new VisitorDelete('id').validate(ctx)
    const id = v.get('path.id')
    await Visitor.deleteVisitor(id)
    success()
  })
}

export default visitorRouter
