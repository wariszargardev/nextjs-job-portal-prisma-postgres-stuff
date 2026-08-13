"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Status = "idle" | "submitting" | "success" | "error"

export default function PostCreate(){
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [errors, setErrors] = useState({
        title: "",
        description: ""
    })
    const [status, setStatus] = useState<Status>("idle")
    const [serverMessage, setServerMessage] = useState("")

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!isValidaToSubmit()) return

        setStatus("submitting")
        setServerMessage("")

        try {
            const formData = new FormData()
            formData.set("title", title)
            formData.set("description", description)

            const res = await fetch('/api/posts', {
                method: "POST",
                body: formData
            })
            const result = await res.json()

            if (!res.ok) {
                setStatus("error")
                setServerMessage(result.error || "Failed to create post")
                return
            }

            setStatus("success")
            setServerMessage("Post created successfully! Redirecting...")
            setTimeout(() => {
                router.push('/posts')
            }, 900)
        } catch {
            setStatus("error")
            setServerMessage("Something went wrong. Please try again.")
        }
    }

    const isValidaToSubmit = () => {
        const newErrors = {
            title: getTitleValidation(),
            description: getDescriptionValidation(),
        }
        setErrors(newErrors)
        return !Object.values(newErrors).some(error => error !== "")
    }

    const getTitleValidation = () => {
        if (!title) return "Title is required"
        if(title.length < 3) return "Title must be at least 3 characters"
        if(title.length > 100) return "Title must be less than 100 characters"
        return ""
    }

    const getDescriptionValidation = () => {
        if (!description) return "Description is required"
        if(description.length < 10) return "Description must be at least 10 characters"
        if(description.length > 500) return "Description must be less than 500 characters"
        return ""
    }

    const isSubmitting = status === "submitting"

    return (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
            <Link
                href="/posts"
                className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
            >
                ← Back to posts
            </Link>

            <div className="mb-8">
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Create Post</h1>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Share something new with your readers.</p>
            </div>

            {status === "success" && (
                <div className="mb-6 flex animate-in items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-sm dark:border-green-900 dark:bg-green-950 dark:text-green-400">
                    ✅ {serverMessage}
                </div>
            )}
            {status === "error" && (
                <div className="mb-6 flex animate-in items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    ⚠️ {serverMessage}
                </div>
            )}

            <form
                onSubmit={submitForm}
                className="flex flex-col gap-7 rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg shadow-neutral-200/50 sm:p-10 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none"
            >
                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Post Title</label>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">{title.length}/100</span>
                    </div>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        type="text"
                        placeholder="Enter post title..."
                        disabled={isSubmitting}
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-neutral-900 shadow-sm outline-none transition focus:ring-2 disabled:opacity-50 dark:bg-neutral-950 dark:text-neutral-100 ${
                            errors.title
                                ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-900 dark:focus:ring-red-950"
                                : "border-neutral-200 focus:border-blue-400 focus:ring-blue-100 dark:border-neutral-800 dark:focus:ring-blue-950"
                        }`}
                    />
                    {errors.title && <p className="mt-1.5 text-sm text-red-500">{errors.title}</p>}
                </div>

                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Post Description</label>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">{description.length}/500</span>
                    </div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter post description..."
                        rows={8}
                        disabled={isSubmitting}
                        className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-base text-neutral-900 shadow-sm outline-none transition focus:ring-2 disabled:opacity-50 dark:bg-neutral-950 dark:text-neutral-100 ${
                            errors.description
                                ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-900 dark:focus:ring-red-950"
                                : "border-neutral-200 focus:border-blue-400 focus:ring-blue-100 dark:border-neutral-800 dark:focus:ring-blue-950"
                        }`}
                    ></textarea>
                    {errors.description && <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                >
                    {isSubmitting && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                    {isSubmitting ? "Creating..." : "Create Post"}
                </button>
            </form>
        </div>
    )
}
