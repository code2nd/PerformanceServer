import { Menu, Role } from '../app/models'
// import { RoleMenu } from '../app/models'
import { cloneDeep } from 'lodash'

/* interface IMenuListItem {
  id: number
  name: string
  type: number
  icon: string
  auth: string
  parentId: number | null
  sort: number
  create_time: string
  update_time: string
} */

export interface IMenuItem extends Menu {
  children: IMenuItem[] | null
}

export interface IRoleItem {
  id: number
  name: string
  auth_level: number
  description: string
  menuList: IMenuItem[] | []
  create_time: string
  update_time: string
}

export function genMenu(menuList: Menu[]): IMenuItem[] {
  const menu: IMenuItem[] = []
  const copiedMenuList = cloneDeep(menuList)

  for (let i = 0; i < copiedMenuList.length; i++) {
    if (!copiedMenuList[i].parentId) {
      menu.push({
        ...copiedMenuList.splice(i, 1)[0],
        children: null
      } as IMenuItem)
      i--
    }
  }

  function _recurseMenu(menus: IMenuItem[]) {
    for (const menu of menus) {
      for (let i = 0; i < copiedMenuList.length; i++) {
        if (copiedMenuList[i].parentId === menu.id) {
          if (!menu.children) {
            menu.children = []
          }

          menu.children.push({
            ...copiedMenuList.splice(i, 1)[0],
            children: null
          } as IMenuItem)
          i--
        }
      }

      if (copiedMenuList.length) {
        if (menu.children && menu.children.length) {
          _recurseMenu(menu.children)
        }
      }
    }
  }

  _recurseMenu(menu)

  return menu
}

export function copyRoleList(role: Role[]): IRoleItem[] {
  const roleList: IRoleItem[] = []
  role.forEach((item) => {
    const roleItem = {}
    for (const [key, value] of Object.entries(item)) {
      if (key !== 'menuIds') {
        Reflect.set(roleItem, key, value)
      }
    }

    Reflect.set(roleItem, 'menuList', [])

    roleList.push(roleItem as IRoleItem)
  })

  return roleList
}
