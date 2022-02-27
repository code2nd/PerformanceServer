import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../core/db'
import { Exist, NotFound } from '../../core/http-exception'

class ExceptionCategory extends Model {
  // 查询
  static async getExceptionCategory(page: number, pageSize: number) {
    const { count, rows } = await ExceptionCategory.findAndCountAll({
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

  // 查找所有
  static async getExceptionCategoryList() {
    const res = await ExceptionCategory.findAll({
      attributes: [
        ['category', 'key'],
        ['category_name', 'value']
      ],
      raw: true
    })

    return res
  }

  // 新增
  static async addExceptionCategory(category_name: string) {
    const result = await ExceptionCategory.getByCategoryName(category_name)

    if (result) {
      throw new Exist('该项已经存在')
    }

    await ExceptionCategory.create({
      category_name
    })
  }
  // 修改
  static async updateExceptionCategory(
    category: number,
    category_name: string
  ) {
    // 1 先查找是否存在
    const result = await ExceptionCategory.getCategory(category)

    if (!result) {
      throw new NotFound('该修改项不存在')
    }

    await ExceptionCategory.update(
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
  static async deleteExceptionCategory(category: number) {
    const result = ExceptionCategory.getCategory(category)

    if (!result) {
      throw new NotFound('该删除项不存在')
    }

    await ExceptionCategory.destroy({
      where: {
        category
      }
    })
  }

  // 根据category查找
  static async getCategory(category: number) {
    const res = await ExceptionCategory.findOne({
      where: {
        category
      }
    })

    return res
  }

  // 根据category_name查找
  static async getByCategoryName(category_name: string) {
    const res = await ExceptionCategory.findOne({
      where: {
        category_name
      }
    })

    return res
  }
}

ExceptionCategory.init(
  {
    category: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      comment: '异常分类id'
    },
    category_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '异常分类名称'
    }
  },
  {
    sequelize,
    tableName: 'exception_category',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['category']
      },
      {
        fields: ['category_name']
      }
    ]
  }
)

export default ExceptionCategory
