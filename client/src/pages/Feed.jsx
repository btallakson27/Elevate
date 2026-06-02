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
                const {data, error} = await supabase.from('posts').select('*') 
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

    async function handleLike(postId){
        const existingLike = likes.find(like => like.post_id === postId && like.user_id === user.id)

        if(existingLike){
            const {error} = await supabase.from('likes').delete().eq('id', existingLike.id) 
            
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
                    <h3>{post.user_id}</h3>
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

