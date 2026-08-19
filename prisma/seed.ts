import "dotenv/config";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const users = [
  {
    id: randomUUID(),
    email: "alice@example.com",
    password: "password123",
    name: "Alice Johnson",
    role: "CANDIDATE" as const,
    updatedAt: new Date(),
  },
  {
    id: randomUUID(),
    email: "bob@example.com",
    password: "password123",
    name: "Bob Smith",
    role: "EMPLOYER" as const,
    updatedAt: new Date(),
  },
];

const posts = [
  {
    title: "Getting started with Next.js",
    description: "A quick overview of the App Router and server components.",
    sharedCount: 12,
    bookMark: true,
    commentCount: 4,
  },
  {
    title: "Why Prisma?",
    description: "A type-safe ORM that pairs well with TypeScript projects.",
    sharedCount: 5,
    bookMark: false,
    commentCount: 1,
  },
  {
    title: "Styling with Tailwind CSS",
    description: "Utility-first CSS that keeps styles close to the markup.",
    sharedCount: 8,
    bookMark: true,
    commentCount: 2,
  },
  {
    title: "Understanding React Server Components",
    description: "How rendering shifts between the server and the client.",
    sharedCount: 20,
    bookMark: false,
    commentCount: 7,
  },
  {
    title: "Deploying to Vercel",
    description: "A walkthrough of shipping a Next.js app to production.",
    sharedCount: 3,
    bookMark: false,
    commentCount: 0,
  },
  {
    title: "Working with PostgreSQL",
    description: "Basics of relational data modeling for a dashboard app.",
    sharedCount: 15,
    bookMark: true,
    commentCount: 5,
  },
  {
    title: "TypeScript tips for beginners",
    description: "Common patterns that make everyday TypeScript easier.",
    sharedCount: 9,
    bookMark: false,
    commentCount: 3,
  },
];

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany({ where: { email: { in: users.map((user) => user.email) } } });

  await prisma.user.createMany({ data: users });
  console.log(`Seeded ${users.length} users.`);

  await prisma.post.createMany({
    data: posts.map((post, index) => ({
      ...post,
      userId: users[index % users.length].id,
    })),
  });
  console.log(`Seeded ${posts.length} posts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
