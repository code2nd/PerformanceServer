import { DataTypes, Model, Op } from 'sequelize'
import type { WhereOptions } from 'sequelize'
import { sequelize } from '../../core/db'

import { Project, Visitor, PageVisit } from './'

import { IPerformances } from '../types'
import { today, tomorrow, ONE_DAY, getTimeInterval } from '../../utils/date'

class Performance extends Model {
  // 新增
  static async addPerformance(performances: IPerformances) {
    let {
      project,
      visitor,
      // eslint-disable-next-line prefer-const
      ...rest
      /* domInteractive, 
      parseDomTime, 
      lookupDomainTime, 
      connectTime, 
      requestTime, 
      requestDocumentTime, 
      responseDocumentTime, 
      TTFB,
      FP, 
      FCP,  */
    } = performances

    // 根据 project 在 Project 中查找是否存在，不存在则创建，存在则取 id
    project = await this.getProjectId(project)

    // 根据 visitor(ip) 在 Visitor 中查找是否存在，不存在则创建，存在则取 id
    visitor = await this.getVisitorId(visitor)

    await Performance.create({
      project,
      visitor,
      ...rest
    })

    // 同时新增一条网站访问记录
    await PageVisit.create({
      website_id: project,
      visitor,
      path: '/',
      cost: rest.load
    })
  }

  // 查询
  static async getPerformanceList(
    project: string,
    create_time: string,
    page: number,
    pageSize: number
  ) {
    const { startDate, endDate } = getTimeInterval(create_time)

    const { count: total, rows: list } = await Performance.findAndCountAll({
      attributes: {
        exclude: ['project', 'visitor'],
        include: [
          [sequelize.col('Project.project_name'), 'project'],
          [sequelize.fn('inet_ntoa', sequelize.col('Visitor.ip')), 'visitor']
        ]
      },
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
      where: {
        [Op.and]: [
          sequelize.where(sequelize.col('Project.project_name'), {
            [Op.like]: `%${project}%`
          }),
          create_time && {
            create_time: {
              [Op.gte]: startDate,
              [Op.lt]: endDate
            }
          }
        ]
      },
      raw: true,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['create_time', 'DESC']]
    })

