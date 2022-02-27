import { Project } from '../models'
import {
  ProjectRetrieve,
  ProjectCreate,
  ProjectUpdate,
  ProjectDelete,
  ProjectStatiticsRetrieve
} from '../validators'

import { Router } from '../../types'
import Auth from '../../middlewares/auth'
import { success } from '../../utils/success'

/**
 * 项目（网站）
 * 如果有项目往监控平台发送数据，即在项目中使用到了监控平台插件
 * 那么监控平台会自动往数据库新建该项目
 */

function projectRouter(router: Router) {
  const prefix = '/project'

  // 获取项目列表 -- 可根据项目类型 项目名称关键字搜索
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new ProjectRetrieve(
      'page',
      'pageSize',
      'category',
      'project',
      'create_time'
    ).validate(ctx)
    const category = v.get('query.category')
    const project = v.get('query.project')
    const page = v.get('query.page')
    const pageSize = v.get('query.pageSize')
    const create_time = v.get('query.create_time')

    const { count, rows } = await Project.getProjectList({
      category,
      project,
      page,
      pageSize,
      create_time
    })

    ctx.body = {
      total: count,
      list: rows
    }
  })

  // 获取项目列表（全部，字段只需id和name）
  router.get(prefix + '/simple', new Auth().v, async (ctx) => {
    const res = await Project.getProjectListSimple()
    ctx.body = res
  })

  // 新增
  router.post(prefix, new Auth().v, async (ctx) => {
    const v = new ProjectCreate('project', 'website', 'category').validate(ctx)

    const project_name = v.get('body.project')
    const website = v.get('body.website')
    const category = v.get('body.category')

    await Project.addProject({ project_name, website, category })

    success()
  })

  // 更新
  router.put(prefix + '/:id', new Auth().v, async (ctx) => {
    const v = new ProjectUpdate('project', 'website', 'category').validate(ctx)
    const id = v.get('path.id')
    const project_name = v.get('body.project')
    const website = v.get('body.website')
    const category = v.get('body.category')

    await Project.updateProject({ id, project_name, website, category })

    success()
  })

  // 删除
  router.delete(prefix + '/:id', async (ctx) => {
    const v = new ProjectDelete('id').validate(ctx)
    const id = v.get('path.id')
    // const id = ctx.params.id
    await Project.deleteProject(id)
    success()
  })

  // 获取项目列表(包含统计信息) -- 可通过类型 名称过滤 支持排序
  router.get(prefix + '/statitics', new Auth().v, async (ctx) => {
    const v = new ProjectStatiticsRetrieve(
      'category',
      'project',
      'page',
      'pageSize'
    ).validate(ctx)

    const category = v.get('query.category')
    const project = v.get('query.project')
    const page = v.get('query.page')
    const pageSize = v.get('query.pageSize')

    const res = await Project.getProjectListWithStatitics(
      category,
      project,
      page,
      pageSize
    )
    ctx.body = res
  })
}

export default projectRouter
