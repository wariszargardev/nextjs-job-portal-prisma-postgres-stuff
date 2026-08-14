"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import LikeButton from "./LikeButton"
import SharedCount from "./SharedCounts"
import BookMarkButton from "./BookmarkButton"
import AddComment from "./AddComment"
import { Post } from "@/lib/interface/post"

export default function PostDetails({post}: {post: Post}){
    const router = useRouter()
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
                method: "DELETE"
            })

            if (!res.ok) {
                const result = await res.json()
                setDeleteError(result.error || "Failed to delete post")
                setIsDeleting(false)
                return
            }

            setShowDeleteModal(false)
            router.refresh()
        } catch {
            setDeleteError("Something went wrong. Please try again.")
            setIsDeleting(false)
        }
    }

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{post.title}</h2>
                <BookMarkButton post={post} />
            </div>
            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">{post.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <LikeButton post={post} />
                <SharedCount post={post} />
                <AddComment post={post} />
                <Link
                    href={`posts/${post.id}/edit`}
                    className="ml-auto text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                    Edit 
                </Link>
                <Link
                    href={`posts/${post.id}`}
                    className="ml-auto text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                    View Details →
                </Link>
                <button
                    onClick={openDeleteModal}
                    className="ml-auto text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                >
                    Delete
                </button>
            </div>

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
