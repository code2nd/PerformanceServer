import { ProjectCategory } from '../models'
import Auth from '../../middlewares/auth'
import {
  ProjectCategoryCreate,
  ProjectCategoryUpdate,
  ProjectCategoryDelete
} from '../validators'
import { Router } from '../../types'
import { success } from '../../utils/success'

import { IntegerValidator } from '../validators'

function projectCategoryRouter(router: Router) {
  const prefix = '/project_category'

  // 查找
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new IntegerValidator('page', 'pageSize').validate(ctx)
    const page = v.get('query.page')
    const pageSize = v.get('query.pageSize')
    const res = await ProjectCategory.getProjectCategory(page, pageSize)
    ctx.body = res
  })

  // 查找所有
  router.get(prefix + '/list', new Auth().v, async (ctx) => {
    const res = await ProjectCategory.getProjectCategoryList()
    ctx.body = res
  })

  // 新增
  router.post(prefix, new Auth().v, async (ctx) => {
    const v = new ProjectCategoryCreate('category_name').validate(ctx)
    const category_name = v.get('body.category_name')

    await ProjectCategory.addProjectCategory(category_name)

    success()
  })

  // 更新
  router.put(prefix + '/:category', new Auth().v, async (ctx) => {
    const v = new ProjectCategoryUpdate('category', 'category_name').validate(
      ctx
    )
    const category = v.get('path.category')
    const category_name = v.get('body.category_name')

    await ProjectCategory.updateProjectCategory(category, category_name)

    success()
  })

  // 删除
  router.delete(prefix + '/:category', new Auth().v, async (ctx) => {
    const v = new ProjectCategoryDelete('category').validate(ctx)
    const category = v.get('path.category')

    await ProjectCategory.deleteProjectCategory(category)
    success()
  })
}

export default projectCategoryRouter
