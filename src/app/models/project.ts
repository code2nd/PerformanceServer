import { Sequelize, DataTypes, Model, Op } from 'sequelize'
import { sequelize } from '../../core/db'
import { Exist, NotFound } from '../../core/http-exception'

import ProjectCategory from './project_category'

import { IProjectRetrieve, IProjectCreate, IProjectUpdate } from '../types'
import { getTimeInterval } from '../../utils/date'

import { PageVisit, Exception } from './'

class Project extends Model {
  // 获取项目列表(包含统计数据信息) -- 可通过 类型 名称查询
  static async getProjectListWithStatitics(
    category: number,
    project: string,
    page: number,
    pageSize: number
  ) {
    // users 通过 website_id 找到 page_visit 中的 visitor 去重
    // 该项目被访问了多少次 page_visit -> 统计website_id

    // js异常数 通过 website_id 找到 category = 1 的
    // 接口异常 通过website_id 找到 category = 3 的

    const res = await Project.findAndCountAll({
      attributes: ['id', ['project_name', 'name'], 'website'],
      raw: true,
      where: {
        [Op.and]: [
          category && {
            category
          },
          project && {
            project_name: {
              [Op.like]: `%${project}%`
            }
          }
        ]
      },
      order: [['create_time', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    })

    const { count, rows: list } = res
    for (let i = 0, len = list.length; i < len; i++) {
      // PV
      const { count: PV } = await PageVisit.findAndCountAll({
        where: {
          website_id: (list[i] as any).id
        },
        raw: true
      })

      // UV
      const [{ count: UV }] = (await PageVisit.findAll({
        attributes: [[sequelize.literal('COUNT(DISTINCT(visitor))'), 'count']],
        where: {
          website_id: (list[i] as any).id
        },
        raw: true
      })) as any

      // js异常
      const { count: jsCount } = await Exception.findAndCountAll({
        where: {
          website_id: (list[i] as any).id,
          category: 1
        }
      })

      // 接口异常
      const { count: interfaceCount } = await Exception.findAndCountAll({
        where: {
          website_id: (list[i] as any).id,
          category: 3
        }
      })

      ;(list[i] as any).data = {
        users: UV,
        PV,
        UV,
        js: jsCount,
        interface: interfaceCount
      }
    }

    return {
      total: count,
      list
    }
  }

  // 获取项目列表（只需id和name）
  static async getProjectListSimple() {
    const res = await Project.findAll({
      attributes: ['id', ['project_name', 'name']],
      raw: true,
      order: [['create_time', 'DESC']]
    })

    return res
  }

  // 获取项目列表
  static async getProjectList(queries: IProjectRetrieve) {
    const { category, project, page, pageSize, create_time } = queries

    const { startDate, endDate } = getTimeInterval(create_time)

    const list = await Project.findAndCountAll({
      attributes: [
        'id',
        ['project_name', 'project'],
        'website',
        'category',
        [Sequelize.col('ProjectCategory.category_name'), 'categoryName'],
        'create_time',
        'update_time'
      ],
      include: [
        {
          model: ProjectCategory,
          attributes: []
        }
      ],
      raw: true,
      where: {
        [Op.and]: [
          category && {
            category
          },
          project && {
            project_name: {
              [Op.like]: `%${project}%`
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
      order: [['create_time', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    })

    return list
  }

  // 新增项目
  static async addProject(projectInfo: IProjectCreate) {
    const { project_name, website, category } = projectInfo

    // 1 先判断该项目是否已经存在
    const project = await Project.getProjectByWebsite(website)

    if (project) {
      throw new Exist('该项目已经存在')
    }

    const res = await Project.create({
      project_name,
      website,
      category
    })

    return res
  }

  // 更新项目
  static async updateProject(projectInfo: IProjectUpdate) {
    const { id, project_name, website, category } = projectInfo

    // 1 先判断该项目是否存在
    const project = await Project.getProjectById(Number(id))

    if (!project) {
      throw new NotFound('更新项不存在')
    }

    await Project.update(
      {
        project_name,
        website,
        category
      },
      {
        where: {
          id
        }
      }
    )
  }

  // 删除项目
  static async deleteProject(id: number) {
    await Project.destroy({
      where: {
        id
      }
    })
  }

  // 根据website查找project
  static async getProjectByWebsite(website: string) {
    const project = await Project.findOne({
      where: {
        website
      }
    })

    return project
  }

  // 根据id查找project
  static async getProjectById(id: number) {
    return await Project.findOne({
      where: {
        id
      }
    })
  }
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      unique: 'id',
      comment: '主键id'
    },
    project_name: {
      type: DataTypes.STRING(20),
      defaultValue: '未命名项目',
      comment: '项目名称'
    },
    website: {
      type: DataTypes.STRING(64),
      comment: '项目线上地址'
    },
    category: {
      type: DataTypes.TINYINT.UNSIGNED,
      comment: '项目类型'
    },
    category_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      field: 'category', // 本表中的字段
      references: {
        model: ProjectCategory,
        key: 'category' // project_category表中的字段
      }
    }
  },
  {
    sequelize,
    tableName: 'project',
    indexes: [
      {
        fields: ['category']
      } /* ,
      {
        fields: ['website']
      } */
    ]
  }
)

// 一个category(主表/父表)可以属于多个project(从表/子表) -- 一对多

// ProjectCategory.hasOne(Project)

Project.belongsTo(ProjectCategory, {
  foreignKey: 'category'
})

export default Project
