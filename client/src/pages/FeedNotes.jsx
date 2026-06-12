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

    useEffect(()=>{ /* need useEffect hook (a special React function), it runs once when the 
        component first loads, not every time a new image is posted. To update in real time you'd need 
        something extra, but for now once on load is fine. When a user navigates to the feed page, React 
        loads the Feed component, and the useEffect runs automatically at that moment, fetching all the 
        posts from Supabase.*/
        async function updateFeed(){ /* need this function inside of useEffect since useEffect can't
            be async. */
            /* now it's time to actually try to update the feed */
            try {
                const {data, error} = await supabase.from('posts').select('*, profiles(username)') /* .from() specifically looks in 
                supabase data tables, and we indicate which table we want by saying 'posts'. 
                .select() tells supabase what we want to select from the table, and '*' means everything.
                data and error are both returned from the returned supabase object, but this differs from
                the Upload file because we actually need to get data from supabase. But why don't we need to 
                name the error something else so we can differentiate between the different types of errors? 
                you don't need to rename it here because there's only one error variable in this function, 
                unlike Upload.jsx where you had uploadError and insertError to avoid conflicts.
                
                But you need to do something with data — right now you fetch it but never store it anywhere. 
                You need a state variable to hold the posts so you can display them. Add useState to your 
                imports and create a state variable for the posts:
                
                this part, '*, profiles(username)', says: in supabase, give me all table data from the posts table,
                as well as the username from the profiles table, using the relationship between user_id in posts 
                and id in profiles..
                */
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
                /* HERE is where all of the likes are fetched from Supabase. */
                if (error) throw error
                setLikes(data) /* fills the likes array with real data. */
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
        /*checks whether the current user has already liked a specific post. So when you click the like 
        button on a post, likes.find() searches through the local likes array and asks "is there already 
        a like in here where both the post_id matches this post AND the user_id matches the logged in user?"
        If it finds one, existingLike holds that like object. If it doesn't find one, existingLike is undefined.
        That result is what drives the toggle — found it means unlike, didn't find it means like. 
        
        This is the key thing to understand. likes starts as an empty array, but by the time a user clicks 
        the like button, fetchLikes() has already run and filled it with data from Supabase.
        Remember the order of events:

        1. Component loads
        2. useEffect runs fetchLikes() which fetches all likes from Supabase
        3. setLikes(data) fills the likes array with real data
        4. Then the user clicks a like button. This happens in your JSX at the bottom of Feed.jsx,
            this line: <button onClick={() => handleLike(post.id)}> When the user clicks that button, it calls 
            handleLike and passes in the post.id of whichever post they clicked. That's the moment existingLike 
            gets looked up.
        5. Now likes.find() has actual data to search through

        So by step 4, likes is no longer empty — it's full of like objects from Supabase. 
        */
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
                    <h3>{post.profiles.username}</h3> {/* displays usernames above art images on feed page. 
                    Even though posts and profiles are two separate tables in supabase, we must use post.profiles 
                    to access the information inside of the profiles table. The reason for this boils down to the 
                    relationship between the two tables Since user_id in posts matches id in profiles, Supabase 
                    knows they're connected. When you ask for profiles(username) in your select query, Supabase 
                    automatically does the join behind the scenes and nests the profiles data inside each post 
                    object before sending it back to your frontend. So it's two separate tables in Supabase, but 
                    by the time the data arrives in your React app it's one combined object. 

                    And you might be thinking, "I get the logic but still don't know why the profiles table is nested 
                    inside the post table. to me, they are the same level of heirarchy."

                    That's a fair observation. They are equal in Supabase — neither table is "above" the other. The nesting 
                    isn't about hierarchy, it's just how Supabase chooses to format the response when you join tables.
                    
                    Think of it this    way — your query started with posts, and you asked Supabase to "also bring along" 
                    some profiles data. So Supabase puts posts as the base object and attaches the profiles data onto it as 
                    a nested property. It could have been done the other way around if you had started your query from the 
                    profiles table instead.
                    
                    So the nesting is just a result of which table you called .from() on — that table becomes the base, and 
                    everything else gets nested inside it.
                    */}
                    <img src={post.image_url} alt={post.caption}></img>
                    <p>{post.caption}</p>
                    <button onClick={() => handleLike(post.id)}> {/* When the user clicks that button, it calls 
            handleLike and passes in the post.id of whichever post they clicked. That's the moment existingLike 
            gets looked up. */}
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