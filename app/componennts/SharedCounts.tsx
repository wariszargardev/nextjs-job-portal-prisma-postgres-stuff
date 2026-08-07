"use client"

import { useState } from "react";

interface Post {
    id: number,
    title: string
    description: string
    sharedCount: number
}

export default function SharedCount({post}: {post: Post}){
    const [sharedCounts, setSharedCounts] = useState(post.sharedCount)
    const sharedPost = () => {
        alert(`Shared post: ${post.id}`)
        setSharedCounts(sharedCounts + 1)
    }
    return(
        <div>
            <h1>Post Shared Count - {sharedCounts}</h1>
            <button onClick={sharedPost}>Post shared </button>
        </div>
    )
}