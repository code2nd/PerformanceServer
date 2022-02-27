import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  Op
} from 'sequelize'
import { sequelize } from '../../core/db'

// 菜单表
class Menu extends Model<InferAttributes<Menu>, InferCreationAttributes<Menu>> {
  declare id: CreationOptional<number>
  declare name: string
  declare type: number
  declare url: CreationOptional<string>
  declare icon: CreationOptional<string>
  declare auth: CreationOptional<string>
  declare parentId: CreationOptional<number>
  declare sort: CreationOptional<number>
  declare create_time: CreationOptional<Date>
  declare update_time: CreationOptional<Date>

  // 查找
  static async getMenuList() {
    const rows = await Menu.findAll({
      attributes: [
        'id',
        'name',
        'url',
        'parentId',
        'type',
        'icon',
        [Sequelize.col('Menu.auth'), 'permission'],
        'create_time',
        'update_time'
      ],
      raw: true
    })

    return {
      total: 0,
      list: rows
    }
  }
  // 新增
  // 修改
  // 删除

  // 根据 menuIds 获取菜单
  static async getMenuByMenuIds(menuIds: string[]) {
    const menu = await Menu.findAll({
      attributes: [
        'id',
        [Sequelize.col('Menu.name'), 'name'],
        [Sequelize.col('Menu.url'), 'url'],
        [Sequelize.col('Menu.parentId'), 'parentId'],
        [Sequelize.col('Menu.type'), 'type'],
        [Sequelize.col('Menu.icon'), 'icon'],
        [Sequelize.col('Menu.auth'), 'permission'],
        [Sequelize.col('Menu.sort'), 'sort']
      ],
      raw: true,
      where: {
        id: {
          [Op.in]: menuIds
        }
      }
    })

    return menu
  }
}

Menu.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: '主键id'
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '菜单名称'
    },
    type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      comment: '菜单类型'
    },
    url: {
      type: DataTypes.STRING(32),
      comment: '菜单url'
    },
    icon: {
      type: DataTypes.STRING(20),
      comment: '菜单icon'
    },
    auth: {
      type: DataTypes.STRING(64),
      comment: '按钮权限'
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '父级菜单id'
    },
    sort: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '排序'
    },
    create_time: DataTypes.DATE,
    update_time: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'menu'
  }
)

export default Menu
