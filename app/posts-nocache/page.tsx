import PostDetails from "../components/PostDetails"
import {prisma} from '@/lib/prisma';
import { Post } from "../../lib/interface/post"

// Fetching posts from database 
export const dynamic = 'force-dynamic'  // Never cache this page

export default async function Posts(){
    console.log("🔄 [NO-CACHE] Fetching posts from database...")
    const posts: Post[] = await prisma.post.findMany()
    console.log("✅ Posts fetched:", posts.length, "posts")

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Post Listing</h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{posts.length} post{posts.length === 1 ? "" : "s"} · no cache</p>
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