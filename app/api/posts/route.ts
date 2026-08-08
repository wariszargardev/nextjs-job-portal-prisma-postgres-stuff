import {prisma} from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export const GET = async () => {
    const posts = await prisma.post.findMany()
    return Response.json({
        data: {
            posts
        }
    })
}

export const POST = async (req: NextRequest) => {
    try {
        const formData = await req.formData() 
        const title = formData.get('title') as string
        const description = formData.get('description') as string

        if (!title || !description){
            return Response.json({ error: "Title and description required" },{ status: 400 })
        }

        const post = await prisma.post.create({
            data: {
                title: title,
                description: description
            }
        })
        revalidatePath('/posts')  // Refresh cache NOW
        return Response.json({ data: { post } })
    } catch(e) {
        return Response.json(
            { error: "Failed to create post" },
            { status: 500 }
        )
    }
}