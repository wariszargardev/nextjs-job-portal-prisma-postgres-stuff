import { posts } from "@/app/lib/post"
import Link from "next/link"

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
                        <Link href={`posts/${post.id}`} className="cursor-pointer">View Details</Link>
                        <hr/>
                    </div>
                ))
            }
        </div>
    )
}