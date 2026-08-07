import { posts } from "@/app/lib/post"
import Link from "next/link"
import LikeButton from "../componennts/LikeButton"
import SharedCount from "../componennts/SharedCounts"

export default async function Posts(){
    await new Promise((r) => setTimeout(r, 1000))

    return (
        <div>
            <h1> Post listing</h1>
            {
                posts.map((post) => (
                    <div key={post.id} className="mt-4 mb-4">
                        <h1>{post.title}</h1>
                        <p>{post.description}</p>
                        <p>Post count Real Solution (Phase 5: Server Actions)  {post.sharedCount}</p>
                        <Link href={`posts/${post.id}`} className="cursor-pointer">View Details</Link>
                        <LikeButton post={post} />
                        <SharedCount post={post} />
                        <hr/>
                    </div>
                ))
            }
        </div>
    )
}