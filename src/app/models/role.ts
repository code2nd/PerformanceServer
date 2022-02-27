import { Model, DataTypes } from 'sequelize'
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize'
import { sequelize } from '../../core/db'
import Menu from './menu'

import { IRoleInfo, IRoleInfoWithMenu } from '../types'
import { genMenu, copyRoleList } from '../../utils/genMenu'

class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare id: CreationOptional<number>
  declare menuIds: string
  declare name: string
  declare auth_level: number
  declare description: CreationOptional<string>
  /* declare create_time: CreationOptional<Date>
  declare update_time: CreationOptional<Date> */

  // 获取角色列表
  static async getRoleList(page: number, pageSize: number) {
    const { count, rows } = await Role.findAndCountAll({
      raw: true,
      offset: (page - 1) * pageSize,
      limit: pageSize
    })

    const copiedRows = copyRoleList(rows)

    // 得到的结果再根据menuIds去Menu表中查菜单
    for (let i = 0, len = rows.length; i < len; i++) {
      if (rows[i].menuIds) {
        const menu = await Menu.getMenuByMenuIds(rows[i].menuIds.split(','))
        copiedRows[i].menuList = genMenu(menu)
      }
    }

    return {
      total: count,
      list: copiedRows
    }
  }

  // 添加角色
  static async createRole(roleInfo: IRoleInfo) {
    const { name, auth_level, description, menuList } = roleInfo

    await Role.create({
      name,
      auth_level,
      description,
      menuIds: menuList
    })
  }

  // 修改角色
  static async updateRole(roleInfoWithMenu: IRoleInfoWithMenu) {
    const { id, name, auth_level, description, menuList } = roleInfoWithMenu

    await Role.update(
      {
        name,
        auth_level,
        description,
        menuIds: menuList
      },
      {
        where: {
          id
        }
      }
    )
  }

  // todo 删除角色(删除角色之后对应该角色的用户及用户相关信息均被删除)

  // 根据roleId获取menuIds
  static async getMenuIdsByRoleId(id: number) {
    const res = await Role.findOne({
      attributes: ['menuIds'],
      where: {
        id
      }
    })

    return res
  }

  // 获取角色列表(全部)
  static async getRoleListAll() {
    const res = await Role.findAll({
      attributes: [
        ['id', 'key'],
        ['name', 'value']
      ],
      raw: true
    })

    return res
  }
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键id'
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '角色名称'
    },
    auth_level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 8,
      comment: '权限系数'
    },
    description: {
      type: DataTypes.STRING(64),
      comment: '角色描述'
    },
    menuIds: {
      type: DataTypes.STRING(255),
      comment: '角色菜单'
    }
  },
  {
    sequelize,
    tableName: 'role'
  }
)

export default Role
