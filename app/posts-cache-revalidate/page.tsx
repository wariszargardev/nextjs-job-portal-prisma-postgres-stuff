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