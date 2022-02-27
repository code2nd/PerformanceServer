import { DataTypes, Model, Sequelize } from 'sequelize'
import { Exist, NotFound } from '../../core/http-exception'
import { sequelize } from '../../core/db'

class Visiter extends Model {
  // 新增
  static async addVisiter(ip: string) {
    const res = await Visiter.getVisiterByIp(ip)

    if (res) {
      throw new Exist('该ip地址已经存在')
    }

    await Visiter.create({
      ip: Sequelize.fn('inet_aton', ip)
    })
  }

  // 查找
  static async getVisiter(/* ip: string, dateTime: string */) {
    // todo ip 时间 筛选
    const list = await Visiter.findAll({
      attributes: [
        [sequelize.fn('inet_ntoa', sequelize.col('ip')), 'ip'],
        'first_time'
      ]
    })

    return list
  }

  // 删除
  static async deleteVisiter(id: number) {
    const visiter = await Visiter.getVisiterById(id)

    if (!visiter) {
      throw new NotFound('该删除项不存在')
    }

    await Visiter.destroy({
      where: {
        id
      }
    })
  }

  // 根据ip查找
  static async getVisiterByIp(ip: string) {
    const res = await Visiter.findOne({
      where: sequelize.where(
        sequelize.fn('inet_ntoa', sequelize.col('Visiter.ip')),
        ip
      )
    })

    return res
  }

  // 根据id查找
  static async getVisiterById(id: number) {
    const visiter = await Visiter.findOne({
      where: {
        id
      }
    })

    return visiter
  }
}

Visiter.init(
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
    } /* ,
    website_id: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '所访问的网站id'
    } */
  },
  {
    sequelize,
    tableName: 'visiter',
    timestamps: true,
    createdAt: 'first_time',
    updatedAt: false
  }
)

export default Visiter
