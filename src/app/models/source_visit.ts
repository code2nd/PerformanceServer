import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../core/db'
import Project from './project'
import Visitor from './visitor'
import { ISourceVisitCreate /* , ISourceVisitRetrieve */ } from '../types'
import { NotFound } from '../../core/http-exception'

class SourceVisit extends Model {
  // 查找
  static async getSourceVisit(/* sourceVisitInfo: ISourceVisitRetrieve */) {
    // const { visitor, website, size, cost } = sourceVisitInfo
    // todo 根据条件筛选
    const list = await SourceVisit.findAll({
      attributes: [
        'id',
        [sequelize.fn('inet_ntoa', sequelize.col('Visitor.ip')), 'visitor'],
        [sequelize.col('Project.website'), 'website'],
        'source_name',
        'size',
        'cost'
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
      where: {}
    })

    return list
  }

  // 新增
  static async addSourceVisit(sourceVisitInfo: ISourceVisitCreate) {
    const { visitor, website, size, cost, sourceName } = sourceVisitInfo
    // todo 新增前查看该资源是否被访问过，如果访问过只需记录加1 uv

    // 1 将visitor转为id存储
    // 2 将website转为id存储
    const visitorId = await SourceVisit.getVisitorIdByVisitor(visitor)
    const websiteId = await SourceVisit.getWebsiteIdByWebsite(website)

    await SourceVisit.create({
      visitor: visitorId,
      website_id: websiteId,
      source_name: sourceName,
      size,
      cost
    })
  }

  // 删除
  static async deleteSourceVisit(id: number) {
    const record = SourceVisit.findOne({
      where: {
        id
      }
    })

    if (!record) {
      throw new NotFound('该删除项不存在')
    }

    await SourceVisit.destroy({
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
}

SourceVisit.init(
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
    source_name: {
      type: DataTypes.STRING(64),
      comment: '资源名称'
    },
    size: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '资源大小'
    },
    cost: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '加载时长'
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
    tableName: 'source_visit',
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['id']
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

SourceVisit.belongsTo(Project, {
  foreignKey: 'website_id'
})

SourceVisit.belongsTo(Visitor, {
  foreignKey: 'visitor'
})

export default SourceVisit
