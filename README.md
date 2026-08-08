This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database (Prisma + Postgres)

This project uses [Prisma](https://www.prisma.io) with PostgreSQL.

- Schema: [prisma/schema.prisma](prisma/schema.prisma) — this app's model is `Post` (`title`, `description`, `sharedCount`, `bookMark`, `commentCount`). The other models (`User`, `Job`, `JobApplication`, `QuoteType`, `DocumentType`) belong to an existing system sharing this database — introspected with `prisma db pull` so `db push` never drops them. Don't run `db push --accept-data-loss` here.
- Config: [prisma.config.ts](prisma.config.ts) — reads `DATABASE_URL` from `.env`.
- Client: [lib/prisma.ts](lib/prisma.ts) — import `prisma` from here anywhere in the app, don't instantiate `PrismaClient` yourself.

```ts
import { prisma } from "@/lib/prisma";

const posts = await prisma.post.findMany();
```

Set `DATABASE_URL` in `.env` before running any command below.

### Generate the client

Run this after cloning, after `pnpm install`, or any time `prisma/schema.prisma` changes:

```bash
pnpm db:generate
```

(`pnpm install` also runs this automatically via the `postinstall` script.)

### Push schema changes to the database

After editing a model in `prisma/schema.prisma`, push the change to the database:

```bash
pnpm db:push
```

This syncs the database to match the schema. It also regenerates the client, so a separate `db:generate` isn't needed afterward.

### Seed sample data

Insert a handful of sample `Post` rows ([prisma/seed.ts](prisma/seed.ts)):

```bash
pnpm db:seed
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


<!-- I change in schema -->

pnpm run db:push to reflects changes in db

pnpm pnpm prisma generate to update prisma conmfigutartion

That's a stale generated type file in .next/dev/types — Next.js cached a type stub for an app/api/auth/[...nextauth]/route.ts that doesn't actually exist in your source tree anymore (only app/api/posts/route.ts exists now). Deleting the .next build cache and rebuilding will fix it.

rm -rf .next && npm run build

To test cache on local we need to run 
npm run build

Production Mode (npm run start):

Cahche ma yeah hoga 

console.log("🔍 Fetching posts from database...")
const posts: Post[] = await prisma.post.findMany()
console.log("✅ Posts fetched:", posts.length, "posts")

Yeah dtaa cached hojy ga automaitc on server and even if ou added no rwil lreyrn latest dtaa in this way page run too falsr