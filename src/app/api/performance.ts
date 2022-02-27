import { Performance } from '../models'

import { Router } from '../../types'
import { success } from '../../utils/success'
import Auth from '../../middlewares/auth'

import {
  PerformanceRetrieve,
  PerformanceCreate,
  IntegerValidator
} from '../validators'

function performanceRouter(router: Router) {
  const prefix = '/performance'

  // 获取性能指标列表
  /* router.get(prefix, async (ctx) => {
    ctx.body = '获取'
  }) */

  router.post('/test', (ctx) => {
    ctx.body = ctx.request.body
  })

  // 新增
  router.post(prefix, async (ctx) => {
    const v = new PerformanceCreate(
      'project',
      'visitor',
      'domInteractive',
      'parseDomTime',
      'lookupDomainTime',
      'connectTime',
      'requestTime',
      'requestDocumentTime',
      'responseDocumentTime',
      'TTFB',
      'FP',
      'FCP',
      'domContentLoaded',
      'load'
    ).validate(ctx)

    const project = v.get('body.project')
    const visitor = v.get('body.visitor')
    const domInteractive = v.get('body.domInteractive')
    const parseDomTime = v.get('body.parseDomTime')
    const lookupDomainTime = v.get('body.lookupDomainTime')
    const connectTime = v.get('body.connectTime')
    const requestTime = v.get('body.requestTime')
    const requestDocumentTime = v.get('body.requestDocumentTime')
    const responseDocumentTime = v.get('body.responseDocumentTime')
    const TTFB = v.get('body.TTFB')
    const FP = v.get('body.FP')
    const FCP = v.get('body.FCP')
    const domContentLoaded = v.get('body.domContentLoaded')
    const load = v.get('body.load')

    await Performance.addPerformance({
      FP,
      FCP,
      project,
      visitor,
      domInteractive,
      parseDomTime,
      lookupDomainTime,
      connectTime,
      requestTime,
      requestDocumentTime,
      responseDocumentTime,
      TTFB,
      domContentLoaded,
      load
    })

    // console.log(FP, FCP, project, visitor, domInteractive, parseDomTime, lookupDomainTime, connectTime, requestTime, requestDocumentTime, responseDocumentTime, TTFB)
    success()
  })

  // 查询
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new PerformanceRetrieve(
      'project',
      'create_time',
      'page',
      'pageSize'
    ).validate(ctx)
    const project = v.get('query.project')
    const create_time = v.get('query.create_time')
    const page = v.get('query.page')
    const pageSize = v.get('query.pageSize')

    const res = await Performance.getPerformanceList(
      project,
      create_time,
      page,
      pageSize
    )

    ctx.body = res
  })

  // 页面性能数据
  router.get(prefix + '/page/:project', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('project').validate(ctx)
    const project = v.get('path.project')

    const res = await Performance.getPagePerformance(project)
    ctx.body = res
  })

  // 页面加载耗时分时间段数据
  router.get(prefix + '/cost/:project', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('project').validate(ctx)
    const project = v.get('path.project')

    const res = await Performance.getPageCostTimeInterval(project)
    ctx.body = res
  })
}

export default performanceRouter
