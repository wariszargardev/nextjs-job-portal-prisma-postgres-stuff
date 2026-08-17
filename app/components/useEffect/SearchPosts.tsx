"use client"
import { useState, useEffect } from 'react'
import {Post} from '@/lib/interface/post'
import PostDetails from '../PostDetails'
export default function SearchPosts () {
    const [searchTerm, setSearchTerm] = useState('')
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!searchTerm) {
            setPosts([]) // Clear posts if search term is empty
            setError(null)
        }
        if (searchTerm && (searchTerm.length < 3 || searchTerm.length > 50)) {
            setError('Search term must be between 3 and 50 characters')
        }
         // Simulate an API call to fetch posts based on the search term
        const fetchPosts = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/posts?q=${encodeURIComponent(searchTerm)}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch posts')
                }
                const data = await response.json()
                console.log('Fetched posts:', data.posts) // Log the fetched data for debugging
                setPosts(data.posts)
            } catch (err) {
                setError('Failed to fetch posts')
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [searchTerm])
    return (
        <div className="mb-6">
            <div className="relative">
                <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.11 6.11a7.5 7.5 0 0 0 10.54 10.54z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search posts..."
                    className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Searching...
                </div>
            ) : error ? (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{error}</p>
            ) : posts.length > 0 ? (
                <ul className="mt-4 space-y-3">
                    {posts.map((post) => (
                       <li key={post.id}>
                           <PostDetails post={post} />
                       </li>
                    ))}
                </ul>
            ) : searchTerm ? (
                <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">No posts found for &quot;{searchTerm}&quot;.</p>
            ) : null}
        </div>
    )
}