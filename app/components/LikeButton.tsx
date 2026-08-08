"use client"
import { useState } from "react"

export default function LikeButton({post}: any){
    const [liked, setLiked] = useState(false)
    return (
        <button
            onClick={() => setLiked(!liked)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition ${
                liked
                    ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
        >
            {liked ? "❤️ Liked" : "🤍 Like"}
        </button>
    )
}
