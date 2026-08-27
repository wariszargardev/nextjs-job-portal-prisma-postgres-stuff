import Link from "next/link";
import PostDetailView from "@/app/components/PostDetailView";
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
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    })
    if(!post){
        return notFound()
    }
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <div className="mx-auto max-w-2xl px-4 py-10">
                <Link
                    href="/posts"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                    <span aria-hidden>←</span> Back to listing
                </Link>
                <PostDetailView post={post} />
            </div>
        </div>
    )
}