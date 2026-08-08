import Link from "next/link"
import LikeButton from "./LikeButton"
import SharedCount from "./SharedCounts"
import BookMarkButton from "./BookmarkButton"
import AddComment from "./AddComment"
import { Post } from "@/lib/interface/post"

export default function PostDetails({post}: {post: Post}){
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
                    href={`posts/${post.id}`}
                    className="ml-auto text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                    View Details →
                </Link>
            </div>
        </div>
    )
}
