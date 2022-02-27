import { InterfaceVisit } from '../models'
import { Router } from '../../types'
import Auth from '../../middlewares/auth'
import {
  InterfaceVisitCreate,
  InterfaceVisitRetrieve,
  InterfaceVisitDelete,
  IntegerValidator
} from '../validators'
import { success } from '../../utils/success'

function interfaceVisitRouter(router: Router) {
  const prefix = '/interface'

  // 新增
  router.post(prefix, async (ctx) => {
    const v = new InterfaceVisitCreate(
      'visitor',
      'website',
      'interfaceName',
      // 'method',
      'size',
      'cost'
    ).validate(ctx)

    const visitor = v.get('body.visitor')
    const website = v.get('body.website')
    const size = v.get('body.size')
    const cost = v.get('body.cost')
    const interfaceName = v.get('body.interfaceName')
    // const method = v.get('body.method')

    if (interfaceName !== '/performance') {
      await InterfaceVisit.addInterfaceVisit({
        visitor,
        website,
        size,
        cost,
        interfaceName
        // method
      })
    }

    success()
  })

  // 查找
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new InterfaceVisitRetrieve(
      'visitor',
      'website',
      'interfaceName',
      'create_time',
      'page',
      'pageSize'
    ).validate(ctx)
    const visitor = v.get('query.visitor')
    const website = v.get('query.website')
    const interfaceName = v.get('query.interfaceName')
    const create_time = v.get('query.create_time')
    const page = v.get('query.page')
    const pageSize = v.get('query.pageSize')

    const res = await InterfaceVisit.getInterfaceVisit({
      visitor,
      website,
      create_time,
      page,
      interfaceName,
      pageSize
    })

    ctx.body = res
  })

  // 删除
  router.delete(prefix + '/:id', new Auth().v, async (ctx) => {
    const v = new InterfaceVisitDelete('id').validate(ctx)
    const id = v.get('path.id')

    await InterfaceVisit.deleteInterfaceVisit(id)

    success()
  })

  // 获取接口性能数据
  router.get(prefix + '/count/:website_id', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('website_id').validate(ctx)
    const website_id = v.get('path.website_id')

    const res = await InterfaceVisit.getInterfacePerformance(website_id)

    ctx.body = res
  })

  // 接口请求时间分段数量占比
  router.get(prefix + '/cost/:website_id', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('website_id').validate(ctx)
    const website_id = v.get('path.website_id')

    const res = await InterfaceVisit.getInterfaceCostData(website_id)

    ctx.body = res
  })

  // 接口请求耗时top10
  router.get(prefix + '/top/:website_id', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('website_id').validate(ctx)
    const website_id = v.get('path.website_id')

    const res = await InterfaceVisit.getInterfaceTop(website_id)

    ctx.body = res
  })
}

export default interfaceVisitRouter
