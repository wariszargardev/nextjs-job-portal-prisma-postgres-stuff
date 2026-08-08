"use client"

import { useState } from "react";
import { Post } from "@/lib/interface/post";

export default function AddComment({post}: {post: Post}){
    const [commentCount, setCommentCount] = useState(post.commentCount)
    return(
        <button
            onClick={() => setCommentCount(commentCount + 1)}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
            💬 Comments ({commentCount})
        </button>
    )
}
