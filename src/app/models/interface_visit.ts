import { DataTypes, Model, Op } from 'sequelize'
import { sequelize } from '../../core/db'
import Project from './project'
import Visitor from './visitor'
import { IInterfaceVisitCreate, IInterfaceVisitRetrieve } from '../types'
import { NotFound } from '../../core/http-exception'

import { today, tomorrow, ONE_DAY, getTimeInterval } from '../../utils/date'

class InterfaceVisit extends Model {
  // 新增
  static async addInterfaceVisit(interfaceVisitInfo: IInterfaceVisitCreate) {
    const { visitor, website, interfaceName, size, cost } = interfaceVisitInfo

    // 1 将visitor转为id存储
    // 2 将website转为id存储

    const visitorId = await InterfaceVisit.getVisitorIdByVisitor(visitor)
    const websiteId = await InterfaceVisit.getWebsiteIdByWebsite(website)

    await InterfaceVisit.create({
      visitor: visitorId,
      website_id: websiteId,
      interface_name: interfaceName,
      size,
      cost
    })
  }

  // 查找
  static async getInterfaceVisit(interfaceVisitInfo: IInterfaceVisitRetrieve) {
    const { visitor, website, interfaceName, create_time, page, pageSize } =
      interfaceVisitInfo

    const { startDate, endDate } = getTimeInterval(create_time)

    const { count, rows } = await InterfaceVisit.findAndCountAll({
      attributes: [
        'id',
        [sequelize.fn('inet_ntoa', sequelize.col('Visitor.ip')), 'visitor'],
        [sequelize.col('Project.website'), 'website'],
        ['interface_name', 'interfaceName'],
        'size',
        'cost',
        'create_time'
      ],
      include: [
        {
          model: Project,
          attributes: []
        },
        {
          model: Visitor,
          attributes: []
        }
      ],
      raw: true,
      where: {
        [Op.and]: [
          sequelize.where(sequelize.col('Project.website'), {
            [Op.like]: `%${website}%`
          }),
          sequelize.where(
            sequelize.fn('inet_ntoa', sequelize.col('Visitor.ip')),
            {
              [Op.like]: `%${visitor}%`
            }
          ),
          {
            interface_name: {
              [Op.like]: `%${interfaceName}%`
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
      limit: pageSize,
      order: [['create_time', 'DESC']]
    })

    return {
      total: count,
      list: rows
    }
  }

  // 删除
  static async deleteInterfaceVisit(id: number) {
    const record = InterfaceVisit.findOne({
      where: {
        id
      }
    })

    if (!record) {
      throw new NotFound('该删除项不存在')
    }

    await InterfaceVisit.destroy({
      where: {
        id
      }
    })
  }

  // 根据ip获取visitor_id
  static async getVisitorIdByVisitor(ip: string) {
    const record = await Visitor.findOne({
      attributes: ['id'],
      where: sequelize.where(
        sequelize.fn('inet_ntoa', sequelize.col('Visitor.ip')),
        ip
      )
    })

    if (record) {
      return record.getDataValue('id')
    }

    const res = await Visitor.addVisitorDirectly(ip)

    return res.getDataValue('id')
  }

  // 根据website获取website_id
  static async getWebsiteIdByWebsite(website: string) {
    const record = await Project.findOne({
      attributes: ['id'],
      where: {
        website
      }
    })

    if (record) {
      return record.getDataValue('id')
    }

    const websiteInfo = await Project.addProject({
      project_name: '未命名项目',
      website,
      category: null
    })

    return websiteInfo.getDataValue('id')
  }

  // 接口性能
  static async getInterfacePerformance(website_id: number) {
    // 总的接口访问量
    const countTotal = await InterfaceVisit.getSomeTimeInterfaceCount(
      website_id,
      -1
    )
    // 今日接口访问量
    const countToday = await InterfaceVisit.getSomeTimeInterfaceCount(
      website_id,
      0
    )
    // 接口请求平均耗时
    const sumTotal = await InterfaceVisit.getSomeTimeTargetSum(
      website_id,
      'cost',
      -1
    )
    const costTotal = countTotal
      ? parseFloat((sumTotal / countTotal).toFixed(2))
      : 0
    // 今日接口平均耗时
    const sumToday = await InterfaceVisit.getSomeTimeTargetSum(
      website_id,
      'cost',
      0
    )
    const costToday = countToday
      ? parseFloat((sumToday / countToday).toFixed(2))
      : 0

    return {
      countTotal,
      countToday,
      costTotal,
      costToday
    }
  }

  // 获取某个时间段内接口请求数量
  static async getSomeTimeInterfaceCount(website_id: number, diff: number) {
    const count = InterfaceVisit.count({
      where: {
        [Op.and]: [
          {
            website_id
          },
          diff > -1 && {
            create_time: {
              [Op.lt]: new Date(tomorrow).getTime() - diff * ONE_DAY,
              [Op.gt]: new Date(today).getTime() - diff * ONE_DAY
            }
          }
        ]
      }
    })

    return count
  }

  // 获取某个时间段内某个指标的求和数据
  static async getSomeTimeTargetSum(
    website_id: number,
    target: string,
    diff: number
  ) {
    const sum = InterfaceVisit.sum(target, {
      where: {
        [Op.and]: [
          {
            website_id
          },
          diff > -1 && {
            create_time: {
              [Op.lt]: new Date(tomorrow).getTime() - diff * ONE_DAY,
              [Op.gt]: new Date(today).getTime() - diff * ONE_DAY
            }
          }
        ]
      }
    })

    return sum
  }

  // 获取接口请求耗时分段数据
  static async getInterfaceCostData(website_id: number) {
    const data: { name: string; value: number }[] = []

    // < 50ms
    const res50 = await InterfaceVisit.getSomeTimeData(website_id, 'cost', [
      50,
      undefined
    ])
    data.push({
      name: '<50ms',
      value: res50
    })

    // 50 - 100ms
    const res50100 = await InterfaceVisit.getSomeTimeData(
      website_id,
      'cost',
      [50, 100]
    )
    data.push({
      name: '50-100ms',
      value: res50100
    })

    // 100 - 150ms
    const res100150 = await InterfaceVisit.getSomeTimeData(
      website_id,
      'cost',
      [100, 150]
    )
    data.push({
      name: '100-150ms',
      value: res100150
    })

    // 150 - 200ms
    const res150200 = await InterfaceVisit.getSomeTimeData(
      website_id,
      'cost',
      [150, 200]
    )
    data.push({
      name: '150-200ms',
      value: res150200
    })

    // >200ms
    const res200 = await InterfaceVisit.getSomeTimeData(website_id, 'cost', [
      undefined,
      200
    ])
    data.push({
      name: '>200ms',
      value: res200
    })

    return data
  }

  // 获取某段时间内指标数量
  static async getSomeTimeData(
    website_id: number,
    target: string,
    timeInterval: [number | undefined, number | undefined]
  ) {
    const [less, great] = timeInterval
    let flag = 0
    if (less && great) {
      // 取中间范围
    } else if (!less && great) {
      // 大于great
      flag = 1
    } else if (less && !great) {
      // 小于less
      flag = -1
    }

    const count = await InterfaceVisit.count({
      where: {
        [Op.and]: [
          {
            website_id
          },
          {
            [target]: {
              [flag === -1
                ? Op.lt
                : flag === 0
                ? Op.between
                : flag === 1
                ? Op.gt
                : null]:
                flag === -1
                  ? less
                  : flag === 0
                  ? [less, great]
                  : flag === 1
                  ? great
                  : null
            }
          }
        ]
      }
    })

    return count
  }

  // 接口请求耗时Top10
  static async getInterfaceTop(website_id: number) {
    const res = InterfaceVisit.findAll({
      attributes: [
        'interface_name',
        [sequelize.fn('COUNT', sequelize.col('cost')), 'count'],
        [sequelize.fn('AVG', sequelize.col('cost')), 'avg']
      ],
      raw: true,
      where: {
        website_id
      },
      group: 'interface_name',
      offset: 0,
      limit: 10,
      order: [[sequelize.col('count'), 'DESC']]
    })

    return res
  }
}

InterfaceVisit.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: 'id',
      comment: '主键id'
    },
    visitor: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '访问者id'
    },
    website_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '网站地址id'
    },
    reqId: {
      type: DataTypes.STRING(16),
      // unique: 'reqId',
      comment: '请求的唯一标识'
    },
    interface_name: {
      type: DataTypes.STRING(32),
      comment: '资源名称'
    },
    method: {
      type: DataTypes.STRING(10),
      comment: '请求方式'
    },
    size: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: '资源大小'
    },
    cost: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: '加载时长'
    },
    server_cost: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: '后端处理时间'
    },
    website: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: 'website_id',
      references: {
        model: Project,
        key: 'id'
      }
    },
    visitor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: 'visitor',
      references: {
        model: Visitor,
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'interface_visit',
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: false,
    indexes: [
      {
        fields: ['website_id']
      }
    ]
  }
)

InterfaceVisit.belongsTo(Project, {
  foreignKey: 'website_id'
})

InterfaceVisit.belongsTo(Visitor, {
  foreignKey: 'visitor'
})

export default InterfaceVisit
