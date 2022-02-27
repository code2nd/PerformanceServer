import { DataTypes, Model } from 'sequelize'
import { Exist, NotFound } from '../../core/http-exception'
import { sequelize } from '../../core/db'

class ProjectCategory extends Model {
  // 查询
  static async getProjectCategory(page: number, pageSize: number) {
    const { count, rows } = await ProjectCategory.findAndCountAll({
      attributes: [['category', 'id'], 'category_name'],
      raw: true,
      offset: (page - 1) * pageSize,
      limit: pageSize
    })

    return {
      total: count,
      list: rows
    }
  }

  // 查询所有
  static async getProjectCategoryList() {
    const res = await ProjectCategory.findAll({
      attributes: [
        ['category', 'key'],
        ['category_name', 'value']
      ],
      raw: true,
      order: [['category', 'ASC']]
    })

    return res
  }

  // 新增
  static async addProjectCategory(category_name: string) {
    const result = await ProjectCategory.getByCategoryName(category_name)

    if (result) {
      throw new Exist('该项已经存在')
    }

    await ProjectCategory.create({
      category_name
    })
  }
  // 修改
  static async updateProjectCategory(category: number, category_name: string) {
    // 1 先查找是否存在
    const result = await ProjectCategory.getCategory(category)

    if (!result) {
      throw new NotFound('该修改项不存在')
    }

    await ProjectCategory.update(
      {
        category_name
      },
      {
        where: {
          category
        }
      }
    )
  }
  // 删除
  static async deleteProjectCategory(category: number) {
    const result = ProjectCategory.getCategory(category)

    if (!result) {
      throw new NotFound('该删除项不存在')
    }

    await ProjectCategory.destroy({
      where: {
        category
      }
    })
  }

  // 根据category查找
  static async getCategory(category: number) {
    const res = await ProjectCategory.findOne({
      where: {
        category
      }
    })

    return res
  }

  // 根据category_name查找
  static async getByCategoryName(category_name: string) {
    const res = await ProjectCategory.findOne({
      where: {
        category_name
      }
    })

    return res
  }
}

ProjectCategory.init(
  {
    category: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      comment: '项目分类id'
    },
    category_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '项目分类名称'
    }
  },
  {
    sequelize,
    tableName: 'project_category',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['category']
      },
      {
        unique: true,
        fields: ['category_name']
      }
    ]
  }
)

export default ProjectCategory
