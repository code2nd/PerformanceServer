// user
export interface IAccount {
  username: string
  password: string
}

export interface IRegistor extends IAccount {
  role: number | null
}

export interface IChangePassword {
  user_id: number
  password: string
}

export interface IUserListQueryInfo {
  page: number
  pageSize: number
  role?: number
  username?: string
  create_time?: string
}

export interface IUpdateUserInfo {
  id: number
  role?: number
  username?: string
  password?: string
}

// project
// 获取项目列表 -- 查询
export interface IProjectRetrieve {
  page: number
  pageSize: number
  category?: number
  project?: string
  create_time?: string
}

// 新增项目
export interface IProjectCreate {
  project_name: string
  website: string
  category: number
}

// 修改项目
export interface IProjectUpdate extends IProjectCreate {
  id: string
}

// 项目分类
// 查找
// export interface IProjectCategoryRetrieve {}

// 新增
export interface IProjectCategoryAdd {
  category_name: string
}

// 删除
export interface IProjectCategoryDelete {
  category: number
}

// 修改
export interface IProjectCategoryUpdate
  extends IProjectCategoryAdd,
    IProjectCategoryDelete {}

// 访客 visitor
// 新增
export interface IVisitorCreate {
  ip: string
}

// 查询
export interface IVisitorRetrieve {
  ip?: string
  dateTime?: string
}

// 修改 -- 不允许修改

// 页面访问
// 新增
export interface IPageVisitCreate {
  visitor: string
  website: string
  path: string
  cost: number
}

// 查询
export interface IPageVisitRetrieve {
  page: number
  pageSize: number
  visitor?: string
  website?: string
  visit_time?: string
}

// 资源访问
// 新增
export interface ISourceVisitCreate {
  visitor: string
  website: string
  sourceName: string
  size: number
  cost: number
}

// 查找
export interface ISourceVisitRetrieve {
  visitor?: number
  website?: number
  size?: string
  cost?: string
}

// 接口访问表
// 新增
export interface IInterfaceVisitCreate {
  visitor: string
  website: string
  interfaceName: string
  size: number
  cost: number
  reqId?: string
}

// 查找
export interface IInterfaceVisitRetrieve {
  page: number
  pageSize: number
  visitor?: string
  website?: string
  interfaceName?: string
  create_time?: string
}

// 异常表
// 新增
export interface IExceptionCreate {
  visitor: string
  website: string
  category: number
  content: string
}

// 查找
export interface IExceptionRetrieve {
  page: number
  pageSize: number
  project?: string
  category?: number
  content?: string
  occurred_time?: string
}

// 性能指标表(performance)
// 新增
export interface IPerformances {
  project: string
  visitor: string
  domInteractive: number
  parseDomTime: number
  lookupDomainTime: number
  connectTime: number
  requestTime: number
  requestDocumentTime: number
  responseDocumentTime: number
  TTFB: number
  FP: number
  FCP: number
  domContentLoaded: number
  load: number
}

// 菜单角色
export interface IRoleInfo {
  name: string
  auth_level: number
  menuList: string
  description?: string
}

export interface IRoleInfoWithMenu extends IRoleInfo {
  id: number
}
