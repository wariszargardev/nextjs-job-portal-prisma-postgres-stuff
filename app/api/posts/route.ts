import {prisma} from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  try {
    // Get search term from query parameter
    const searchTerm = req.nextUrl.searchParams.get('q') || ''
    
    // If no search term, return all posts
    if (!searchTerm || searchTerm.length < 3 || searchTerm.length > 50) {
      const posts = await prisma.post.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ posts })
    }
    
    // Search in database using LIKE (case-insensitive)
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive' // Case-insensitive search
            }
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    )
  }
}

export const POST = async (req: NextRequest) => {
    try {
      const user = await prisma.user.findFirst()
      const formData = await req.formData() 
      const title = formData.get('title') as string
      const description = formData.get('description') as string

      if (!title || !description){
          return Response.json({ error: "Title and description required" },{ status: 400 })
      }

      const post = await prisma.post.create({
          data: {
              title: title,
              description: description,
              userId: user?.id || ""
            },
          include: {
            user: true // Include user data in response
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