import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../context/AuthContext' 

function Feed(){
    const [posts, setPosts] = useState([]) 
    const [likes, setLikes] = useState([])
    const { user } = useAuth() 

    useEffect(()=>{ 
        /* the functions below must be inside useEffect because fetching data from an external source (Supabase) is considered a 
        side effect in React. A side effect is anything that reaches outside of React itself — like an API call, a database fetch, 
        or a timer.
        
        It's not specifically tied to a user uploading a post. It's just that "go fetch data from Supabase when this component loads" 
        is a side effect by definition, and useEffect is where side effects live in React. 
        
        The overarching rule: 
        You don't always need useEffect when you need to access anything on the backend like Supabase or an API call — it depends on 
        when you need the data. The rule is:

            - If you need to fetch data when a component loads, use useEffect
            - If you need to fetch data in response to a user action (like clicking a button), you can just call an async function 
            directly — no useEffect needed

        Look at your own handleLike function — that fetches and updates Supabase data but it's NOT inside useEffect because it only 
        runs when the user clicks the like button.
        So useEffect is specifically for "do this automatically when the component loads or when something changes." User-triggered 
        actions don't need it.
        */

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
    },[]) /* empty dependency array means useEffect runs once when the component first loads. This does not
    yet update in real time when someone uploads. */

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

