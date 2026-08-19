# Phase 6: Database Relationships - Complete Guide 🗄️

## Table of Contents
1. What are Relationships?
2. One-to-Many Pattern
3. Update Prisma Schema
4. Create & Run Migration
5. Task 1: Add User to Posts
6. Task 2: Comments Feature
7. Task 3: Filter by User
8. Task 4: Authorization (Edit Own Posts)
9. Common Patterns

---

## 1. What are Relationships? 🔗

**Relationships** connect data between tables in your database.

### Real-world Example:

```
User Table
┌─────────────────┐
│ id   │ name     │
├──────┼──────────┤
│ 1    │ Muhammad │
│ 2    │ Ali      │
└─────────────────┘
        ↑ (owns)
        │
Post Table
┌──────────────────────┐
│ id │ title │ user_id │
├────┼───────┼─────────┤
│ 1  │ Post1 │ 1       │  ← Muhammad's post
│ 2  │ Post2 │ 1       │  ← Muhammad's post
│ 3  │ Post3 │ 2       │  ← Ali's post
└──────────────────────┘
```

**Types of Relationships:**

| Type | Meaning | Example |
|------|---------|---------|
| **One-to-Many** | One user has many posts | User → Posts |
| **Many-to-Many** | Many users can like many posts | Users ↔ Likes |
| **One-to-One** | One user has one profile | User → Profile |

---

## 2. One-to-Many Pattern 📊

**One user can have many posts.**

### The relationship works like this:

```
User (1) ──────── (Many) Posts
  │                    │
  ├─ id: 1            ├─ id: 1, userId: 1
  ├─ id: 2            ├─ id: 2, userId: 1
                      ├─ id: 3, userId: 2
                      └─ id: 4, userId: 2
```

