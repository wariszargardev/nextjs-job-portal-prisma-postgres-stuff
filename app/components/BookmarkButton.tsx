"use client"
import { Post } from "@/lib/interface/post";
import { useState } from "react";

export default function BookMarkButton({post}: {post: Post}){
    const [bookMark, setBookmark] = useState(post.bookMark)
    const [bookMarkMsg, setBookmarkMsg] = useState('')
    const updateBookMark = () => {
        setBookmark(!bookMark)
        setBookmarkMsg(bookMark ? "Removed bookmark" : "Bookmarked!" )
        setTimeout(() => {
            setBookmarkMsg("")
        }, 2000)
    }
    return (
        <div className="relative shrink-0">
            <button
                onClick={updateBookMark}
                aria-label={bookMark ? "Remove bookmark" : "Add bookmark"}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-amber-500 transition hover:bg-amber-50 dark:hover:bg-amber-950"
            >
                {bookMark ? '⭐' : '☆'}
            </button>
            {bookMarkMsg && (
                <span className="absolute right-0 top-9 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-white shadow dark:bg-neutral-100 dark:text-neutral-900">
                    {bookMarkMsg}
                </span>
            )}
        </div>
    )
}
