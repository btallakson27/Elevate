import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js' /* in braces because it's an established variable name. Must import to connect to Supabase. 
    Without this, you have no access to Supabase at all. It gives you the Supabase client 
    and all its methods like .from(), .select(), .insert(), etc. */
import { useAuth } from '../context/AuthContext' /* part of setting up the likes button. 
    need to get the logged in user so we know their user_id */

function Feed(){ /* Thought process: I need a function to load and display posts (images, usernames, captions) and 
    likes when the feed page is opened.  */
    const [posts, setPosts] = useState([]) /* State variables must be declared at the top of the component, 
    not inside useEffect or try. For posts state and likes state just below this, [] is the initial value of the state. 
    It starts as an empty array because we haven't fetched any data yet, but also because Supabase returns multiple rows of data, 
    and multiple items naturally live in an array so you can loop through them with .map(), .filter(), .find() etc. 
    useState() with nothing inside also sets the initial state, but it would be undefined, not an empty array. 
    The difference matters because if posts is undefined and you try to call posts.map() before data loads, it will crash. 
    But if posts starts as [], calling posts.map() on an empty array is totally fine — it just returns nothing until data arrives.
    */
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

    useEffect(()=>{ /* Thought process: (after creating fetchPosts and fetchLikes functions)  I want them both in useEffect because 
        I want all of this to show right when the component is loaded, meaning the user opens the Feed page.
        
        need useEffect hook (a special React function), it runs once when the 
        component first loads (when the user opens the page), not every time a new image is posted. To update in real time you'd need 
        something extra, but for now once on load is fine. When a user navigates to the feed page, React 
        loads the Feed component, and the useEffect runs automatically at that moment, fetching all the 
        posts from Supabase.
        
        the functions below must be inside useEffect because fetching data from an external source (Supabase) is considered a 
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
        async function fetchPosts(){ /* Thought process: I need a function to fetch posts and usernames from Supabase and display them
            need this function inside of useEffect since useEffect can'tbe async. 
            now it's time to actually try to update the feed */
            try {
                const {data, error} = await supabase.from('posts').select('*, profiles(username)') 
                /* .from() specifically looks in supabase data tables, and we indicate which table we want by saying 'posts'. 
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

        async function fetchLikes(){ /* Thought process: I need a function to fetch likes data from Supabase so the like counts and 
            heart state can be displayed */
            try {
                const {data, error} = await supabase.from('likes').select('*')
                /* destructuring — extracting both data and error from the object that Supabase returns. You need data to fill the 
                likes array and error to check if something went wrong. 
                
                If you forget what the Supabase object returns and that its called data and error, change the code above
                to replace {data, error} with 'response', then console.log(response) immediately after. Then you must make sure 
                your app is running, by going to http://localhost:5173/feed, then open Chrome dev tools with F12, click the Console 
                tab, and you'll see the logged response there.
                */
                console.log(data)
                if (error) throw error
                setLikes(data) /* fills the likes array with real data. */
            }catch(err){
                console.error(err.message)
            }
        }

        fetchPosts()
        fetchLikes()
    },[]) /* empty dependency array means useEffect runs once when the component first loads. This does not
    yet update in real time when someone uploads. */

    async function handleLike(postId){ /* Thought process: Now I need a function that handles liking and unliking a post when the 
        button is clicked. Takes postId as a parameter — the id of the post whose button was clicked, passed in from the JSX. */
        const existingLike = likes.find(like => like.post_id === postId && like.user_id === user.id)
        /* The line above says, "return the existingLike by searching through the local likes array for an element (like) in the array
        where the post_id matches the one where the like button was clicked and the user_id of the element (like)  being iterated over (checked)
        matches the user.id, which is the id of the logged in user, which we need to deconstruct from useAuth by first importing it, then 
        destructing the user out of it. 
        
        The reason you can't just write likes.user_id is because likes is an array, not a single object. You'd need to 
        specify which like's user_id you want. More importantly, user.id comes from AuthContext and represents the currently logged in 
        user — that's the specific user you need to match against, not just any user_id in the likes array."
        The like object would look something like this:
        {
          id: 'abc123',
          post_id: '77214cae-ae30-4f31-ac1e-5cfed163525c',
          user_id: 'xyz789',
          created_at: '2026-06-11T00:00:00'
        }

        */
        if(existingLike){ /* a matching like was found, meaning the post was already liked */
            const {error} = await supabase.from('likes').delete().eq('id', existingLike.id) 
            /* so we delete that row from Supabase (unlike it) 
            The error in const {error} is an actual error message that will show if and only if this part of the code, 
            await supabase.from('likes').delete().eq('id', existingLike.id), didn't work. 
            
            Sso this one line does two things:

                1. Executes the delete operation on Supabase
                2. Destructures the error from the response so you can check if it worked

            The const {error} = part isn't setting error to anything manually — it's just extracting the error property from whatever 
            Supabase sends back after the delete runs.

                By the time we reach this line we already know there's a row to delete because existingLike found one on the line above. 
                
                Executes the delete on the likes table. Two chained instructions:
                - .delete() — what to do
                - .eq('id', existingLike.id) — which row to delete (where id matches existingLike.id)
                Without .eq(), Supabase would delete everything in the likes table.
                error captures whether the operation succeeded or failed (network issues, permissions, etc.)
                The actual error check happens on the next line.
            
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
            /*
            if(!error) — if there was no error (the delete succeeded)
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
        } else { /* This addresses what to do if existingLike is not true, meaning the post has not been liked. 
            In this case we want to insert the user_id, and post_id in order to add all data to the row in supabase likes table. 
            If there is an error, we have console.error to log the error message to the developer console. But if there is not, we 
            fill the local likes array with every like and data[0], which is the entire like object that Supabase returns after the 
            insert — all four columns: id, post_id, user_id, and created_at. So [...likes, data[0]] means spread all the existing likes 
            into a new array and add the newly inserted like object at the end. That's what keeps local state in sync after the insert.*/
            const {data, error} = await supabase.from('likes').insert({user_id: user.id, post_id: postId}).select()
            if(!error) setLikes([...likes, data[0]])
            else console.error(error.message)
        }
    }
    {/* the component needs to return some JSX to display the posts. Without it the page will be blank.
        so what do we need to show the user? the data. but what data? When you call .select('*') the * means 
        "give me everything", so data comes back as an array of post objects, and each post object contains all 
        the columns from your posts table — image_url, caption, medium, dimensions, for_sale, price, user_id, 
        created_at, and id. 
        
        And I want every post to be in it's own div and contain the user_id at top, then the image, and the 
        caption below the image. but the image isn't here. It's in the storage bucket 'post-images'.
        return notes above */}
    return(
        <div> 
            {/* Why div? 
            No specific reason — div is just the default go-to container in React. It has no semantic meaning, it just wraps things. 
            You could use section, main, or article and it would work the same way functionally.
            The difference is semantic HTML — using section or main gives the browser and screen readers more context about what the 
            content is. For example main signals "this is the main content of the page" and section signals "this is a distinct section."
            For now div is fine, but as Elevate grows you might want to swap it for more meaningful tags for accessibility and SEO purposes.
            
            Where does the post data live? in the state variable 'posts' above.
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
                    <img src={post.image_url} alt={post.caption}></img> {/* user CAN see alt text in some situations.
                    
                    */}
                    <p>{post.caption}</p>
                    <button onClick={() => handleLike(post.id)}> {/* users CAN see the alt text in some situations, like when 
                    the image fails to load. It also helps screen readers describe the image to visually impaired users. 
                    So it's not invisible — it's a fallback and accessibility tool. */}
                        {likes.some(like => like.post_id === post.id && like.user_id === user?.id) ? '❤️' : '🤍'}
                        {/* Why a ? after user? That's the optional chaining operator. It means "only try to access .id if user 
                        exists — if user is null or undefined, don't crash, just return undefined."
                        It's there because when the Feed component first loads, there's a brief moment where user might still be 
                        null before AuthContext finishes loading. Without the ?, trying to access user.id when user is null would 
                        throw an error and crash the app.    

                        .some() loops through the likes array and checks if at least one like matches both conditions: the post_id 
                        matches the current post AND the user_id matches the logged in user. If true it shows ❤️, if false it shows 🤍.
                        Either the user has liked the post (1 matching like) or they haven't (0 matching likes). A user can only like a 
                        post once, so it will always be 0 or 1. .some() just returns true if it finds even one match, which is all you need here.

                        */}
                    </button>
                    <p>{likes.filter(like => like.post_id === post.id).length} likes</p> 
                    {/* filter through the local likes array, keep only the likes where post_id matches this post (the current post being
                    mapped over), then count how many were kept with .length. That number is the like count displayed to the user. 
                    For every post in the feed, it filters the likes array to find all likes for that specific post and displays the count. 
                    It runs for every post automatically as the feed renders.
                    */}
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