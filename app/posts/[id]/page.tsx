import PostDetails from "@/app/components/PostDetails";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PostInfo({
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
    if(!post){
        return notFound()
    }
    return (
        <div>
            <PostDetails post={post} />
        </div>
    )
}