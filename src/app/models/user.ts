import * as bcrypt from 'bcryptjs'
import { DataTypes, Model, Op } from 'sequelize'
import { sequelize } from '../../core/db'
import { Exist, NotFound, AuthFailed } from '../../core/http-exception'

import Role from './role'

import type {
  IRegistor,
  IAccount,
  IChangePassword,
  IUserListQueryInfo,
  IUpdateUserInfo
} from '../types'
import { getTimeInterval } from '../../utils/date'

const salt = bcrypt.genSaltSync(10)

class User extends Model {
  // 注册
  static async registerByUsername(account: IRegistor) {
    const { username, password, role } = account

    // 1 查看该用户名是否已经注册
    const user = await User.getUserInfoByUsername(username)

    if (user) {
      throw new Exist('该用户名已经被注册！')
    }

    // 2 创建用户
    const hash = bcrypt.hashSync(password, salt)

    await User.create({
      user_name: username,
      role_id: role,
      password: hash
    })
  }

  // 登录
  static async loginByUsername(account: IAccount) {
    const { username, password } = account
    // 1 查看该用户是否已经注册
    const user = await User.getUserInfoByUsername(username)

    if (!user) {
      throw new NotFound('账号不存在')
    }

    const correct = bcrypt.compareSync(password, user.getDataValue('password'))

    if (!correct) {
      throw new AuthFailed('密码不正确')
    }

    return user
  }

  // 获取用户列表
  static async getUserList(queryInfo: IUserListQueryInfo) {
    const { role, username, create_time, page, pageSize } = queryInfo

    const { startDate, endDate } = getTimeInterval(create_time)

    const { count, rows } = await User.findAndCountAll({
      attributes: [
        ['user_id', 'id'],
        ['user_name', 'username'],
        [sequelize.col('role.name'), 'roleName'],
        ['role_id', 'role'],
        'avatar',
        'create_time',
        'update_time'
      ],
      raw: true,
      include: [
        {
          model: Role,
          as: 'role',
          attributes: []
        }
      ],
      where: {
        [Op.and]: [
          role && {
            role_id: role
          },
          {
            user_name: {
              [Op.like]: `%${username}%`
            }
          },
          create_time && {
            create_time: {
              [Op.gte]: startDate,
              [Op.lt]: endDate
            }
          }
        ]
      },
      offset: (page - 1) * pageSize,
      limit: pageSize
    })

    return {
      total: count,
      list: rows
    }
  }

  // 根据用户名查找用户信息
  static async getUserInfoByUsername(user_name: string) {
    const user = await User.findOne({
      attributes: ['user_id', 'user_name', 'password', 'avatar', 'auth_level'],
      where: {
        user_name
      }
    })

    return user
  }

  // 修改密码
  static async changePassword(changePassword: IChangePassword) {
    const { user_id, password } = changePassword

    // 查看用户是否存在
    const user = await User.getUserByUserId(user_id)

    if (!user) {
      throw new NotFound('账号不存在')
    }

    const hash = bcrypt.hashSync(password, salt)

    await User.update(
      { password: hash },
      {
        where: {
          user_id
        }
      }
    )
  }

  // 修改用户信息
  static async UpdateUserInfo(updateUserInfo: IUpdateUserInfo) {
    const { id, username, role, password } = updateUserInfo

    let hash
    if (password) {
      hash = bcrypt.hashSync(password, salt)
    }

    const pass = hash ? { password: hash } : {}

    await User.update(
      {
        user_name: username,
        role_id: role,
        ...pass
      },
      {
        where: {
          user_id: id
        }
      }
    )
  }

  // 根据用户id查找用户信息
  static async getUserByUserInfoId(user_id: number) {
    const user = await User.findOne({
      attributes: [['user_id', 'id'], ['user_name', 'username'], 'avatar'],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description']
        }
      ],
      // raw: true,
      where: {
        user_id
      }
    })

    return user
  }

  // 根据用户id查找用户
  static async getUserByUserId(user_id: number) {
    const user = await User.findOne({
      where: {
        user_id
      }
    })

    return user
  }
}

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      comment: '用户id'
    },
    user_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '用户名'
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: '密码'
    },
    avatar: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'https://www.jalamy.cn:9003/imgs/avatar/default.png',
      comment: '头像'
    },
    auth_level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 8,
      comment: '权限等级'
    },
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '角色'
    },
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: 'role_id',
      references: {
        model: Role,
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'user',
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      },
      {
        unique: true,
        fields: ['user_name']
      },
      {
        fields: ['role_id']
      }
    ]
  }
)

User.belongsTo(Role, {
  as: 'role',
  foreignKey: 'role_id'
})

export default User
