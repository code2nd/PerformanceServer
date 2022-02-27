import {
  ProjectCategoryCreate,
  ProjectCategoryUpdate,
  ProjectCategoryDelete
} from '../validators'

class ExceptionCategoryCreate extends ProjectCategoryCreate {
  constructor(category_name: string) {
    super(category_name)
  }
}

// class ProjectCategoryRetrieve extends Validator  {}

class ExceptionCategoryUpdate extends ProjectCategoryUpdate {
  constructor(category: string, category_name: string) {
    super(category, category_name)
  }
}

class ExceptionCategoryDelete extends ProjectCategoryDelete {
  constructor(category: string) {
    super(category)
  }
}

export {
  ExceptionCategoryCreate,
  ExceptionCategoryUpdate,
  ExceptionCategoryDelete
}
