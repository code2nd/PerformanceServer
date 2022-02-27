import { PageVisit } from '../models'
import { Router } from '../../types'
import Auth from '../../middlewares/auth'
import {
  PageVisitCreate,
  PageVisitRetrieve,
  PageVisitDelete,
  IntegerValidator
} from '../validators'
import { success } from '../../utils/success'

function pageVisitRouter(router: Router) {
  const prefix = '/visit'

  // 新增
  router.post(prefix, new Auth().v, async (ctx) => {
    const v = new PageVisitCreate(
      'visitor',
      'website',
      'path',
      'cost'
    ).validate(ctx)
    const visitor = v.get('body.visitor')
    const website = v.get('body.website')
    const path = v.get('body.path')
    const cost = v.get('body.cost')

    await PageVisit.addPageVisit({ visitor, website, path, cost })
    success()
  })

  // 查找
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new PageVisitRetrieve(
      'visitor',
      'website',
      'visit_time',
      'page',
      'pageSize'
    ).validate(ctx)
    const visitor = v.get('query.visitor')
    const website = v.get('query.website')
    const visit_time = v.get('query.visit_time')
    const page = v.get('query.page')
    const pageSize = v.get('query.pageSize')

    const res = await PageVisit.getPageVisit({
      visitor,
      website,
      visit_time,
      page,
      pageSize
    })
    ctx.body = res
  })

  // 删除
  router.delete(prefix + '/:id', new Auth().v, async (ctx) => {
    const v = new PageVisitDelete('id').validate(ctx)
    const id = v.get('path.id')

    await PageVisit.deletePageVisit(id)
    success()
  })

  // 网站访问量统计 -- 最近一个月每天的访问量 条件时间范围  按日期聚合
  router.get(prefix + '/count/:website', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('website').validate(ctx)
    const website = v.get('path.website')
    const days = 30

    const data = await PageVisit.getPageVisitCount(website, days)

    ctx.body = data
  })

  // 流量数据
  router.get(prefix + '/flow_data/:website', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('website').validate(ctx)
    const website = v.get('path.website')

    const data = await PageVisit.getPageVisitFlowData(website)
    ctx.body = data
  })

  // 网站近一个月每次打开锁耗费的时间
  router.get(prefix + '/cost/:website', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('website').validate(ctx)
    const website = v.get('path.website')

    const res = await PageVisit.getPageVisitCost(website, 30)
    ctx.body = res
  })

  // 网站访问量地域分布
  router.get(
    prefix + '/distribution/:website_id',
    new Auth().v,
    async (ctx) => {
      const v = new IntegerValidator('website_id').validate(ctx)
      const website_id = v.get('path.website_id')

      const res = await PageVisit.getPageVisitDistribution(website_id)
      ctx.body = res
    }
  )

  // 网站访问量地域分布top榜
  router.get(prefix + '/top/:website_id', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('website_id').validate(ctx)
    const website_id = v.get('path.website_id')

    const res = await PageVisit.getPageVisitDistribution(website_id, 15)
    ctx.body = res
  })
}

export default pageVisitRouter
