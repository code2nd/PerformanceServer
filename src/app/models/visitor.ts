import { DataTypes, Model, Sequelize, Op } from 'sequelize'
import { Exist, NotFound } from '../../core/http-exception'
import { sequelize } from '../../core/db'

import { getTimeInterval } from '../../utils/date'
import getCityInfoByIp from '../../utils/getCityInfoByIp'

class Visitor extends Model {
  // 新增
  static async addVisitor(ip: string) {
    const res = await Visitor.getVisitorByIp(ip)

    if (res) {
      throw new Exist('已经存在')
    }

    // 根据ip查询城市信息
    const { city, longitude, latitude } = await getCityInfoByIp(ip)

    const visitInfo = await Visitor.create({
      ip: Sequelize.fn('inet_aton', ip),
      city,
      longitude,
      latitude
    })

    return visitInfo
  }

  // 新增（不用检测是否存在）
  static async addVisitorDirectly(ip: string) {
    // 根据ip查询城市信息
    const { city, longitude, latitude } = await getCityInfoByIp(ip)

    const visitInfo = await Visitor.create({
      ip: Sequelize.fn('inet_aton', ip),
      city,
      longitude,
      latitude
    })

    return visitInfo
  }

  // 查找
  static async getVisitor(
    city: string,
    firstTime: string,
    page: number,
    pageSize: number
  ) {
    const { startDate, endDate } = getTimeInterval(firstTime)

    const { count, rows } = await Visitor.findAndCountAll({
      attributes: [
        [sequelize.fn('inet_ntoa', sequelize.col('ip')), 'ip'],
        'city',
        'longitude',
        'latitude',
        'first_time'
      ],
      raw: true,
      where: {
        [Op.and]: [
          {
            city: {
              [Op.like]: `%${city}%`
            }
          },
          firstTime && {
            first_time: {
              [Op.gte]: startDate,
              [Op.lt]: endDate
            }
          }
        ]
      },
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['first_time', 'DESC']]
    })

    return {
      total: count,
      list: rows
    }
  }

  // 删除
  static async deleteVisitor(id: number) {
    const visitor = await Visitor.getVisitorById(id)

    if (!visitor) {
      throw new NotFound('该删除项不存在')
    }

    await Visitor.destroy({
      where: {
        id
      }
    })
  }

  // 根据ip查找
  static async getVisitorByIp(ip: string) {
    const res = await Visitor.findOne({
      where: sequelize.where(
        sequelize.fn('inet_ntoa', sequelize.col('Visitor.ip')),
        ip
      )
    })

    return res
  }

  // 根据id查找
  static async getVisitorById(id: number) {
    const visitor = await Visitor.findOne({
      where: {
        id
      }
    })

    return visitor
  }
}

Visitor.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      unique: 'id',
      comment: '主键id'
    },
    ip: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '访问者ip'
    },
    city: {
      type: DataTypes.STRING(20),
      comment: '所属城市'
    },
    longitude: {
      type: DataTypes.DOUBLE,
      comment: '所属城市的经度'
    },
    latitude: {
      type: DataTypes.DOUBLE,
      comment: '所属成熟的纬度'
    }
  },
  {
    sequelize,
    tableName: 'visitor',
    timestamps: true,
    createdAt: 'first_time',
    updatedAt: false
  }
)

export default Visitor
