# Prisma Query Reference

## Setup — import prisma in any file

```ts
import prisma from "@/lib/db/prisma";
```

---

## SELECT Queries

### Select all

Fetches every column for every row in the `User` table.

```ts
const users = await prisma.user.findMany();
```

### Select custom columns only

Fetches every row but only returns the `id`, `name`, and `email` columns.

```ts
const users = await prisma.user.findMany({
    select: {
        id: true,
        name: true,
        email: true
    }
})
```

### Select single unique record

Fetches exactly one row by a unique field (`id`, `email`, or any `@unique` column). Returns `null` if no match is found.

```ts
const user = await prisma.user.findUnique({
    where: { id: "cmrm41op40000vgnhbnq5g0gf" },
})

// by any other unique field
const user = await prisma.user.findUnique({
    where: { email: "john@example.com" },
})
```

With select:

```ts
const user = await prisma.user.findUnique({
    where: { id: "cmrm41op40000vgnhbnq5g0gf" },
    select: {
        id: true,
        name: true,
        email: true
    }
})
```

### Find first matching value

Returns the first row that matches the filter, even if the filtered column isn't unique.

```ts
const user = await prisma.user.findFirst({
    where: { name: "Liva INSURANCE" },
    select: {
        id: true,
        name: true,
        email: true
    }
})
```

### Find many matching values

Returns every row that matches the filter (not just the first one).

```ts
const users = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
        id: true,
        name: true,
        email: true
    }
})
```

### findUnique vs findFirst vs findMany

Quick reference for which finder to use depending on the field being queried and the shape of result you need.

```ts
// findUnique  — only for @id or @unique fields
const user = await prisma.user.findUnique({ where: { id: "..." } });

// findFirst   — any field, returns first match or null
const user = await prisma.user.findFirst({ where: { name: "John" } });

// findMany    — any field, returns array (empty array if none found)
const users = await prisma.user.findMany({ where: { role: "ADMIN" } });
```

### WHERE — AND condition (implicit & explicit)

Listing multiple fields directly inside `where` ANDs them together implicitly. The explicit `AND` operator (array of conditions) does the same thing and is useful when conditions need to be built dynamically.

```ts
// implicit AND
const users = await prisma.user.findMany({
    where: {
        name: "Liva INSURANCE",
        email: "muhammad.wari3s@myalfred.com"
    },
    select: {
        id: true,
        name: true,
        email: true
    }
})

// explicit AND
const users = await prisma.user.findMany({
    where: {
        AND: [
            { name: "Liva INSURANCE" },
            { email: "muhammad.wari3s@myalfred.com" }
        ]
    },
    select: {
        id: true,
        name: true,
        email: true
    }
})
```

### WHERE — OR condition

Returns rows that match at least one of the conditions in the array.

```ts
const users = await prisma.user.findMany({
    where: {
        OR: [
            { name: "Liva INSURANCE" },
            { email: "muhammad.wari3s@myalfred.com" }
        ]
    },
    select: {
        id: true,
        name: true,
        email: true
    }
})
```

### WHERE — NOT condition

Excludes rows matching the given condition(s). Use a single object to exclude one condition, or an array to exclude several.

```ts
// single
const users = await prisma.user.findMany({
    where: {
        NOT: { role: "ADMIN" }
    }
})

// multiple
const users = await prisma.user.findMany({
    where: {
        NOT: [
            { name: "Liva INSURANCE" },
            { email: "muhammad.wari3s@myalfred.com" }
        ]
    },
    select: {
        id: true,
        name: true,
        email: true
    }
})
```

### WHERE — combining OR + NOT

Match either condition in `OR`, but exclude the row with the given `id`.

```ts
const users = await prisma.user.findMany({
    where: {
        OR: [
            { name: "Liva INSURANCE" },
            { email: "muhammad.wari3s@myalfred.com" }
        ],
        NOT: [
            { id: "cmrc45zmz0003lgnhyiw1d5zl" }
        ]
    }
})
```

