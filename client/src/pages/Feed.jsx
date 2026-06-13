import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../context/AuthContext' 

function Feed(){
    const [posts, setPosts] = useState([]) 
    const [likes, setLikes] = useState([])
    const { user } = useAuth() 

    useEffect(()=>{ 
        async function updateFeed(){ 
            try {
                const {data, error} = await supabase.from('posts').select('*, profiles(username)') 
                if (error) throw error
                setPosts(data)
            }catch(err){
                console.error(err.message) 
            }
        }

        async function fetchLikes(){
            try {
                const {data, error} = await supabase.from('likes').select('*')
                if (error) throw error
                setLikes(data)
            }catch(err){
                console.error(err.message)
            }
        }

        updateFeed()
        fetchLikes()
    },[]) 

    async function handleLike(postId){ /* the function must take a parameter so we know which specific post was clicked. Since we can 
        identify a post by its post_id, we pass that in as the parameter and call it postId. */
        const existingLike = likes.find(like => like.post_id === postId && like.user_id === user.id)
        /* existingLike is only used inside handleLike which runs when the button is clicked. It's not what controls the red heart display.

        The entire purpose of this line of code is to get the id from the like object, because in the next line you need existingLike.id 
        so you can tell Supabase exactly which row to delete if the post has already been liked. If it wasn't liked, it will return
        undefined which is what we want because we don't need an id if we're not deleting the row. */ 
        if(existingLike){
            const {error} = await supabase.from('likes').delete().eq('id', existingLike.id) 
            /* 
                By the time we reach this line we already know there's a row to delete because existingLike found one on the line above. 
                
                Executes the delete on the likes table. Two chained instructions:
                - .delete() — what to do
                - .eq('id', existingLike.id) — which row to delete (where id matches existingLike.id)
                Without .eq(), Supabase would delete everything in the likes table.
                error captures whether the operation succeeded or failed (network issues, permissions, etc.)
                The actual error check happens on the next line.
            */

            if(!error) setLikes(likes.filter(like => like.id !== existingLike.id))
            

        } else {
            const {data, error} = await supabase.from('likes').insert({user_id: user.id, post_id: postId}).select()
            if(!error) setLikes([...likes, data[0]])
        }
    }
    
    return(
        <div>
            
            {posts.map((post)=>(
                <div key={post.id}> 
                    <h3>{post.profiles.username}</h3>
                    <img src={post.image_url} alt={post.caption}></img>
                    <p>{post.caption}</p>
                    <button onClick={() => handleLike(post.id)}>
                        {likes.some(like => like.post_id === post.id && like.user_id === user?.id) ? '❤️' : '🤍'}
                    </button>
                    <p>{likes.filter(like => like.post_id === post.id).length} likes</p>
                </div>
            ))}
        </div>
    )
}

export default Feed

