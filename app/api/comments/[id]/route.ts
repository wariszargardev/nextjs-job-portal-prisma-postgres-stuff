import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export const PUT = async (req: NextRequest,  { params }: { params: Promise<{ id: string }> }) => {
    const {id} = await params
    try {
        const formData = await req.formData()
        const content = formData.get('content') as string
        if (!content){
            return Response.json({ error: "Content required" },{ status: 400 })
        }
        const comment = await prisma.comment.update({
            where: { id: parseInt(id) },
            data: { content },
            include: { user: true }
        })
        return Response.json({ data: { comment } })
    } catch(e) {
        return Response.json(
            { error: "Failed to update comment" },
            { status: 500 }
        )
    }
}

export const DELETE = async (req: NextRequest,  { params }: { params: Promise<{ id: string }> }) => {
    const {id} = await params
    try {
        const comment = await prisma.comment.delete({
            where: { id: parseInt(id) }
        })
        return Response.json({ data: { comment } })
    } catch(e) {
        return Response.json(
            { error: "Failed to delete comment" },
            { status: 500 }
        )
    }
}