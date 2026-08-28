"use client"

import { useState } from "react"
import { Comment } from "@/lib/interface/comment"
import CommentForm from "@/app/components/comments/Form"

function initials(name?: string) {
    if (!name) return "?"
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
}

function timeAgo(date: Date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

    const ranges: [number, string][] = [
        [60, "just now"],
        [3600, "m"],
        [86400, "h"],
        [604800, "d"],
        [2629800, "w"],
        [31557600, "mo"],
    ]

    if (seconds < 60) return ranges[0][1]
    if (seconds < 3600) return `${Math.floor(seconds / 60)}${ranges[1][1]} ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}${ranges[2][1]} ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}${ranges[3][1]} ago`
    if (seconds < 2629800) return `${Math.floor(seconds / 604800)}${ranges[4][1]} ago`
    if (seconds < 31557600) return `${Math.floor(seconds / 2629800)}${ranges[5][1]} ago`
    return `${Math.floor(seconds / 31557600)}y ago`
}

export default function CommentsListing({
    comments,
    onCommentUpdated,
    onCommentDeleted
}: {
    comments: Comment[]
    onCommentUpdated?: (comment: Comment) => void
    onCommentDeleted?: (commentId: number) => void
}) {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [deleteError, setDeleteError] = useState<{ id: number; message: string } | null>(null)

    const deleteComment = async (commentId: number) => {
        if (!window.confirm("Delete this comment?")) return

        setDeletingId(commentId)
        setDeleteError(null)

        try {
            const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" })
            if (!res.ok) {
                const result = await res.json()
                setDeleteError({ id: commentId, message: result.error || "Failed to delete comment" })
                return
            }
            onCommentDeleted?.(commentId)
        } catch {
            setDeleteError({ id: commentId, message: "Something went wrong. Please try again." })
        } finally {
            setDeletingId(null)
        }
    }

    if (comments.length === 0) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-10 text-center dark:border-neutral-800">
                <span className="text-2xl">🗨️</span>
                <p className="mt-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    No comments yet
                </p>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    Be the first to share your thoughts.
                </p>
            </div>
        )
    }

    return (
        <div className="mt-6 flex flex-col gap-3">
            {comments.map((comment) => (
                <div
                    key={comment.id}
                    className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white ring-2 ring-blue-50 dark:ring-blue-950">
                        {initials(comment.user?.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {comment.user?.name || "Unknown user"}
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                    {timeAgo(comment.createdAt)}
                                </p>
                                {editingId !== comment.id && (
                                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                                        <button
                                            type="button"
                                            aria-label="Edit comment"
                                            onClick={() => setEditingId(comment.id)}
                                            className="rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-blue-600 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                                <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a2 2 0 0 1-.878.507l-3.03.867a.5.5 0 0 1-.618-.618l.867-3.03a2 2 0 0 1 .507-.878l8.5-8.5-.001.001Zm1.414 1.414L14 4l-8.5 8.5-.433 1.517L6.583 13.5 15 5.086v-.086Z" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Delete comment"
                                            disabled={deletingId === comment.id}
                                            onClick={() => deleteComment(comment.id)}
                                            className="rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-red-400"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.25H3.5a.75.75 0 0 0 0 1.5h.573l.746 9.685A3 3 0 0 0 7.812 18h4.376a3 3 0 0 0 2.993-2.815l.746-9.685h.573a.75.75 0 0 0 0-1.5H14v-.25A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4h2.5v-.25a1.25 1.25 0 0 0-1.25-1.25h-2.5a1.25 1.25 0 0 0-1.25 1.25V4H10Zm-2 3.25a.75.75 0 0 1 1.5 0v6.5a.75.75 0 0 1-1.5 0v-6.5Zm4.5 0a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0v-6.5Z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {editingId === comment.id ? (
                            <div className="mt-1.5">
                                <CommentForm
                                    comment={comment}
                                    startOpen
                                    onCancel={() => setEditingId(null)}
                                    onComment={(updated) => {
                                        onCommentUpdated?.(updated)
                                        setEditingId(null)
                                    }}
                                />
                            </div>
                        ) : (
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                {comment.content}
                            </p>
                        )}
                        {deleteError?.id === comment.id && (
                            <p className="mt-1.5 text-xs text-red-500">{deleteError.message}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
