"use client"
import { useState } from "react"

export default function LikeButton({post}: any){
    const [liked, setLiked] = useState(false)
    return (
        <div>
            <button onClick={() => setLiked(!liked)}> 
                {liked ? "❤️ Liked " : "🤍 Like "}
                {post.title}
            </button>
        </div>
    )
}