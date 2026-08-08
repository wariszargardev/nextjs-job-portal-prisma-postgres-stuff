import Link from "next/link"
import LikeButton from "./LikeButton"
import SharedCount from "./SharedCounts"
import BookMarkButton from "./BookmarkButton"
import AddComment from "./AddComment"
import { Post } from "@/lib/interface/post"

export default async function PostDetails({post}: {post: Post}){
    return (
        <div>
            <h1> Post Information</h1>
            {
                <div key={post.id} className="mt-4 mb-4">
                    <h1>{post.title}</h1>
                    <p>{post.description}</p>
                    <p>Shared Count: {post.sharedCount}</p>
                    <Link href={`posts/${post.id}`} className="cursor-pointer">View Details</Link>
                    <LikeButton post={post} />
                    <SharedCount post={post} />
                    <BookMarkButton post={post} />
                    <AddComment  post={post}/>
                    <hr/>
                </div>
            }
        </div>
    )
}