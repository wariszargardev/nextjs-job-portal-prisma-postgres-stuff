import PostDetails from "@/app/components/PostDetails"
import {prisma} from '@/lib/prisma';
import { Post } from "../../lib/interface/post"

export default async function Posts(){
    console.log("🔍 Fetching posts from database...")
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