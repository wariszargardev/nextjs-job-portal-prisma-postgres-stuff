"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import LikeButton from "./LikeButton"
import SharedCount from "./SharedCounts"
import BookMarkButton from "./BookmarkButton"
import AddComment from "./AddComment"
import CommentsListing from "./comments/lisiting"
import { Post } from "@/lib/interface/post"
import { Comment } from "@/lib/interface/comment"

function initials(name?: string) {
    if (!name) return "?"
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
}

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

export default function PostDetailView({ post }: { post: Post }) {
    const router = useRouter()
    const [comments, setComments] = useState<Comment[]>(post.comments ?? [])
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState("")

    const openDeleteModal = () => {
        setShowDeleteModal(true)
        setIsDeleting(false)
        setDeleteError("")
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        setDeleteError("")

        try {
            const res = await fetch(`/api/posts/${post.id}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                const result = await res.json()
                setDeleteError(result.error || "Failed to delete post")
                setIsDeleting(false)
                return
            }

            router.push("/posts")
            router.refresh()
        } catch {
            setDeleteError("Something went wrong. Please try again.")
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="h-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                <div className="p-6 sm:p-9">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-semibold text-white shadow-sm ring-4 ring-blue-50 dark:ring-blue-950">
                                {initials(post.user?.name)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                    {post.user?.name || "Unknown author"}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {formatDate(post.createdAt)}
                                    {post.updatedAt && post.updatedAt !== post.createdAt && (
                                        <span className="italic"> · edited {formatDate(post.updatedAt)}</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <BookMarkButton post={post} />
                    </div>

                    <h1 className="mt-7 text-2xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
                        {post.title}
                    </h1>
                    <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
                        {post.description}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-5 dark:border-neutral-800">
                        <LikeButton post={post} />
                        <SharedCount post={post} />
                        <div className="ml-auto flex items-center gap-4">
                            <Link
                                href={`/posts/${post.id}/edit`}
                                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={openDeleteModal}
                                className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-9 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        💬 Comments
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                            {comments.length}
                        </span>
                    </h2>
                    <AddComment
                        post={post}
                        onCommentAdded={(comment) => setComments((prev) => [comment, ...prev])}
                    />
                </div>

                <CommentsListing
                    comments={comments}
                    onCommentUpdated={(updated) =>
                        setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
                    }
                    onCommentDeleted={(commentId) =>
                        setComments((prev) => prev.filter((c) => c.id !== commentId))
                    }
                />
            </section>

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Delete post?</h3>
                        <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                            Are you sure you want to delete &quot;{post.title}&quot;? This action cannot be undone.
                        </p>

                        {deleteError && (
                            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                                {deleteError}
                            </p>
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setDeleteError("")
                                }}
                                disabled={isDeleting}
                                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
