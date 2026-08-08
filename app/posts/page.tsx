import PostDetails from "@/app/components/PostDetails"
import {prisma} from '@/lib/prisma';
import { Post } from "../../lib/interface/post"
import SearchPosts from "../components/SearchPosts";
import Link from "next/link";

export default async function Posts(){
    console.log("🔍 Fetching posts from database...")
    const posts: Post[] = await prisma.post.findMany({
        orderBy: {
            id: 'desc'
        }
    })
    console.log("✅ Posts fetched:", posts.length, "posts")

    return (
        <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
            <div className="mb-8 border-b border-neutral-100 pb-6 dark:border-neutral-800">
                <span className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Blog</span>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Post Listing</h1>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{posts.length} post{posts.length === 1 ? "" : "s"} published</p>
            </div>
            <Link
                href="posts/create"
                className="mb-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
                <span className="text-base leading-none">+</span> Create Post
            </Link>
            <SearchPosts posts={posts} />
        </div>
    )
}