import { DataTypes, Model, Op, QueryTypes } from 'sequelize'
import { sequelize } from '../../core/db'
import Visitor from './visitor'
import Project from './project'
import { IPageVisitCreate, IPageVisitRetrieve } from '../types'
import { NotFound } from '../../core/http-exception'
import { today, tomorrow, ONE_DAY, getTimeInterval } from '../../utils/date'
import { getCount } from '../../utils/getCount'
// import getCityInfoByIp from '../../utils/getCityInfoByIp'

interface IData {
  dateTime: string
  value: number
}

interface IQueryData {
  dateTime: string
  count: number
}

class PageVisit extends Model {
  // 新增
  static async addPageVisit(pageVisitInfo: IPageVisitCreate) {
    const { website, visitor, path, cost } = pageVisitInfo
    // 1 将website转为id存储，将visitor转为id存储
    const website_id = await PageVisit.getWebsiteIdByWebsite(website)
    const visitor_id = await PageVisit.getVisitorIdByVisitor(visitor)

    await PageVisit.create({
      visitor: visitor_id,
      website_id,
      path,
      cost
    })
  }

  // 查找
  static async getPageVisit(pageVisitInfo: IPageVisitRetrieve) {
    const { website, visitor, visit_time, page, pageSize } = pageVisitInfo
    const { startDate, endDate } = getTimeInterval(visit_time)

    // 筛选
    const { count, rows } = await PageVisit.findAndCountAll({
      attributes: [
        'id',
        [sequelize.fn('inet_ntoa', sequelize.col('Visitor.ip')), 'visitor'],
        [sequelize.col('Project.website'), 'website'],
        'cost',
        'visit_time'
      ],
      include: [
        {
          model: Visitor,
          attributes: []
        },
        {
          model: Project,
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
          visit_time && {
            visit_time: {
              [Op.gte]: startDate,
              [Op.lt]: endDate
            }
          }
        ]
      },
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['visit_time', 'DESC']]
    })

