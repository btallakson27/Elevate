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

    async function handleLike(postId){ /* the function must take a parameter so we know which specific post was clicked. Since we can 
        identify a post by its post_id, we pass that in as the parameter and call it postId. */
        const existingLike = likes.find(like => like.post_id === postId && like.user_id === user.id)
        /* This line tells us whether the user already liked the post. If it finds a match, they liked it. If it returns undefined, they 
        haven't. likes.find isn't looking for the most recent like. It's looking for a like that matches both the specific post AND the 
        specific user. There's no time element involved. so .find() is an array method that literally searches the array to find 
        something specific. It loops through every element in the array one by one and returns the first element where the condition 
        is true. If nothing matches, it returns undefined. is an arrow function passed directly as an argument — it's short, anonymous, 
        and used inline when you just need a quick one-liner*/
        if(existingLike){
            const {error} = await supabase.from('likes').delete().eq('id', existingLike.id) 
            /* 
                By the time we reach this line we already know there's a row to delete because existingLike found one on the line above. 
                So we're not checking if a row exists here. This line is just executing the delete and capturing whether the operation 
                itself succeeded or failed. An error here would come from something like a network issue or a Supabase permissions problem — 
                not from a missing row. The row existence check already happened with existingLike. This line just does the actual deleting.
                .delete() tells Supabase to delete a row from the likes table. 
                .eq('id', existingLike.id) — this is the filter that says which row to delete. eq stands for "equal", so it's saying: 
                only delete the row where the id column equals existingLike.id. Without .eq() Supabase would delete everything in the 
                likes table. The .eq() is what targets the specific row you want gone.

                Think of it like two separate instructions chained together:
                - delete() — what to do
                - eq('id', existingLike.id) — which row to do it to

            So the line itself just does the delete. Remember existingLike found a matching like in the array, which means this user 
            has already liked this post. So clicking the button again means they want to unlike it — which means removing that row 
            from the likes table. The error check happens on the next line.
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

