"use client"

import CommentForm from "@/app/components/comments/Form"
import { Post } from "@/lib/interface/post"
import { Comment } from "@/lib/interface/comment"

export default function AddComment({
    post,
    onCommentAdded
}: {
    post: Post
    onCommentAdded: (comment: Comment) => void
}) {
    return (
        <>
            <CommentForm post={post} onComment={onCommentAdded} /> 
        </>
    )
}
