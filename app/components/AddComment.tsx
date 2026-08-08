"use client"

import { useState } from "react";
import { Post } from "@/lib/interface/post";

export default function AddComment({post}: {post: Post}){
    const [commentCount, setCommentCount] = useState(post.commentCount)
    return(
        <div>
            <p>💬 Comments ({commentCount})</p>
            <button onClick={() => setCommentCount(commentCount + 1)}> Add comment  </button>
        </div>
    )
}