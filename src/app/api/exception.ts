import { Exception } from '../models'
import { Router } from '../../types'

import { success } from '../../utils/success'
import Auth from '../../middlewares/auth'
import {
  ExceptionCreate,
  ExceptionRetrieve,
  ExceptionDelete,
  IntegerValidator
} from '../validators'

import Subscriber from '../../utils/subscriber'
const subscriber = Subscriber.getInstance()

function exceptionRouter(router: Router) {
  const prefix = '/exception'

  // 获取异常列表
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new ExceptionRetrieve(
      'project',
      'category',
      'content',
      'occurred_time',
      'page',
      'pageSize'
    ).validate(ctx)
    const project = v.get('query.project')
    const category = v.get('query.category')
    const content = v.get('query.content')
    const occurred_time = v.get('query.occurred_time')
    const page = v.get('query.page')
    const pageSize = v.get('query.pageSize')

    const res = await Exception.getException({
      project,
      category,
      content,
      occurred_time,
      page,
      pageSize
    })

    ctx.session.alarmCount = 0
    subscriber.ws?.send(JSON.stringify({ name: 'alarm', value: 0 }))

    ctx.body = res
  })

  // 接收上报的异常信息
  router.post(prefix, async (ctx) => {
    const v = new ExceptionCreate(
      'visitor',
      'website',
      'category',
      'content'
    ).validate(ctx)

    const visitor = v.get('body.visitor')
    const website = v.get('body.website')
    const category = v.get('body.category')
    const content = v.get('body.content')

    await Exception.addException({ visitor, website, category, content })

    // 如果用户没有请求异常列表，则认为还没有查看异常，那么新增一条异常就在redis中存储异常数count+1
    // 如果用户请求了异常列表则将count置为0
    const count = ctx.session.alarmCount || 0
    subscriber.ws?.send(JSON.stringify({ name: 'alarm', value: count + 1 }))
    ctx.session.alarmCount = count + 1

    success()
  })

  // 删除
  router.delete(prefix + '/:id', new Auth().v, async (ctx) => {
    const v = new ExceptionDelete('id').validate(ctx)
    const id = v.get('path.id')
    // const id = ctx.params.id
    await Exception.deleteException(id)
    success()
  })

  // 异常监控
  router.get(prefix + '/monitor/:website_id', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('website_id').validate(ctx)
    const website_id = v.get('path.website_id')

    const res = await Exception.getExceptionMonitor(website_id)

    ctx.body = res
  })

  // 总异常分类对比
  router.get(prefix + '/proportion/:website_id', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('website_id').validate(ctx)
    const website_id = v.get('path.website_id')

    const res = await Exception.getExceptionProportion(website_id)

    ctx.body = res
  })

  // 近一个月异常趋势
  router.get(prefix + '/tendency/:website_id', new Auth().v, async (ctx) => {
    const v = new IntegerValidator('website_id').validate(ctx)
    const website_id = v.get('path.website_id')

    const res = await Exception.getExceptionTendency(website_id)

    ctx.body = res
  })
}

export default exceptionRouter
