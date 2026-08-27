import { Comment } from "@/lib/interface/comment"

export interface Post {
    id: number
    title: string
    description: string
    sharedCount: number
    bookMark: boolean
    commentCount: number
    createdAt: Date
    updatedAt: Date
    user?: {
        id: number
        name: string
        email: string
    }
    comments?: Comment[]
    _count?: {
        comments: number
    }
}