### WHERE — AND + OR combined

Requires `role: "ADMIN"` (AND) while also requiring the name or email to contain "john" (OR branch).

```ts
const users = await prisma.user.findMany({
    where: {
        AND: [
            { role: "ADMIN" },
            {
                OR: [
                    { name: { contains: "john" } },
                    { email: { contains: "john" } },
                ],
            },
        ],
    },
})
```

### WHERE — nested AND inside OR

Matches admins whose name starts with "A", OR regular users whose email ends with "@gmail.com".

```ts
const users = await prisma.user.findMany({
    where: {
        OR: [
            {
                AND: [
                    { role: "ADMIN" },
                    { name: { startsWith: "A" } },
                ],
            },
            {
                AND: [
                    { role: "USER" },
                    { email: { endsWith: "@gmail.com" } },
                ],
            },
        ],
    },
})
```

### Complex query — deeply nested AND/OR

Nests `OR` and `AND` inside an outer `AND` array: posts that are either unpublished or start with "w", AND have specific content, AND match a given `id`.

```ts
const posts = await prisma.post.findMany({
    where: {
        AND: [
            {
                OR: [
                    { published: false },
                    { title: { startsWith: 'w' } }
                ],
                AND: {
                    content: "dsgfsdgfdsg"
                }
            },
            { id: "cmrc46mpo0006lgnhw2qaze0c" }
        ],
    },
})
```

### WHERE — string filters: contains / startsWith / endsWith

Common text-search filters, optionally case-insensitive via `mode`.

```ts
const users = await prisma.user.findMany({
    where: {
        name: {
            contains: "john",
            mode: "insensitive", // case-insensitive
        },
    },
});

const users = await prisma.user.findMany({
    where: { name: { startsWith: "John" } },
});

const users = await prisma.user.findMany({
    where: { email: { endsWith: "@gmail.com" } },
});
```

### WHERE — IN and NOT IN

Matches rows whose `role` is one of the listed values, and whose `email` is none of the listed values.

```ts
const users = await prisma.user.findMany({
    where: {
        role: {
            in: ['ADMIN', "USER"]
        },
        email: {
            notIn: ['muhammad.wari3s@myalfred.com', 'john21@example.com']
        }
    },
    select: {
        id: true,
        name: true,
        email: true,
        role: true,
    }
})
```

### WHERE — null check

