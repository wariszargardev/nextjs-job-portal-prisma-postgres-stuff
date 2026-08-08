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
        <div>
            <h1> Post listing</h1>
            {
                posts.map((post: Post) => (
                    <PostDetails key={post.id} post={post} />
                ))
            }
        </div>
    )
}