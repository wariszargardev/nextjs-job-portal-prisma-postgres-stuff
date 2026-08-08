import Link from "next/link"
import LikeButton from "../components/LikeButton"
import SharedCount from "../components/SharedCounts"
import BookMarkButton from "../components/BookmarkButton"
import AddComment from "../components/AddComment"
import {prisma} from '@/lib/prisma';
import { Post } from "../lib/interface/post"

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
                    <div key={post.id} className="mt-4 mb-4">
                        <h1>{post.title}</h1>
                        <p>{post.description}</p>
                        <p>Shared Count: {post.sharedCount}</p>
                        <Link href={`posts/${post.id}`} className="cursor-pointer">View Details</Link>
                        <LikeButton post={post} />
                        <SharedCount post={post} />
                        <BookMarkButton post={post} />
                        <AddComment  post={post}/>
                        <hr/>
                    </div>
                ))
            }
        </div>
    )
}