Filters rows where a nullable column is (or isn't) `null`.

```ts
// IS NULL
const users = await prisma.user.findMany({
    where: { deletedAt: null },
});

// IS NOT NULL
const users = await prisma.user.findMany({
    where: {
        deletedAt: { not: null },
    },
});
```

### WHERE — date range (BETWEEN)

Filters rows created within an inclusive date range using `gte`/`lte`.

```ts
const users = await prisma.user.findMany({
    where: {
        createdAt: {
            gte: new Date("2024-01-01"), // greater than or equal
            lte: new Date("2024-12-31"), // less than or equal
        },
    },
});
```

### WHERE — relation filter: some / every / none

`some` matches parents with at least one matching child, `every` requires all children to match, `none` requires zero matching children.

```ts
// users who have at least one published post
const users = await prisma.user.findMany({
    where: {
        posts: { some: { published: true } }
    }
})

// users where ALL of their posts are published
const users = await prisma.user.findMany({
    where: {
        posts: { every: { published: true } }
    }
})

// users who have NO posts at all
const users = await prisma.user.findMany({
    where: {
        posts: { none: {} },
    },
});
```

### WHERE — filter by a related record's fields

Returns posts whose author has the `ADMIN` role and whose author's `id` is not in the excluded list.

```ts
const posts = await prisma.post.findMany({
    where: {
        author: {
            role: "ADMIN",
            id: {
                notIn: ['cmrc45zmz0003lgnhyiw1d5zl']
            }
        }
    }
})
```

### WHERE — filter across multiple relations

Returns comments whose parent post is published AND whose author has the `ADMIN` role.

```ts
const comments = await prisma.comment.findMany({
    where: {
        post: { published: true },
        author: { role: "ADMIN" },
    },
});
```

### Relations — include related records

Returns comments along with their full related `post` and `author` records. `include` adds the relation on top of the default scalar fields (use `select` instead when you want to also restrict which scalar fields come back).

```ts
const comments = await prisma.comment.findMany({
    include: {
        post: true,
        author: true
    }
})

// user with all their posts and comments
const user = await prisma.user.findUnique({
    where: { id: "clh7qz8x..." },
    include: {
        posts: true,
        comments: true,
    },
});
```

### Relations — select with relations (custom columns)

Filters comments by their related post/author, then returns only specific columns from the comment plus specific columns from its `post` and `author` relations — an alternative to `include` when you don't need every column.

```ts
const comments = await prisma.comment.findMany({
    where: {
        post: {
            published: true
        },
        author: {
            role: "ADMIN"
        }
    },
    select: {
        id: true,
        content: true,
        post: {
            select: {
                id: true,
                title: true,
                content: true
            }
        },
        author: {
            select: {
                id: true,
                name: true,
                email: true
            }
        }
    }
})
```

### Relations — nested include with filtered relation

Returns every user with their published posts, and includes each of those posts' comments.

```ts
const users = await prisma.user.findMany({
    include: {
        posts: {
            where: {
                published: true
            },
            include: {
                comments: true,
            }
        },
    }
})
```

### Relations — nested select with filtered relation

Same idea as above but with `select` instead of `include`, returning only specific columns at every level (user, post, and comment).

```ts
const users = await prisma.user.findMany({
    select: {
        id: true,
        name: true,
        posts: {
            where: {
                published: true,
            },
            select: {
                id: true,
                title: true,
                comments: {
                    select: {
                        id: true,
                        content: true,
                    },
                },
            },
        },
    },
})
```

### Relations — mix include and select

`select` can be used on the top-level query while still nesting `select` (or ordering/limiting) on individual relations.

```ts
const post = await prisma.post.findUnique({
    where: { id: "clh7qz8x..." },
    select: {
        id: true,
        title: true,
        author: {
            select: {
                name: true,
                email: true,
            },
        },
        comments: {
            select: {
                id: true,
                content: true,
            },
            orderBy: { createdAt: "desc" },
            take: 3,
        },
    },
});
```

### Relations — deeply nested relations

Fetches a single post along with its author, its comments, and each comment's author (only `id`/`name`) — relations nested three levels deep.

```ts
// post → comments → comment author
const post = await prisma.post.findUnique({
    where: { id: "clh7qz8x..." },
    include: {
        author: true,
        comments: {
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        },
    },
});
```

### Relations — ordering and limiting nested records

Returns users with their 5 most recent published posts and 5 most recent comments, each nested relation sorted by `createdAt` descending and capped with its own `take`.

```ts
const users = await prisma.user.findMany({
    select: {
        id: true,
        name: true,
        posts: {
            where: {
                published: true
            },
            select: {
                id: true,
                content: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        },
        comments: {
            select: {
                id: true,
                content: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        }
    }
})
```

### Relations — count relations (`_count`)

`_count: true` counts every relation on the row. Nesting `_count` under `select` narrows it to specific relations only.

```ts
// count all relations
const users = await prisma.user.findMany({
    select: {
        id: true,
        name: true,
        email: true,
        _count: true
    }
})

// count only specific relations
const users = await prisma.user.findMany({
    select: {
        id: true,
        name: true,
        _count: {
            select: {
                posts: true,
                comments: true,
            }
        }
    }
})

// access as: user._count.posts
```

### Distinct values

Returns rows with unique values for the given field(s) — pass multiple fields to dedupe on the combination of all of them.

```ts
const users = await prisma.user.findMany({
    distinct: ['role'],
    select: { role: true }
})

// distinct on multiple fields
const users = await prisma.user.findMany({
    distinct: ['role', 'name'],
    select: { role: true, name: true }
})
```

### Order by

Sort by a single field, multiple fields (later entries act as tiebreakers), or by the count of a relation.

```ts
// single field
const users = await prisma.user.findMany({
    orderBy: { email: "desc" }
})

// multiple fields
const users = await prisma.user.findMany({
    orderBy: [
        { role: "asc" },
        { createdAt: "desc" }
    ]
})

// by relation count — users with the most posts first
const users = await prisma.user.findMany({
    orderBy: {
        posts: { _count: "desc" }
    }
})
```

### Pagination — skip + take (LIMIT + OFFSET)

Skips the first `skip` rows and returns up to `take` rows after that — the standard offset-based pagination pattern.

```ts
const users = await prisma.user.findMany({
    skip: 0,   // OFFSET
    take: 20,  // LIMIT
    orderBy: { createdAt: "desc" },
});
```

### Pagination — cursor based

Starts after the row matching `cursor` instead of counting offsets — more efficient for large tables since it doesn't need to skip over rows.

```ts
const users = await prisma.user.findMany({
    take: 10,
    skip: 1,
    cursor: { id: "clh7qz8x..." },
    orderBy: { createdAt: "asc" },
});
```

### Pagination — with total pages

Runs a count and a paginated `findMany` in a single `$transaction`, then derives the total number of pages from the total row count.

```ts
const perPage = 20;
const page = 1;

const [total, data] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
    }),
]);

const totalPages = Math.ceil(total / perPage);
```

### Count records

`count()` returns the total number of rows, optionally filtered with `where`.

```ts
const total = await prisma.user.count();

// with filter
const adminCount = await prisma.user.count({
    where: { role: "ADMIN" },
});
```

### Check if a record exists

Selects only `id` to check for existence as cheaply as possible, without fetching the rest of the row.

```ts
const exists = await prisma.user.findUnique({
    where: { id: "clh7qz8x..." },
    select: { id: true }, // fetch only id — fastest way
});

if (!exists) {
    // not found
}
```

---

## CREATE Queries

### Create single

```ts
const user = await prisma.user.create({
    data: {
        name: "John Doe",
        email: "john@example.com",
        role: "USER",
    },
});
```

### Create single — return custom columns only

```ts
const user = await prisma.user.create({
    data: {
        name: "John Doe",
        email: "john@example.com",
    },
    select: {
        id: true,
        name: true,
        email: true,
    },
});
```

### Create many

```ts
await prisma.user.createMany({
    data: [
        { name: "John", email: "john@example.com" },
        { name: "Jane", email: "jane@example.com" },
    ],
});
```

### Create many — skip duplicates

```ts
await prisma.user.createMany({
    data: [
        { name: "John", email: "john@example.com" },
        { name: "Jane", email: "jane@example.com" },
    ],
    skipDuplicates: true,
});
```

### Create with nested relation

```ts
// create user and their first post together
const user = await prisma.user.create({
    data: {
        name: "John Doe",
        email: "john@example.com",
        posts: {
            create: {
                title: "My first post",
                content: "Hello world",
                published: true,
            },
        },
    },
});
```

### Create — connect existing relation

```ts
// create post and connect to existing user
const post = await prisma.post.create({
    data: {
        title: "New Post",
        content: "Content here",
        author: {
            connect: { id: "userId..." },
        },
    },
});
```

---

## UPDATE Queries

### Update single by ID

```ts
const user = await prisma.user.update({
    where: { id: "clh7qz8x..." },
    data: {
        name: "John Updated",
        role: "ADMIN",
    },
});
```

### Update many

```ts
await prisma.user.updateMany({
    where: { role: "USER" },
    data: { role: "ADMIN" },
});
```

### Update — increment / decrement

```ts
await prisma.post.update({
    where: { id: "clh7qz8x..." },
    data: { viewCount: { increment: 1 } },
});

await prisma.post.update({
    where: { id: "clh7qz8x..." },
    data: { viewCount: { decrement: 1 } },
});
```

### Update — multiply / divide

```ts
await prisma.post.update({
    where: { id: "clh7qz8x..." },
    data: { viewCount: { multiply: 2 } },
});
```

### Update — connect / disconnect relation

```ts
// connect to a different existing user
await prisma.post.update({
    where: { id: "clh7qz8x..." },
    data: {
        author: {
            connect: { id: "newUserId..." },
        },
    },
});

// remove the relation
await prisma.post.update({
    where: { id: "clh7qz8x..." },
    data: {
        author: { disconnect: true },
    },
});
```

### Update — connect or create relation

```ts
await prisma.post.update({
    where: { id: "clh7qz8x..." },
    data: {
        comments: {
            connectOrCreate: {
                where: { id: "commentId..." },
                create: {
                    content: "New comment",
                    authorId: "userId...",
                },
            },
        },
    },
});
```

### Update — add or delete a nested relation record

```ts
// add a new post to an existing user
const user = await prisma.user.update({
    where: { id: "clh7qz8x..." },
    data: {
        posts: {
            create: {
                title: "New post",
                content: "Content here",
            },
        },
    },
});

// delete a nested comment
await prisma.post.update({
    where: { id: "clh7qz8x..." },
    data: {
        comments: {
            delete: { id: "commentId..." },
        },
    },
});
```

### Upsert — create or update

```ts
const user = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: { name: "John Updated" },   // if exists → update
    create: {                            // if not exists → create
        name: "John Doe",
        email: "john@example.com",
        role: "USER",
    },
});
```

---

## DELETE Queries

### Delete single by ID

```ts
await prisma.user.delete({
    where: { id: "clh7qz8x..." },
});
```

### Delete many

```ts
await prisma.user.deleteMany({
    where: { role: "USER" },
});
```

### Delete all

```ts
await prisma.user.deleteMany();
```

### Delete with relation condition

```ts
// delete all unpublished posts by a specific user
await prisma.post.deleteMany({
    where: {
        authorId: "userId...",
        published: false,
    },
});
```

### Soft delete pattern

```ts
// add deletedAt DateTime? to your model first

// soft delete
await prisma.user.update({
    where: { id: "clh7qz8x..." },
    data: { deletedAt: new Date() },
});

// query only non-deleted
const users = await prisma.user.findMany({
    where: { deletedAt: null },
});
```

---

## Aggregate Queries

### count, sum, avg, min, max

```ts
const stats = await prisma.post.aggregate({
    _count: { id: true },
    _avg: { viewCount: true },
    _sum: { viewCount: true },
    _min: { viewCount: true },
    _max: { viewCount: true },
});

// stats._count.id
// stats._avg.viewCount
```

### Group by

```ts
const grouped = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
});

// [{ role: "ADMIN", _count: { id: 2 } }, { role: "USER", _count: { id: 10 } }]
```

### Group by with having (filter after group)

```ts
// roles that have more than 5 users
const grouped = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
    having: {
        id: { _count: { gt: 5 } },
    },
});
```

---

## Transaction Queries

### Simple transaction (independent queries, run in parallel)

```ts
const [user, post] = await prisma.$transaction([
    prisma.user.create({
        data: { name: "John", email: "john@example.com" },
    }),
    prisma.post.create({
        data: {
            title: "First Post",
            content: "Content",
            authorId: "clh7qz8x...",
        },
    }),
]);
```

### Interactive transaction (use result of one query in the next)

```ts
const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
        data: { name: "John", email: "john@example.com" },
    });

    const post = await tx.post.create({
        data: {
            title: "First Post",
            content: "Content",
            authorId: user.id, // use id from previous query
        },
    });

    return { user, post };
});
```

### findMany + count in parallel (efficient pagination pattern)

```ts
const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
        where: { role: "ADMIN" },
        skip: 0,
        take: 20,
    }),
    prisma.user.count({
        where: { role: "ADMIN" },
    }),
]);
```

---

## JOIN Queries (SQL ↔ Prisma)

### INNER JOIN — post with author

**SQL**
```sql
SELECT p.id, p.title, u.name, u.email
FROM Post p
INNER JOIN User u ON p.authorId = u.id
```

**Prisma**
```ts
const posts = await prisma.post.findMany({
    select: {
        id: true,
        title: true,
        author: {
            select: { name: true, email: true },
        },
    },
});
```

### INNER JOIN — comment with post and author

**SQL**
```sql
SELECT c.id, c.content, p.title, u.name
FROM Comment c
INNER JOIN Post p ON c.postId = p.id
INNER JOIN User u ON c.authorId = u.id
```

**Prisma**
```ts
const comments = await prisma.comment.findMany({
    select: {
        id: true,
        content: true,
        post: { select: { title: true } },
        author: { select: { name: true } },
    },
});
```

### LEFT JOIN — users with their posts (includes users with no posts)

**SQL**
```sql
SELECT u.id, u.name, p.title
FROM User u
LEFT JOIN Post p ON p.authorId = u.id
```

**Prisma**
```ts
const users = await prisma.user.findMany({
    select: {
        id: true,
        name: true,
        posts: { select: { title: true } },
        // users with no posts return posts: []
    },
});
```

### LEFT JOIN — with WHERE on the joined table

**SQL**
```sql
SELECT u.id, u.name, p.title
FROM User u
LEFT JOIN Post p ON p.authorId = u.id
WHERE p.published = true OR p.id IS NULL
```

**Prisma**
```ts
const users = await prisma.user.findMany({
    select: {
        id: true,
        name: true,
        posts: {
            where: { published: true },
            select: { title: true },
        },
    },
});
```

### JOIN with ORDER BY

**SQL**
```sql
SELECT u.name, p.title, p.createdAt
FROM User u
INNER JOIN Post p ON p.authorId = u.id
ORDER BY p.createdAt DESC
```

**Prisma**
```ts
const users = await prisma.user.findMany({
    select: {
        name: true,
        posts: {
            select: { title: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        },
    },
});
```

### JOIN with LIMIT on relation

**SQL**
```sql
SELECT u.name, p.title
FROM User u
INNER JOIN Post p ON p.authorId = u.id
LIMIT 3
```

**Prisma**
```ts
const users = await prisma.user.findMany({
    select: {
        name: true,
        posts: {
            select: { title: true },
            take: 3,
        },
    },
});
```

### JOIN with COUNT

**SQL**
```sql
SELECT u.id, u.name, COUNT(p.id) as postsCount
FROM User u
LEFT JOIN Post p ON p.authorId = u.id
GROUP BY u.id, u.name
```

**Prisma**
```ts
const users = await prisma.user.findMany({
    select: {
        id: true,
        name: true,
        _count: { select: { posts: true } },
    },
});

// access as user._count.posts
```

### JOIN with WHERE on parent + child

**SQL**
```sql
SELECT u.name, p.title
FROM User u
INNER JOIN Post p ON p.authorId = u.id
WHERE u.role = 'ADMIN'
AND p.published = true
```

**Prisma**
```ts
const users = await prisma.user.findMany({
    where: {
        role: "ADMIN",
        posts: { some: { published: true } },
    },
    select: {
        name: true,
        posts: {
            where: { published: true },
            select: { title: true },
        },
    },
});
```

### WHERE EXISTS / NOT EXISTS

**SQL**
```sql
-- EXISTS
SELECT * FROM User u
WHERE EXISTS (SELECT 1 FROM Post p WHERE p.authorId = u.id)

-- NOT EXISTS
SELECT * FROM User u
WHERE NOT EXISTS (SELECT 1 FROM Post p WHERE p.authorId = u.id)
```

**Prisma**
```ts
// EXISTS
const users = await prisma.user.findMany({
    where: { posts: { some: {} } },
});

// NOT EXISTS
const users = await prisma.user.findMany({
    where: { posts: { none: {} } },
});
```

### SUBQUERY — posts by admins only

**SQL**
```sql
SELECT * FROM Post
WHERE authorId IN (
    SELECT id FROM User WHERE role = 'ADMIN'
)
```

**Prisma**
```ts
const posts = await prisma.post.findMany({
    where: { author: { role: "ADMIN" } },
});
```

### GROUP BY with JOIN

**SQL**
```sql
SELECT u.role, COUNT(p.id) as totalPosts
FROM User u
LEFT JOIN Post p ON p.authorId = u.id
GROUP BY u.role
```

**Prisma**
```ts
const grouped = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
});
```

### UNION — raw query only

**SQL**
```sql
SELECT id, name FROM User WHERE role = 'ADMIN'
UNION
SELECT id, name FROM User WHERE createdAt > '2024-01-01'
```

**Prisma**
```ts
const result = await prisma.$queryRaw`
    SELECT id, name FROM "User" WHERE role = 'ADMIN'
    UNION
    SELECT id, name FROM "User" WHERE "createdAt" > '2024-01-01'
`;
```

---

## Raw SQL Queries

```ts
// SELECT
const users = await prisma.$queryRaw`
    SELECT u.id, u.name, COUNT(p.id) as "postsCount"
    FROM "User" u
    LEFT JOIN "Post" p ON p."authorId" = u.id
    GROUP BY u.id, u.name
    ORDER BY "postsCount" DESC
`;

// INSERT
await prisma.$executeRaw`
    INSERT INTO "User" (id, name, email, role)
    VALUES (${id}, ${name}, ${email}, 'USER')
`;

// UPDATE
await prisma.$executeRaw`
    UPDATE "User" SET role = 'ADMIN'
    WHERE email = ${email}
`;

// DELETE
await prisma.$executeRaw`
    DELETE FROM "User" WHERE id = ${id}
`;
```

---

## Quick Reference Table

| Operation | Method |
|---|---|
| Select all | `findMany()` |
| Select with filter | `findMany({ where })` |
| Select single by unique | `findUnique({ where })` |
| Select first match | `findFirst({ where })` |
| Select with relations | `findUnique({ include })` |
| Select custom columns | `findMany({ select })` |
| Select distinct | `findMany({ distinct })` |
| Count | `count()` |
| Aggregate | `aggregate()` |
| Group by | `groupBy()` |
| Create one | `create({ data })` |
| Create many | `createMany({ data[] })` |
| Create or update | `upsert()` |
| Update one | `update({ where, data })` |
| Update many | `updateMany({ where, data })` |
| Delete one | `delete({ where })` |
| Delete many | `deleteMany({ where })` |
| Transaction | `$transaction([])` |
| Interactive transaction | `$transaction(async tx => {})` |
| Raw select | `$queryRaw` |
| Raw execute | `$executeRaw` |

---

## Array vs Object in Prisma Queries

### Simple rule

| Use | When |
|---|---|
| **Object `{}`** | single condition, one thing |
| **Array `[]`** | multiple conditions, many things |

### Summary Table

| Clause | Object | Array |
|---|---|---|
| `where` single condition | ✅ | ❌ |
| `where` AND implicit | ✅ multiple keys | ❌ |
| `where AND` explicit | ❌ | ✅ |
| `where OR` | ❌ | ✅ always |
| `where NOT` single | ✅ | ❌ |
| `where NOT` multiple | ❌ | ✅ |
| `orderBy` single field | ✅ | ❌ |
| `orderBy` multiple fields | ❌ | ✅ |
| `data` single record | ✅ | ❌ |
| `data` many records | ❌ | ✅ |
| `select` | ✅ always | ❌ |
| `include` | ✅ always | ❌ |
| `$transaction` independent | ❌ | ✅ |
| `$transaction` dependent | ✅ callback | ❌ |

> **One line to remember: Object = one thing. Array = many things or multiple possibilities.**
