import { useState, useEffect } from 'react'
import {supabase} from '../supabaseClient.js'

function Feed(){ 
    const [posts, setPosts]=useState([]) 

    useEffect(()=>{ 
        async function updateFeed(){ 
            try {
                const {data, error}= await supabase.from('posts').select('*')
                if (error) throw error
                setPosts(data)
            }catch(err){ 
                console.error(err.message) 
            }
        }
        updateFeed()
    },[])
    return( 
        <div>
            {posts.map((post)=>(
                <div key={post.id}>
                    <h3>{post.user_id}</h3>
                    <img src={post.image_url} alt={post.caption}></img>
                    <p>{post.caption}</p>
                </div>
            ))}
        </div>

    )
}

export default Feed
