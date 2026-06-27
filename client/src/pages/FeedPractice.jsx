import {useEffect, useState} from 'react'
import {supabase} from '../supabaseClient.js' 

function Feed(){
    const [posts, setPosts] =useState([])
    const [likes, setLikes] = useState([])

    /* since I want both of these things to happen when the component (feed page) first loads, we need this insider of useEffect. */
    useEffect(()=>{
        async function fetchPosts(){
        try{
            const {data, error} = await supabase.from('posts').select('*, profiles(username)') /* I know I want all the info from the posts table in order
            to create the posts. But I also want hte username to display at the top, instead of the weird number that shows, which is why
            I also select the username from the profiles table. But how do we get the username from the profiles table? can access it by simply 
            writing the name of the table then the row we want inside parenthesis. They're in one string because that's just how Supabase's .select() syntax 
            works — it takes a single string and parses it. The * means everything from posts, and profiles(username) tells it to also join the profiles table. */
            if (error) throw error /* but why do I want to throw it opposed to just console.err? I'm assuming because if there
            is an error, we don't want anything posted. */
            setPosts(data) 
        }catch(err){
            console.error(err.message) /* for me, the developer. */
        }
    }

    async function fetchLikes(){
        try {
            const {data, error} = await supabase.from('likes').select('*')
            if (error) throw error
            setLikes(data)
        }catch(err){
            console.error(err.message) /* for me, the developer. */
        }
    }
    fetchPosts() /* must actually call both functions so they run. */
    fetchLikes()
},[]) /* use effect can't be async and must take a dependency array. */
    

/* Now we have all post and likes info stored within 2 setState variables. Lovely. But Things need to happen with the like button, which
we will handle in our next function. */

async function handleLike(postId){ /* the postID represents the id from the posts table in supabase that correlates with the clicked like button
        we're looking for the posts id and the user_id's both to match. we must know this to truly know who clicked the like button and for
        which post. why must we make the "user" variable above and write "user.id" here? I was thinking I could just write "likes.user_id".
        
        */
        const existingLike=likes.find(like => postId === like.post_id && like.user_id === user.id)
    
    }
}