**In database terms:**
- User table has primary key `id`
- Post table has foreign key `userId` that references User `id`
- Foreign key ensures data integrity (can't have post with non-existent user)

---

## 3. Update Prisma Schema 📝

### Current Schema (Before):

```prisma
model Post {
  id          Int     @id @default(autoincrement())
  title       String
  description String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### New Schema (After):

**File: `prisma/schema.prisma`**

```prisma
// User model (NEW)
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String
  posts Post[]  // User has many posts (relationship)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Post model (UPDATED)
model Post {
  id          Int     @id @default(autoincrement())
  title       String
  description String
  
  // Foreign key - connects to User
  userId      Int
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Comment model (NEW - for later)
model Comment {
  id        Int     @id @default(autoincrement())
  text      String
  
  // Foreign keys
  postId    Int
  post      Post    @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  userId    Int
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**What this means:**

| Line | Meaning |
|------|---------|
| `userId Int` | Post has a userId column |
| `user User @relation(...)` | Post belongs to a User |
| `fields: [userId]` | Which column is the foreign key |
| `references: [id]` | References User's id |
| `onDelete: Cascade` | If user deleted, delete their posts too |
| `posts Post[]` | User can have multiple Posts |

---

## 4. Create & Run Migration 🔄

### Step 1: Create Migration

```bash
npx prisma migrate dev --name add_user_and_relationships
```

**What happens:**
1. Prisma detects schema changes
2. Creates a migration file
3. Asks for migration name
4. Runs the migration
5. Updates prisma client

**Output:**
```
✔ Enter a name for this migration › add_user_and_relationships
✔ Your database has been successfully migrated to `dev` branch.
✔ Generated Prisma Client (v5.x) to ./node_modules/@prisma/client
```

### Step 2: Verify Changes

```bash
# Open Prisma Studio to see your database
npx prisma studio
```

You'll see:
- User table (empty)
- Post table (with userId column)
- Comment table (new)

---

## 5. Task 1: Add User to Posts 👤

### Part A: Update Post Creation

**File: `app/api/posts/route.ts`**

```typescript
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  try {
    // For now, hardcode userId = 1
    // Later we'll get this from auth
    const userId = 1

    // Get form data
    const formData = await req.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    // Validate
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Create post with user relationship
    const post = await prisma.post.create({
      data: {
        title,
        description,
        userId // Connect to user
      },
      include: {
        user: true // Include user data in response
      }
    })

    return NextResponse.json({ data: { post } })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
```

**Key changes:**
- `userId: 1` - Assign post to a user
- `include: { user: true }` - Fetch user data with post

### Part B: Update Edit Post

**File: `app/api/posts/[id]/route.ts`**

```typescript
export const PUT = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  
  try {
    const formData = await req.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description required' }, { status: 400 })
    }

    // Update post (userId stays same)
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description
      },
      include: {
        user: true
      }
    })

    revalidatePath('/posts')
    return NextResponse.json({ data: { post } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}
```

### Part C: Update Fetch All Posts

**File: `app/api/posts/search/route.ts`**

```typescript
export const GET = async (req: NextRequest) => {
  try {
    const searchTerm = req.nextUrl.searchParams.get('q') || ''

    const whereClause = !searchTerm || searchTerm.length < 3 
      ? {} 
      : {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        }

    // Include user data with posts
    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        user: true // 👈 Get user info too
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search posts' }, { status: 500 })
  }
}
```

---

## 6. Task 2: Comments Feature 💬

### Part A: Update Components

**File: `app/components/PostDetails.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { Post } from '@/lib/interface/post'

export default function PostDetails({ post }: { post: Post }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {post.title}
          </h2>
          {/* Show post author */}
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            By {post.user?.name || 'Unknown'}
          </p>
        </div>
      </div>
      
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        {post.description}
      </p>

      {/* Rest of your component */}
    </div>
  )
}
```

### Part B: Update Post Interface

**File: `lib/interface/post.ts`**

```typescript
export interface Post {
  id: number
  title: string
  description: string
  userId: number
  user?: {
    id: number
    email: string
    name: string
  }
  createdAt: Date
  updatedAt: Date
}
```

### Part C: Create Comments API

**File: `app/api/posts/[id]/comments/route.ts`**

```typescript
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET comments for a post
export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params

    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST new comment
export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const formData = await req.formData()
    const text = formData.get('text') as string

    if (!text) {
      return NextResponse.json({ error: 'Comment text required' }, { status: 400 })
    }

    // For now, hardcode userId = 1
    // Later get from auth
    const userId = 1

    const comment = await prisma.comment.create({
      data: {
        text,
        postId: parseInt(id),
        userId
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({ data: { comment } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
```

---

## 7. Task 3: Filter Posts by User 👥

### Fetch User's Posts Only

**File: `app/api/users/[userId]/posts/route.ts`**

```typescript
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest, { params }: { params: Promise<{ userId: string }> }) => {
  try {
    const { userId } = await params

    // Get only posts by this user
    const posts = await prisma.post.findMany({
      where: { userId: parseInt(userId) },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user posts' }, { status: 500 })
  }
}
```

---

## 8. Task 4: Authorization (Edit Own Posts) 🔐

### Update POST route to check ownership

**File: `app/api/posts/[id]/route.ts`**

```typescript
export const PUT = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  
  try {
    const userId = 1 // Get from auth later
    const postId = parseInt(id)

    // Fetch post to check ownership
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if user owns this post
    if (post.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only edit your own posts' },
        { status: 403 }
      )
    }

    // User owns post, allow update
    const formData = await req.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, description },
      include: { user: true }
    })

    revalidatePath('/posts')
    return NextResponse.json({ data: { updatedPost } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}
```

**Similar for DELETE:**

```typescript
export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  
  try {
    const userId = 1 // Get from auth later

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check ownership
    if (post.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      )
    }

    // Delete post (comments auto-delete due to onDelete: Cascade)
    await prisma.post.delete({
      where: { id: parseInt(id) }
    })

    revalidatePath('/posts')
    return NextResponse.json({ data: { post } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
```

---

## 9. Common Patterns 📚

### Pattern 1: Include Related Data

```typescript
// Get post WITH user data
const post = await prisma.post.findUnique({
  where: { id: 1 },
  include: {
    user: true,
    comments: true
  }
})

// Result:
// {
//   id: 1,
//   title: 'My Post',
//   user: { id: 1, name: 'Muhammad' },
//   comments: [...]
// }
```

### Pattern 2: Select Specific Fields

```typescript
// Get post but only user's name (not email)
const post = await prisma.post.findUnique({
  where: { id: 1 },
  include: {
    user: {
      select: {
        id: true,
        name: true
        // email NOT included
      }
    }
  }
})
```

### Pattern 3: Nested Filtering

```typescript
// Get all posts by a specific user
const posts = await prisma.post.findMany({
  where: {
    user: {
      email: 'muhammad@example.com'
    }
  },
  include: {
    user: true
  }
})
```

### Pattern 4: Count Related Records

```typescript
// Get post with comment count
const post = await prisma.post.findUnique({
  where: { id: 1 },
  include: {
    _count: {
      select: { comments: true }
    }
  }
})

// Result: { ..., _count: { comments: 5 } }
```

### Pattern 5: Cascade Delete

```prisma
model Post {
  comments Comment[] // Has comments
}

model Comment {
  postId Int
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  // If post deleted → all comments deleted automatically
}
```

---

## Key Concepts 🎓

| Concept | Meaning |
|---------|---------|
| **Foreign Key** | Column that references another table's primary key |
| **Primary Key** | Unique identifier for a record (id) |
| **include** | Fetch related data in same query |
| **select** | Choose specific fields to return |
| **onDelete: Cascade** | Auto-delete related records |
| **Relationship** | Connection between two models |

---

## Migration Commands Reference 📖

```bash
# Create a new migration
npx prisma migrate dev --name add_user_relationships

# View migration history
npx prisma migrate status

# Open database GUI
npx prisma studio

# Reset database (deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate
```

---

## Next: Let's Build! 🚀

You're ready to:

1. **Update schema** with User model
2. **Run migration** to create tables
3. **Update API routes** to include user data
4. **Add comments feature** 
5. **Implement authorization**

Which task would you like to start with?

**Task 1:** Update schema & run migration  
**Task 2:** Add user to posts  
**Task 3:** Comments feature  
**Task 4:** Authorization checks

Let me know and we'll implement it step by step! 💪
