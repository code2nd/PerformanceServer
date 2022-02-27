import { DataTypes, Model, Op } from 'sequelize'
import { sequelize } from '../../core/db'

import ExceptionCategory from './exception_category'
import Project from './project'
import Visitor from './visitor'

import {
  today,
  tomorrow,
  ONE_DAY,
  getTimeInterval,
  getLatestTime
} from '../../utils/date'
import { dateBarChartData } from '../../utils/dataFormat'

import { IExceptionCreate, IExceptionRetrieve } from '../types'

// 查询
class Exception extends Model {
  // 获取异常列表
  static async getException(exceptionInfo: IExceptionRetrieve) {
    const { project, category, content, occurred_time, page, pageSize } =
      exceptionInfo

    const { startDate, endDate } = getTimeInterval(occurred_time)

    const { count, rows } = await Exception.findAndCountAll({
      attributes: [
        'id',
        [sequelize.col('Project.project_name'), 'project'],
        [sequelize.col('Project.website'), 'website'],
        [sequelize.fn('inet_ntoa', sequelize.col('Visitor.ip')), 'visitor'],
        [sequelize.col('ExceptionCategory.category_name'), 'category'],
        'content',
        'occurred_time'
      ],
      include: [
        {
          model: ExceptionCategory,
          attributes: []
        },
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
          category && {
            category
          },
          sequelize.where(sequelize.col('Project.project_name'), {
            [Op.like]: `%${project}%`
          }),
          {
            content: {
              [Op.like]: `%${content}%`
            }
          },
          occurred_time && {
            occurred_time: {
              [Op.gte]: startDate,
              [Op.lt]: endDate
            }
          }
        ]
      },
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['occurred_time', 'DESC']]
    })

    return {
      total: count,
      list: rows
    }
  }

  // 插入一条上报的异常信息
  static async addException(exceptionInfo: IExceptionCreate) {
    const { visitor, website, category, content } = exceptionInfo

    const visitorId = await Exception.getVisitorIdByVisitor(visitor)
    const websiteId = await Exception.getWebsiteIdByWebsite(website)

    await Exception.create({
      visitor: visitorId,
      website_id: websiteId,
      category,
      content
    })
  }

  // 删除项目
  static async deleteException(id: number) {
    await Exception.destroy({
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

    return null
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

    return null
  }

  // 获取异常监控信息
  static async getExceptionMonitor(website_id: number) {
    // 总异常数、今日总异常数，今日js异常数，今日接口异常数
    // 总异常数
    const exceptionTotal = await Exception.getSomeTimeExceptionCount(
      website_id,
      -1
    )
    // 今日总异常数
    const exceptionToday = await Exception.getSomeTimeExceptionCount(
      website_id,
      0
    )
    // 今日js异常数
    const exceptionJsToday = await Exception.getSomeTimeExceptionCount(
      website_id,
      0,
      1
    )
    // 今日接口异常数
    const exceptionInterfaceToday = await Exception.getSomeTimeExceptionCount(
      website_id,
      0,
      3
    )

    return {
      exceptionTotal,
      exceptionToday,
      exceptionJsToday,
      exceptionInterfaceToday
    }
  }

  static async getSomeTimeExceptionCount(
    website_id: number,
    diff: number,
    category = 0
  ) {
    const count = await Exception.count({
      where: {
        [Op.and]: [
          {
            website_id
          },
          category && {
            category
          },
          diff > -1 && {
            occurred_time: {
              [Op.lt]: new Date(tomorrow).getTime() - diff * ONE_DAY,
              [Op.gt]: new Date(today).getTime() - diff * ONE_DAY
            }
          }
        ]
      }
    })

    return count
  }

  // 获取异常分类占比
  static async getExceptionProportion(website_id: number) {
    const data: { name: string; value: number }[] = []

    // js异常总数
    const jsTotal = await Exception.getSomeTimeExceptionCount(website_id, -1, 1)
    data.push({
      name: 'js异常',
      value: jsTotal
    })

    // 接口异常总数
    const interfaceTotal = await Exception.getSomeTimeExceptionCount(
      website_id,
      -1,
      3
    )
    data.push({
      name: '接口异常',
      value: interfaceTotal
    })

    return data
  }

  // 近一个月异常趋势
  static async getExceptionTendency(website_id: number) {
    const { times } = getLatestTime(30)

    const jsData = await Exception.getSomeTimeDayData(website_id, 1, 30)
    const interfaceData = await Exception.getSomeTimeDayData(website_id, 3, 30)

    return {
      xLabels: times,
      values: [jsData, interfaceData]
    }
  }

  // 获取近一段时间每天数据
  static async getSomeTimeDayData(
    website_id: number,
    category: number,
    diff: number
  ) {
    const { startDate, endDate, times } = getLatestTime(diff)

    const res = await Exception.findAll({
      attributes: [
        [
          sequelize.fn(
            'DATE_FORMAT',
            sequelize.col('occurred_time'),
            '%Y-%m-%d'
          ),
          'date'
        ],
        [sequelize.fn('COUNT', sequelize.col('occurred_time')), 'count']
      ],
      raw: true,
      where: {
        [Op.and]: [
          {
            website_id
          },
          {
            category
          },
          {
            occurred_time: {
              [Op.gt]: startDate,
              [Op.lt]: endDate
            }
          }
        ]
      },
      group: sequelize.col('date')
    })

    const data = dateBarChartData(res as any, times)

    return data
  }
}

Exception.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
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
    category: {
      type: DataTypes.TINYINT.UNSIGNED,
      comment: '异常类型id'
    },
    content: {
      type: DataTypes.STRING(256),
      comment: '异常内容'
    },
    category_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      field: 'category',
      references: {
        model: ExceptionCategory,
        key: 'category'
      }
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
    tableName: 'exception',
    timestamps: true,
    createdAt: 'occurred_time',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['id']
      },
      {
        fields: ['category']
      },
      {
        fields: ['website_id']
      },
      {
        fields: ['visitor']
      }
    ]
  }
)

Exception.belongsTo(ExceptionCategory, {
  foreignKey: 'category'
})

Exception.belongsTo(Project, {
  foreignKey: 'website_id'
})

Exception.belongsTo(Visitor, {
  foreignKey: 'visitor'
})

export default Exception
