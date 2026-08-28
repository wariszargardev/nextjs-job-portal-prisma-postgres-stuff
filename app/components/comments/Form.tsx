"use client"

import { useState } from "react";
import { Post } from "@/lib/interface/post";
import { Comment } from "@/lib/interface/comment";

export default function CommentForm({
    post,
    onComment,
    comment,
    startOpen,
    onCancel
}: {
    post?: Post
    onComment: (comment: Comment) => void
    comment?: Comment
    startOpen?: boolean
    onCancel?: () => void
}) {
    const [isOpen, setIsOpen] = useState(startOpen ?? false)
    const [content, setContent] = useState(comment?.content || "")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const isEditing = !!comment

    const cancel = () => {
        setIsOpen(false)
        setContent(comment?.content || "")
        setError("")
        onCancel?.()
    }

    const submitComment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        setError("")

        try {
            const formData = new FormData()
            if (post && !isEditing) {
                formData.set("postId", String(post.id))
            }
            formData.set("content", content.trim())

            const url = isEditing && comment ? `/api/comments/${comment.id}` : "/api/comments"
            const res = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                body: formData,
            })
            const result = await res.json()

            if (!res.ok) {
                setError(result.error || "Failed to add comment")
                setIsSubmitting(false)
                return
            }

            setContent("")
            setIsOpen(false)
            onComment(result.data.comment)
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
                { isEditing ? "✏️ Edit comment" : "✏️ Add comment" }
            </button>
        )
    }

    return (
        <form onSubmit={submitComment} className="w-full sm:w-auto sm:min-w-[300px]">
            <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={2}
                disabled={isSubmitting}
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:ring-blue-950"
            />
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            <div className="mt-2 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={cancel}
                    disabled={isSubmitting}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? "Posting..." : isEditing ? "Update" : "Post"}
                </button>
            </div>
        </form>
    )
}
