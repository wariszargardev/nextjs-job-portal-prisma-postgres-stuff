import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
      const user = await prisma.user.findFirst()
      const formData = await req.formData()
      const postId = formData.get('postId') as string
      const content = formData.get('content') as string

      if (!postId || !content || !user){
          return Response.json({ error: "Post ID and content required" },{ status: 400 })
      }

      const comment = await prisma.comment.create({
          data: {
              postId: parseInt(postId),
              content: content,
              userId: user.id
            },
          include: {
            user: true,
          }
        })
        return Response.json({ data: { comment } })
    } catch(e) {
        return Response.json(
            { error: "Failed to create comment" },
            { status: 500 }
        )
    }
}