"use client"
import { Post } from "@/lib/interface/post"
import React, { useState, useEffect } from "react"
import PostDetails from "@/app/components/PostDetails"
export default function SearchPosts ({posts}: {posts: Post[]}) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterPosts, setFilterPosts] = useState(posts)
    const [errorMessage, setErrormessage] = useState('')

    useEffect(() => {
        setFilterPosts(posts)
    }, [posts])
    
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value
        setSearchTerm(searchValue)
        setErrormessage(getValidationMessage(searchValue))
        setFilterPosts(getFilterPosts(searchValue))
    }

    const getValidationMessage = (value: string) => {
        if (!value) return ""
        if (value.length < 2) return "Type at least 2 characters"
        if (value.length > 50) return "Search term too long (max 50)"
        return ""
    }

    const getFilterPosts = (value: string) => {
        if (!value) return posts
        if (value.length < 2 || value.length > 50) return []
        return posts.filter((post) => post.title.toLowerCase().includes(value.toLowerCase()))
    }

    const clearSearch = () => {
        setSearchTerm("")
        setErrormessage("")
        setFilterPosts(posts)
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400 dark:text-neutral-500">
                        🔍
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search posts by title..."
                        className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-9 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-blue-950"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            aria-label="Clear search"
                            className="absolute inset-y-0 right-3 flex items-center text-neutral-400 transition hover:text-neutral-600 dark:hover:text-neutral-200"
                        >
                            ✕
                        </button>
                    )}
                </div>
                {searchTerm && (
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        Showing {filterPosts.length} of {posts.length} posts
                    </p>
                )}
            </div>

            {
                errorMessage ? <p>{errorMessage}</p> :
                filterPosts.length > 0 ? <>
                    {filterPosts.map((post: Post) => (
                        <PostDetails key={post.id} post={post} />
                    ))}
                </> :
                <div className="rounded-xl border border-dashed border-neutral-200 py-10 text-center dark:border-neutral-800">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">No posts found{searchTerm && <> for &ldquo;{searchTerm}&rdquo;</>}.</p>
                </div>
            }
        </div>
    )
}