import { User } from '../models'
import { Router } from '../../types'

import {
  RegisterValidator,
  LoginValidator,
  ChangePasswordValidator,
  GetUserInfo,
  GetUserList,
  UserRetrieve
} from '../validators'
import { success } from '../../utils/success'
import Token from '../../core/token'
import Auth from '../../middlewares/auth'

function userRouter(router: Router) {
  const prefix = '/user'

  // 注册用户 账号/密码
  router.post(prefix, async (ctx) => {
    const v = new RegisterValidator(
      'username',
      'role',
      'password1',
      'password2'
    ).validate(ctx)
    const username = v.get('body.username')
    const role = v.get('body.role')
    const password1 = v.get('body.password1')

    await User.registerByUsername({ username, role, password: password1 })
    success()
  })

  // 登录
  router.post('/login', async (ctx) => {
    const v = new LoginValidator('username', 'password').validate(ctx)
    const username = v.get('body.username')
    const password = v.get('body.password')

    const res = await User.loginByUsername({ username, password })
    // const avatar = res.getDataValue('avatar')
    const id = res.getDataValue('user_id')
    const authLevel = res.getDataValue('auth_level')
    const token = Token.sign(id, authLevel)

    // todo 登录成功开启 websocket 连接

    ctx.body = {
      id,
      username,
      token
    }
  })

  // 退出登录
  // 使用token，后端是无状态的，前端将本地存储的token删除掉即可

  // 修改密码
  router.patch(prefix + '/:id', new Auth().v, async (ctx) => {
    const v = new ChangePasswordValidator('password1', 'password2').validate(
      ctx
    )
    const password = v.get('query.password1')
    const { userId: user_id } = ctx.auth

    await User.changePassword({ user_id, password })

    success()
  })

  // 获取用户列表
  router.get(prefix, new Auth().v, async (ctx) => {
    const v = new GetUserList(
      'role',
      'username',
      'create_time',
      'page',
      'pageSize'
    ).validate(ctx)
    const role = v.get('query.role')
    const username = v.get('query.username')
    const create_time = v.get('query.create_time')
    const page = v.get('query.page')
    const pageSize = v.get('query.pageSize')

    const res = await User.getUserList({
      role,
      username,
      create_time,
      page,
      pageSize
    })

    ctx.body = res
  })

  // 获取用户信息
  router.get(prefix + '/:id', new Auth().v, async (ctx) => {
    const v = new GetUserInfo('id').validate(ctx)

    const userId = v.get('path.id')
    const userInfo = await User.getUserByUserInfoId(userId)

    ctx.body = userInfo
  })

  // 修改用户信息
  router.put(prefix + '/:id', new Auth().v, async (ctx) => {
    const v = new UserRetrieve(
      'id',
      'username',
      'role',
      'password1',
      'password2'
    ).validate(ctx)
    const id = v.get('path.id')
    const username = v.get('body.username')
    const role = v.get('body.role')
    const password1 = v.get('body.password1')
    // const password2 = v.get('body.password2')

    await User.UpdateUserInfo({ id, username, role, password: password1 })

    success()
  })
}

export default userRouter
