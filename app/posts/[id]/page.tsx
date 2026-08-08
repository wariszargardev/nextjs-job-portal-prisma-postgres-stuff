import { posts } from "@/lib/post"
import Link from "next/link"
import { notFound } from "next/navigation";

export default async function PostInfo({
    params,
  }: {
    params: Promise<{ id: string }>;
  }){
    await new Promise((r) => setTimeout(r, 1000))
    const {id} = await params
    const post = posts.find((p) => p.id === parseInt(id));
    if(!post){
        return notFound()
    }
    return (
        <div>
            <h1> Post info</h1>
            <div key={post.id} className="mt-4 mb-4">
                <h1>{post.title}</h1>
                <p>{post.description}</p>
                <hr/>
            </div>
        </div>
    )
}