    return {
      total: count,
      list: rows
    }
  }

  // 删除
  static async deletePageVisit(id: number) {
    const record = await PageVisit.getRecordByid(id)

    if (!record) {
      throw new NotFound('该删除项不存在')
    }

    await PageVisit.destroy({
      where: {
        id
      }
    })
  }

  // 网站访问量统计 -- 最近一个月每天的访问量 条件时间范围  按日期聚合
  static async getPageVisitCount(website_id: number, days: number) {
    const queryData: unknown[] = await PageVisit.findAll({
      attributes: [
        [
          sequelize.fn('date_format', sequelize.col('visit_time'), '%Y-%m-%d'),
          'dateTime'
        ],
        [sequelize.fn('COUNT', sequelize.col('*')), 'count']
      ],
      raw: true,
      where: {
        [Op.and]: [
          { website_id },
          {
            visit_time: {
              [Op.lt]: new Date().getTime(),
              [Op.gte]: new Date(new Date().getTime() - days * ONE_DAY)
            }
          }
        ]
      },
      group: sequelize.fn(
        'date_format',
        sequelize.col('visit_time'),
        '%Y-%m-%d'
      )
    })

    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const [result] = await sequelize.query<IData>(
        `SELECT DATE_SUB(CURDATE(), INTERVAL ${i} DAY) as dateTime, 0 as value`,
        { type: QueryTypes.SELECT }
      )

      for (let j = 0, len = queryData.length; j < len; j++) {
        if (result.dateTime === (queryData[j] as IQueryData).dateTime) {
          result.value = (queryData[j] as IQueryData).count
          queryData.splice(j, 1)
          break
        }
      }

      data.push(result)
    }

    return data
  }

  // 网站近一个月每次打开所耗费的时间
  static async getPageVisitCost(website_id: number, days: number) {
    const res = await PageVisit.findAll({
      attributes: ['id', ['visit_time', 'dateTime'], 'cost'],
      raw: true,
      where: {
        [Op.and]: [
          { website_id },
          {
            visit_time: {
              [Op.lt]: new Date().getTime(),
              [Op.gte]: new Date(new Date().getTime() - days * ONE_DAY)
            }
          }
        ]
      }
    })

    return res
  }

  // 获取流量数据
  static async getPageVisitFlowData(website_id: number) {
    // 总流量(totalVisit) 总访客数(totalVisitor) 今日浏览量(todayVisit) 今日访客数(todayVisitor) 新访客(newVisitor) 总频次(frequency)
    // 总流量
    const totalVisit = await PageVisit.count({
      where: {
        website_id
      }
    })

    // 截止今日总访客数
    const totalVisitorList = await PageVisit.count({
      where: {
        website_id
      },
      group: 'visitor'
    })

    const totalVisitor = totalVisitorList.length

    // 今日浏览量
    const todayVisit = await this.getSomedayVisitCount(website_id, 0)
    // 昨日浏览量
    const yestodayVisit = await this.getSomedayVisitCount(website_id, 1)

    // 昨日总流量 = 今日总流量 - 今日浏览量
    const yestodayTotalVisit = totalVisit - todayVisit

    // 今日访客数
    const { count: todayVisitor, list: todayTotalVisitor } =
      await this.getSomedayVisitor(website_id, 0)
    // 昨日访客数
    const { count: yestodayVisitor, list: yesTotalVisitor } =
      await this.getSomedayVisitor(website_id, 1)

    // 截止昨日总访客数
    const yestodayTotalVisitor = totalVisitor - todayVisitor

    // 新访客 -- visitor表中今日新增的在page_visit表中访问了website_id的数量
    const todayNewVisitor = await this.getNewVisitor(0)
    const yestodayNewVisitor = await this.getNewVisitor(1)

    const newVisitorToday = getCount(
      todayNewVisitor,
      'id',
      todayTotalVisitor,
      'visitor'
    )
    const newVisitorYestoday = getCount(
      yestodayNewVisitor,
      'id',
      yesTotalVisitor,
      'visitor'
    )

    // 频次 -- 该网站被访问的总次数 / 被访问的天数
    const todays = await this.getVisitDays(website_id, 0)
    const yestodays = await this.getVisitDays(website_id, 1)
    const frequencyToday = todays
      ? parseFloat((totalVisit / todays).toFixed(2))
      : 0
    const frequencyYestoday = yestodays
      ? parseFloat((yestodayTotalVisit / yestodays).toFixed(2))
      : 0

    return {
      totalVisit: {
        today: totalVisit,
        yestoday: yestodayTotalVisit
      },
      totalVisitor: {
        today: totalVisitor,
        yestoday: yestodayTotalVisitor
      },
      visit: {
        today: todayVisit,
        yestoday: yestodayVisit
      },
      visitor: {
        today: todayVisitor,
        yestoday: yestodayVisitor
      },
      newVisitor: {
        today: newVisitorToday,
        yestoday: newVisitorYestoday
      },
      frequency: {
        today: frequencyToday,
        yestoday: frequencyYestoday
      }
    }
  }

  // 根据website查找id
  static async getWebsiteIdByWebsite(website: string) {
    const res = await Project.findOne({
      attributes: ['id'],
      where: {
        website
      }
    })

    if (res) {
      return res.getDataValue('id')
    }

    // 如果没找到说明是新的网站，则创建
    const websiteInfo = await Project.addProject({
      project_name: '未命名项目',
      website,
      category: null
    })

    return websiteInfo.getDataValue('id')
  }

  // 根据visitor查找visitor_id
  static async getVisitorIdByVisitor(visitor: string) {
    const res = await Visitor.findOne({
      attributes: ['id'],
      where: sequelize.where(
        sequelize.fn('inet_ntoa', sequelize.col('ip')),
        visitor
      )
    })

    if (res) {
      return res.getDataValue('id')
    }

    // 如果没找到，就新建一个visitor
    const visitInfo = await Visitor.addVisitorDirectly(visitor)

    return visitInfo.getDataValue('id')
  }

  // 根据id查找记录
  static async getRecordByid(id: number) {
    const record = await PageVisit.findOne({
      where: {
        id
      }
    })

    return record
  }

  // 获取某网站过去某一天的浏览量
  static async getSomedayVisitCount(website_id: number, diff: number) {
    const count = await PageVisit.count({
      where: {
        [Op.and]: [
          { website_id },
          {
            visit_time: {
              [Op.lt]: new Date(tomorrow).getTime() - diff * ONE_DAY,
              [Op.gte]: new Date(today).getTime() - diff * ONE_DAY
            }
          }
        ]
      }
    })

    return count
  }

  // 获取某网站过去某一天的访客数
  static async getSomedayVisitor(website_id: number, diff: number) {
    const todayVisitorList = await PageVisit.findAll({
      attributes: [
        'visitor',
        [sequelize.fn('COUNT', sequelize.col('visitor')), 'count']
      ],
      raw: true,
      where: {
        [Op.and]: [
          { website_id },
          {
            visit_time: {
              [Op.lt]: new Date(tomorrow).getTime() - diff * ONE_DAY,
              [Op.gte]: new Date(today).getTime() - diff * ONE_DAY
            }
          }
        ]
      },
      group: 'visitor'
    })

    return { count: todayVisitorList.length, list: todayVisitorList }
  }

  // 从Visitor表中获取某天新增的visitor
  static async getNewVisitor(diff: number) {
    const visitorList = await Visitor.findAll({
      attributes: ['id'],
      raw: true,
      where: {
        first_time: {
          [Op.lt]: new Date(tomorrow).getTime() - diff * ONE_DAY,
          [Op.gte]: new Date(today).getTime() - diff * ONE_DAY
        }
      }
    })

    return visitorList
  }

  // 某网站被访问的天数
  static async getVisitDays(website_id: number, diff: number) {
    const res = await PageVisit.findAll({
      attributes: [[sequelize.fn('COUNT', sequelize.col('visitor')), 'count']],
      raw: true,
      where: {
        [Op.and]: [
          { website_id },
          {
            visit_time: {
              [Op.lt]: new Date(tomorrow).getTime() - diff * ONE_DAY
            }
          }
        ]
      },
      group: sequelize.fn(
        'date_format',
        sequelize.col('visit_time'),
        '%Y-%m-%d'
      )
    })

    return res.length
  }

  // 获取网站访问量地域分布
  static async getPageVisitDistribution(website_id: number, limit = 50) {
    const res = await PageVisit.findAll({
      attributes: [
        [sequelize.col('Visitor.city'), 'name'],
        [sequelize.fn('COUNT', sequelize.col('Visitor.city')), 'value']
      ],
      include: [
        {
          model: Visitor,
          attributes: []
        }
      ],
      where: {
        website_id
      },
      raw: true,
      offset: 0,
      limit,
      group: sequelize.col('Visitor.city'),
      order: [[sequelize.col('value'), 'DESC']]
    })

    return res
  }
}

PageVisit.init(
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
    path: {
      type: DataTypes.STRING(20),
      comment: '所访问的页面'
    },
    cost: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '页面加载时长'
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
    tableName: 'page_visit',
    timestamps: true,
    createdAt: 'visit_time',
    updatedAt: false,
    indexes: [
      {
        fields: ['website_id']
      },
      {
        fields: ['visitor']
      }
    ]
  }
)

PageVisit.belongsTo(Project, {
  foreignKey: 'website_id'
})

PageVisit.belongsTo(Visitor, {
  foreignKey: 'visitor'
})

export default PageVisit
