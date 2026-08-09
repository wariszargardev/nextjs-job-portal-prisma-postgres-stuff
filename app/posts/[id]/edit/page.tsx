import PostForm from "@/app/components/posts/Form";
import { Post } from "@/lib/interface/post"
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditPost({
    params,
  }: {
    params: Promise<{ id: string }>;
  }){
    const {id} = await params
    const post = await prisma.post.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if(!post) {
        notFound()
    }

    return (
        <div>
            <PostForm post={post} />    
        </div>
    )
}
