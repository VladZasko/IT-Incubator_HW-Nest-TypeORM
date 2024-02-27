
export type UsersAuthViewModel = {
    id: string,
    login: string,
    email: string,
    createdAt: string
}

export type UsersAuthViewModelGetAllBlogs = {
    pagesCount: number
    page: number,
    pageSize: number
    totalCount: number
    items: UsersAuthViewModel[]
}

