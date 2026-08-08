import {prisma} from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const GET = async () => {
    const posts = await prisma.post.findMany()
    return Response.json({
        data: {
            posts
        }
    })
}

export const POST = async () => {
    const post = await prisma.post.create({
        data: {
            title: "ABC",
            description: "ACCCCC"
        }
    })
    revalidatePath('/posts')  // Refresh cache NOW
    return Response.json({ data: { post } })
}