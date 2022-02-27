import { Role } from '../models'
import { Router } from '../../types'

import Auth from '../../middlewares/auth'

import { RoleCreate, RoleUpdate } from '../validators'

import { success } from '../../utils/success'
import { IntegerValidator } from '../validators/validators'

function roleRouter(router: Router) {
  const prefix = '/role'

  // 获取角色列表
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new IntegerValidator('page', 'pageSize').validate(ctx)
    const page = v.get('query.page')
    const pageSize = v.get('query.pageSize')
    const res = await Role.getRoleList(page, pageSize)
    ctx.body = res
  })

  // 创建角色
  router.post(prefix, new Auth().v, async (ctx) => {
    const v = new RoleCreate(
      'name',
      'description',
      'auth_level',
      'menuIds'
    ).validate(ctx)
    const name = v.get('body.name')
    const description = v.get('body.description')
    const auth_level = v.get('body.auth_level')
    const menuList = v.get('body.menuList')

    await Role.createRole({ name, description, auth_level, menuList })
    success()
  })

  // 修改角色信息
  router.put(prefix + '/:id', new Auth().v, async (ctx) => {
    const v = new RoleUpdate(
      'id',
      'name',
      'description',
      'auth_level',
      'menuList'
    ).validate(ctx)
    const id = v.get('path.id')
    const name = v.get('body.name')
    const description = v.get('body.description')
    const auth_level = v.get('body.auth_level')
    const menuList = v.get('body.menuList')

    await Role.updateRole({ id, name, description, auth_level, menuList })
    success()
  })

  // 获取角色列表（全部）
  router.get(prefix + '/list', new Auth().v, async (ctx) => {
    const res = await Role.getRoleListAll()

    ctx.body = res
  })
}

export default roleRouter
