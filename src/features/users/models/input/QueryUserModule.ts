export type QueryUserModel = {
    /**
     * This title should be included in Title of found Blogs
     */
    searchLoginTerm?: string
    searchEmailTerm?: string
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
    pageNumber?: number
    pageSize?: number
}
