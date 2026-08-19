export interface Post {
    id: number
    title: string
    description: string
    sharedCount: number
    bookMark: boolean
    commentCount: number
    createdAt: Date
    updatedAt: Date,
    user?: {
        id: string
        name: string
        email: string
    }
}