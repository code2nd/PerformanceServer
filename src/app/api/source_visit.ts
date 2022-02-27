import { SourceVisit } from '../models'
import { Router } from '../../types'
import Auth from '../../middlewares/auth'
import {
  SourceVisitCreate,
  SourceVisitRetrieve,
  SourceVisitDelete
} from '../validators'
import { success } from '../../utils/success'

function sourceVisitRouter(router: Router) {
  const prefix = '/source_visit'

  // 查找
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new SourceVisitRetrieve(
      'visitor',
      'website',
      'size',
      'cost'
    ).validate(ctx)
    const visitor = v.get('query.visitor')
    const website = v.get('query.website')
    const size = v.get('query.size')
    const cost = v.get('query.cost')

    const res = await SourceVisit.getSourceVisit({
      visitor,
      website,
      size,
      cost
    })
    ctx.body = res
  })

  // 新增
  router.post(prefix, new Auth().v, async (ctx) => {
    const v = new SourceVisitCreate(
      'visitor',
      'website',
      'sourceName',
      'size',
      'cost'
    ).validate(ctx)
    const visitor = v.get('body.visitor')
    const website = v.get('body.website')
    const sourceName = v.get('body.sourceName')
    const size = v.get('body.size')
    const cost = v.get('body.cost')

    await SourceVisit.addSourceVisit({
      visitor,
      website,
      sourceName,
      size,
      cost
    })
    success()
  })

  // 删除
  router.delete(prefix + '/:id', new Auth().v, async (ctx) => {
    const v = new SourceVisitDelete('id').validate(ctx)
    const id = v.get('path.id')

    await SourceVisit.deleteSourceVisit(id)
    success()
  })
}

export default sourceVisitRouter
