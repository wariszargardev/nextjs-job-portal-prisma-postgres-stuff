import Link from "next/link";
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
        <div className="mx-auto max-w-2xl px-4 py-10">
            <Link
                href="/posts"
                className="mb-6 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
                ← Back to listing
            </Link>
            <PostDetails post={post} />
        </div>
    )
}