    return {
      total,
      list
    }
  }

  // 获取 projectId
  static async getProjectId(website: string) {
    let id
    const projectRes = await Project.findOne({
      where: {
        website
      }
    })

    if (projectRes) {
      id = projectRes.getDataValue('id')
    } else {
      const websiteInfo = await Project.addProject({
        project_name: '未命名项目',
        website,
        category: null
      })

      id = websiteInfo.getDataValue('id')
    }

    return id
  }

  // 获取 visitorId
  static async getVisitorId(visitor: string) {
    let id
    const visitorRes = await Visitor.findOne({
      where: sequelize.where(
        sequelize.fn('inet_ntoa', sequelize.col('Visitor.ip')),
        visitor
      )
    })

    if (visitorRes) {
      id = visitorRes.getDataValue('id')
    } else {
      const res = await Visitor.addVisitorDirectly(visitor)

      id = res.getDataValue('id')
    }

    return id
  }

  // 获取页面性能数据
  static async getPagePerformance(project: number) {
    // TTFB平均时间、Dom解析平均时间、页面平均加载时间

    // TTFB平均时间 - 总
    const { count: ttfbCountTotal, sum: ttfbSumTotal } =
      await Performance.getSomedayPerformanceData(project, 'TTFB', -1)
    const avgTTFBTotal = ttfbCountTotal
      ? parseFloat((ttfbSumTotal / ttfbCountTotal).toFixed(2))
      : 0

    // TTFB平均时间 - 今天
    const { count: ttfbCountToday, sum: ttfbSumToday } =
      await Performance.getSomedayPerformanceData(project, 'TTFB', 0)
    const avgTTFBToday = ttfbCountToday
      ? parseFloat((ttfbSumToday / ttfbCountToday).toFixed(2))
      : 0

    // Dom解析平均时间 - 总
    const { count: domCountTotal, sum: domSumTotal } =
      await Performance.getSomedayPerformanceData(project, 'parseDomTime', -1)
    const avgDomTotal = domCountTotal
      ? parseFloat((domSumTotal / domCountTotal).toFixed(2))
      : 0

    // Dom解析平均时间 - 今天
    const { count: domCountToday, sum: domSumToday } =
      await Performance.getSomedayPerformanceData(project, 'parseDomTime', 0)
    const avgDomToday = domCountToday
      ? parseFloat((domSumToday / domCountToday).toFixed(2))
      : 0

    // 页面平均加载时间 - 总
    const { count: loadCountTotal, sum: loadSumTotal } =
      await Performance.getSomedayPerformanceData(project, 'load', -1)
    const avgLoadTotal = loadCountTotal
      ? parseFloat((loadSumTotal / loadCountTotal).toFixed(2))
      : 0

    // 页面平均加载时间 - 今天
    const { count: loadCountToday, sum: loadSumToday } =
      await Performance.getSomedayPerformanceData(project, 'load', 0)
    const avgLoadToday = loadCountToday
      ? parseFloat((loadSumToday / loadCountToday).toFixed(2))
      : 0

    return {
      avgTTFBTotal,
      avgTTFBToday,
      avgDomTotal,
      avgDomToday,
      avgLoadTotal,
      avgLoadToday
    }
  }

  // 获取某网站过去某一天的性能数据(若diff<0则为所有数据，diff=0今天，diff=1昨天....)
  static async getSomedayPerformanceData(
    project: number,
    target: string,
    diff: number
  ) {
    const where: WhereOptions<any> = {
      [Op.and]: [
        { project },
        diff > -1 && {
          create_time: {
            [Op.lt]: new Date(tomorrow).getTime() - diff * ONE_DAY,
            [Op.gte]: new Date(today).getTime() - diff * ONE_DAY
          }
        },
        {
          [target]: {
            [Op.and]: {
              [Op.not]: null,
              [Op.gt]: 0
            }
          }
        }
      ]
    }

    const count = await Performance.count({
      where
    })

    const sum = await Performance.sum(target, {
      where
    })

    return {
      count,
      sum
    }
  }

  // 页面加载耗时分时间段数据
  static async getPageCostTimeInterval(project: number) {
    const data: { name: string; value: number }[] = []
    // < 1s
    const res1s = await Performance.getSomeTimeData(project, 'load', [
      1,
      undefined
    ])
    data.push({
      name: '<1s',
      value: res1s
    })

    // 1s - 3s
    const res13 = await Performance.getSomeTimeData(project, 'load', [1, 3])
    data.push({
      name: '1-3s',
      value: res13
    })

    // 3s - 5s
    const res35 = await Performance.getSomeTimeData(project, 'load', [3, 5])
    data.push({
      name: '3-5s',
      value: res35
    })

    // 5s - 10s
    const res510 = await Performance.getSomeTimeData(project, 'load', [5, 10])
    data.push({
      name: '5-10s',
      value: res510
    })

    // >10s
    const res10 = await Performance.getSomeTimeData(project, 'load', [
      undefined,
      10
    ])
    data.push({
      name: '>10s',
      value: res10
    })

    return data
  }

  // 获取某段时间内指标数量
  static async getSomeTimeData(
    project: number,
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

    const count = await Performance.findAll({
      attributes: [[sequelize.fn('COUNT', sequelize.col('*')), 'count']],
      raw: true,
      where: {
        [Op.and]: [
          {
            project
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
                  ? less * 1000
                  : flag === 0
                  ? [less * 1000, great * 1000]
                  : flag === 1
                  ? great * 1000
                  : null
            }
          }
        ]
      }
    })

    return (count[0] as any).count
  }
}

Performance.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键id'
    },
    // 根据网址去project表中查，如果没查到就创建
    project: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '项目id'
    },
    // 根据ip去visitor表中查，如果没查到就新增
    visitor: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '访客id'
    },
    domContentLoaded: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: 'DomContentLoaded'
    },
    load: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: 'load'
    },
    FP: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: '首次绘制'
    },
    FCP: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: '首次内容绘制'
    },
    domInteractive: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: '首次可交互时间'
    },
    parseDomTime: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: 'DOM解析耗时'
    },
    lookupDomainTime: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: 'DNS查询耗时'
    },
    connectTime: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: 'TCP连接耗时'
    },
    requestTime: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: '网络传输耗时'
    },
    requestDocumentTime: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: '请求文档耗时（开始请求文档到开始接收文档）'
    },
    responseDocumentTime: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: '接收文档耗时'
    },
    TTFB: {
      type: DataTypes.DOUBLE.UNSIGNED,
      comment: '首字节网络请求时间'
    },
    project_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: 'project',
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
    tableName: 'performance',
    sequelize,
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['id']
      },
      {
        fields: ['project']
      },
      {
        fields: ['visitor']
      }
    ]
  }
)

Performance.belongsTo(Project, {
  foreignKey: 'project'
})

Performance.belongsTo(Visitor, {
  foreignKey: 'visitor'
})

export default Performance
