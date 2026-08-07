"use client"
import { Post } from "@/app/lib/interface/post";
import { useState } from "react";

export default function BookMarkButton({post}: {post: Post}){
    const [bookMark, setBookmark] = useState(post.bookMark)
    const [bookMarkMsg, setBookmarkMsg] = useState('')
    const updateBookMark = () => {
        setBookmark(!bookMark)
        setBookmarkMsg(bookMark ? "Remove Bookmarked!": "Bookmarked!" )
        setTimeout(() => {
            setBookmarkMsg("")
        }, 2000)
    }
    return (
        <div>
            {bookMarkMsg && <p>{bookMarkMsg}</p>}
            <button onClick={updateBookMark}> {bookMark ? '⭐' : '☆'} </button>
        </div>
    )
}