"use client"
import { useState } from "react"

export default function ServerVSClient(){
    const [count, increment] = useState(0)
    return(
        <div>
            <h1>Server vs Client Component</h1>
            <button onClick={() => increment(count + 1)}> Increment {count}</button>
        </div>
    )
}