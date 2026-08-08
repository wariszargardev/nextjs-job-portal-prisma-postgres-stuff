import PostDetails from "../components/PostDetails"
import {prisma} from '@/lib/prisma';
import { Post } from "../../lib/interface/post"

// Cache for 120 seconds, then refresh
export const revalidate = 120

export default async function Posts(){
    console.log("🔄 Revalidate after 2 minutes")
    const posts: Post[] = await prisma.post.findMany()
    console.log("✅ Posts fetched:", posts.length, "posts")

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Post Listing</h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{posts.length} post{posts.length === 1 ? "" : "s"} · revalidates every 2 min</p>
            </div>
            <div className="flex flex-col gap-4">
                {
                    posts.map((post: Post) => (
                        <PostDetails key={post.id} post={post} />
                    ))
                }
            </div>
        </div>
    )
}