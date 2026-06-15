import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../context/AuthContext' 

function Feed(){ /* Thought process: I need a function to load and display posts (images, usernames, captions) and 
    likes when the feed page is opened.  */
    const [posts, setPosts] = useState([]) 
    const [likes, setLikes] = useState([])
    const { user } = useAuth() 

    useEffect(()=>{ /* Thought process: (after creating updateFeed and fetchLikes functions)  I want them both in useEffect because 
        I want all of this to show right when the component is loaded, meaning the user opens the Feed page.  */
        async function updateFeed(){ /* Thought process: I need a function to fetch posts and usernames from Supabase and display them*/
            try {
                const {data, error} = await supabase.from('posts').select('*, profiles(username)') 
                if (error) throw error
                setPosts(data)
            }catch(err){
                console.error(err.message) 
            }
        }

        async function fetchLikes(){ /* Thought process: I need a function to fetch likes data from Supabase so the like counts and 
            heart state can be displayed */
            try {
                const {data, error} = await supabase.from('likes').select('*')
                /* If you forget what the Supabase object returns and that its called data and error, change the code above
                to replace {data, error} with 'response', then console.log(response) immediately after. Then you must make sure 
                your app is running, by going to http://localhost:5173/feed, then open Chrome dev tools with F12, click the Console 
                tab, and you'll see the logged response there. */
                if (error) throw error
                setLikes(data) /* fills likes array with reak data */
            }catch(err){
                console.error(err.message)
            }
        }
        updateFeed()
        fetchLikes()
    },[]) 

    async function handleLike(postId){ /* Thought process: Now I need a function that handles liking and unliking a post when the 
        button is clicked. Takes postId as a parameter — the id of the post whose button was clicked, passed in from the JSX. */
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

