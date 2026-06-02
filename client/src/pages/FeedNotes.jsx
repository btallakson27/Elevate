import { useState, useEffect } from 'react'
import {supabase} from '../supabaseClient.js'

function Feed(){ 
    const [posts, setPosts]=useState([]) /*State variables must be declared at the top of the component, 
    not inside useEffect or try.  */

    useEffect(()=>{ /* need useEffect hook (a special React function), it runs once when the 
        component first loads, not every time a new image is posted. To update in real time you'd need 
        something extra, but for now once on load is fine. When a user navigates to the feed page, React 
        loads the Feed component, and the useEffect runs automatically at that moment, fetching all the 
        posts from Supabase.*/
        async function updateFeed(){ /* need this function inside of useEffect since useEffect can't
            be async. */
            /* now it's time to actually try to update the feed */
            try {
                const {data, error}= await supabase.from('posts').select('*') /* .from() specifically looks in 
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
        updateFeed()
    },[])
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
                    <img src={post.image_url} alt={post.caption} />
                    <p>{post.caption}</p>
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