'use client'
import SearchPosts from '@/app/components/useEffect/SearchPosts'
import Link from 'next/link'

export default function Posts() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="border-b border-neutral-100 pb-6 dark:border-neutral-800">
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Post Listing
        </h1>
      </div>
      <SearchPosts />
    </div>
  )
}