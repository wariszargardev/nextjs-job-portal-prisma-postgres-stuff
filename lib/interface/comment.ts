export interface Comment {
    id: number,
    content: string,
    createdAt: Date,
    user?: {
        id: number
        name: string
        email: string
    }
}