import { Menu, Role } from '../models'
// import Role from '../models/role'
import { Router } from '../../types'

import Auth from '../../middlewares/auth'

import { MenuRetrieve } from '../validators'

import { success } from '../../utils/success'
import { genMenu } from '../../utils/genMenu'

function menuRouter(router: Router) {
  const prefix = '/menu'
  // 查找 (角色菜单)
  router.get(prefix + '/:roleId', new Auth().v, async (ctx) => {
    const v = new MenuRetrieve('roleId').validate(ctx)
    const roleId = v.get('path.roleId')

    // 通过roleId获取menuIds
    const res = await Role.getMenuIdsByRoleId(roleId)
    const menuIds = res.menuIds ? res.menuIds.split(',') : []

    const list = await Menu.getMenuByMenuIds(menuIds)
    ctx.body = genMenu(list as any)
  })

  // 查询所有菜单
  router.get(prefix, new Auth().v, async (ctx) => {
    const { total, list } = await Menu.getMenuList()

    ctx.body = {
      total,
      list: genMenu(list as any)
    }
  })

  // 新增
  router.post(prefix, new Auth().v, async () => {
    success()
  })

  // 更新
  router.put(prefix + '/:id', new Auth().v, async () => {
    success()
  })

  // 删除
  router.delete(prefix + '/:id', new Auth().v, async () => {
    success()
  })
}

export default menuRouter
