import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../context/AuthContext' /* part of setting up the likes button. 
need to get the logged in user so we know their user_id */

function Feed(){
    const [posts, setPosts] = useState([]) /*State variables must be declared at the top of the component, 
    not inside useEffect or try.  */
    const [likes, setLikes] = useState([])
    const { user } = useAuth() /* useAuth gives you user and loading from AuthContext. 
    Here we only destructure user because we need user.id to identify who is liking a post. 
    user gives us every
    */

    useEffect(()=>{ /* need useEffect hook (a special React function), it runs once when the 
        component first loads, not every time a new image is posted. To update in real time you'd need 
        something extra, but for now once on load is fine. When a user navigates to the feed page, React 
        loads the Feed component, and the useEffect runs automatically at that moment, fetching all the 
        posts from Supabase.*/
        async function updateFeed(){ /* need this function inside of useEffect since useEffect can't
            be async. */
            /* now it's time to actually try to update the feed */
            try {
                const {data, error} = await supabase.from('posts').select('*') /* .from() specifically looks in 
                supabase data tables, and we indicate which table we want by saying 'posts'. 
                .select() tells supabase what we want to select from the table, and '*' means everything.
                data and error are both returned from the returned supabase object, but this differs from
                the Upload file because we actually need to get data from supabase. But why don't we need to 
                name the error something else so we can differentiate between the different types of errors? 
                you don't need to rename it here because there's only one error variable in this function, 
                unlike Upload.jsx where you had uploadError and insertError to avoid conflicts.
                
                But you need to do something with data — right now you fetch it but never store it anywhere. 
                You need a state variable to hold the posts so you can display them. Add useState to your 
                imports and create a state variable for the posts:*/
                if (error) throw error
                setPosts(data)
            }catch(err){
                console.error(err.message) /* console.error vs console.log — actually both are for you the 
                developer, not the user. The difference is just visual — console.error shows up in red in 
                the dev tools console, console.log shows up normally. Neither is visible to the user. */
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
            /* 
            supabase.from('likes') — target the likes table
            .delete() — delete a row
            .eq('id', existingLike.id) — but only the row where id matches existingLike.id
            const {error} = — destructure the error from the result so we can check if something went wrong

            So the line itself just does the delete. The error check happens on the next line:
            */
            if(!error) setLikes(likes.filter(like => like.id !== existingLike.id))
            /*
            if(!error) — if the delete succeeded
            setLikes() is going to change our local state to whatever happens inside the parenthesis
            likes here is the local state array, not something being returned from Supabase in that moment. We fetched it 
            from Supabase earlier and stored it in state, but right now we're just working with the local copy.
            So: likes.filter loops through each element in our local likes array. 
            
            .filter() keeps elements that return true and removes elements that return false. So:
            like.id !== existingLike.id means — keep this like if its id is not the one we just deleted.
            So the whole thing is saying: give me every like in the array except the one we deleted. The result is a new array with that 
            like removed, and setLikes() replaces our state with that new array.

            The key concept is that we already deleted it from Supabase on the line above. This line just keeps our local
             state in sync so the UI updates instantly without needing to re-fetch everything from Supabase.
            */
        } else {
            const {data, error} = await supabase.from('likes').insert({user_id: user.id, post_id: postId}).select()
            if(!error) setLikes([...likes, data[0]])
        }
    }
    {/* the component needs to return some JSX to display the posts. Without it the page will be blank.
        so what do we need to show the user? the data. but what data? When you call .select('*') the * means 
        "give me everything", so data comes back as an array of post objects, and each post object contains all 
        the columns from your posts table — image_url, caption, medium, dimensions, for_sale, price, user_id, 
        created_at, and id. 
        
        And I want every post to be in it's own div and contain the user_id at top, then the image, and the 
        caption below the image. but the image isn't here. It's in the strage bucket 'post-images'.
        return notes above */}
    return(
        <div>
            {/* Where does the post data live? in the state variable 'posts' above.
            Iterating over posts — you have an array of posts, so you need to loop 
            through them. In React you use .map() for this. */}
            {posts.map((post)=>(
                <div key={post.id}> {/* each image needs it's own unique key, which we set as the post.id */}
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

/*  
Now you need to do two things to wire it up:

    1. Import it in App.jsx
    2. Add a route for it in App.jsx*/