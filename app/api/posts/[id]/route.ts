import {prisma} from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export const PUT = async (req: NextRequest,  { params }: { params: Promise<{ id: string }> }) => {
    const {id} = await params
    try {
        const formData = await req.formData()
        const title = formData.get('title') as string
        const description = formData.get('description') as string

        if (!title || !description){
            return Response.json({ error: "Title and description required" },{ status: 400 })
        }

        const post = await prisma.post.update({
            where: {
                id: parseInt(id)
            },
            data: {
                title: title,
                description: description
            }
        })
        revalidatePath(`/posts/`)  // Refresh cache NOW
        return Response.json({ data: { post } })
    } catch(e) {
        return Response.json(
            { error: "Failed to update post" },
            { status: 500 }
        )
    }
}