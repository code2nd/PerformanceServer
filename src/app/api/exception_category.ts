import { ExceptionCategory } from '../models'
import Auth from '../../middlewares/auth'
import {
  ExceptionCategoryCreate,
  ExceptionCategoryUpdate,
  ExceptionCategoryDelete
} from '../validators'
import { success } from '../../utils/success'
import { Router } from '../../types'

import { IntegerValidator } from '../validators'

function exceptionCategoryRouter(router: Router) {
  const prefix = '/exception_category'

  // 查找
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new IntegerValidator('page', 'pageSize').validate(ctx)
    const page = v.get('query.page')
    const pageSize = v.get('query.pageSize')
    const res = await ExceptionCategory.getExceptionCategory(page, pageSize)
    ctx.body = res
  })

  // 查找所有
  router.get(prefix + '/list', new Auth().v, async (ctx) => {
    const res = await ExceptionCategory.getExceptionCategoryList()
    ctx.body = res
  })

  // 新增
  router.post(prefix, new Auth().v, async (ctx) => {
    const v = new ExceptionCategoryCreate('category_name').validate(ctx)
    const category_name = v.get('body.category_name')

    await ExceptionCategory.addExceptionCategory(category_name)

    success()
  })

  // 更新
  router.put(prefix + '/:category', new Auth().v, async (ctx) => {
    const v = new ExceptionCategoryUpdate('category', 'category_name').validate(
      ctx
    )
    const category = v.get('path.category')
    const category_name = v.get('body.category_name')

    await ExceptionCategory.updateExceptionCategory(category, category_name)

    success()
  })

  // 删除
  router.delete(prefix + '/:category', new Auth().v, async (ctx) => {
    const v = new ExceptionCategoryDelete('category').validate(ctx)
    const category = v.get('path.category')

    await ExceptionCategory.deleteExceptionCategory(category)
    success()
  })
}

export default exceptionCategoryRouter
