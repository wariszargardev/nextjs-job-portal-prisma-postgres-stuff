import { Comment } from "@/lib/interface/comment"

function initials(name?: string) {
    if (!name) return "?"
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
}

function timeAgo(date: Date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

    const ranges: [number, string][] = [
        [60, "just now"],
        [3600, "m"],
        [86400, "h"],
        [604800, "d"],
        [2629800, "w"],
        [31557600, "mo"],
    ]

    if (seconds < 60) return ranges[0][1]
    if (seconds < 3600) return `${Math.floor(seconds / 60)}${ranges[1][1]} ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}${ranges[2][1]} ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}${ranges[3][1]} ago`
    if (seconds < 2629800) return `${Math.floor(seconds / 604800)}${ranges[4][1]} ago`
    if (seconds < 31557600) return `${Math.floor(seconds / 2629800)}${ranges[5][1]} ago`
    return `${Math.floor(seconds / 31557600)}y ago`
}

export default function CommentsListing({ comments }: { comments: Comment[] }) {
    if (comments.length === 0) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-10 text-center dark:border-neutral-800">
                <span className="text-2xl">🗨️</span>
                <p className="mt-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    No comments yet
                </p>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    Be the first to share your thoughts.
                </p>
            </div>
        )
    }

    return (
        <div className="mt-6 flex flex-col gap-3">
            {comments.map((comment) => (
                <div
                    key={comment.id}
                    className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white ring-2 ring-blue-50 dark:ring-blue-950">
                        {initials(comment.user?.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {comment.user?.name || "Unknown user"}
                            </p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                {timeAgo(comment.createdAt)}
                            </p>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                            {comment.content}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
