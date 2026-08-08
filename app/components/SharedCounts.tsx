"use client"

import { useState } from "react";
import { Post } from "@/lib/interface/post";

export default function SharedCount({post}: {post: Post}){
    const [sharedCounts, setSharedCounts] = useState(post.sharedCount)
    const sharedPost = () => {
        alert(`Shared post: ${post.id}`)
        setSharedCounts(sharedCounts + 1)
    }
    return(
        <button
            onClick={sharedPost}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
            🔁 Share ({sharedCounts})
        </button>
    )
}
