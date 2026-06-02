import { useEffect } from 'react'
import {supabase } from './supabaseClient.js'
/* useAuth — you might not actually need it for the feed. If your RLS policy says "posts are viewable by everyone" 
(which it does, you saw that earlier), anyone can view the feed without needing to verify who they are. You'd only 
need useAuth if you wanted to do something user-specific like show a heart icon as filled if the logged-in user 
already liked a post. Keep it simple for now and leave it out. */

async function Feed (){ /* The reason it needs to be async is because fetching data from Supabase takes time — your 
    app has to make a network request to Supabase's servers and wait for the response to come back. async/await is 
    what lets your app wait for that response before trying to use the data.*/

    useEffect(()=>{ /* useEffect is a hook and a hook is just a special function that React provides that lets you do 
        certain things inside a component. The reason we need it here is because you want the posts to load automatically 
        when the component first renders, not in response to a user action like clicking a button or submitting a form. 
        useEffect is what lets you say "run this code when the page loads" — without it you'd have no way to trigger the 
        fetch automatically.*/
        const fetchPosts = async ()=>{ /* useEffect doesn't allow you to put async directly on its callback function. 
            So the workaround is to define an async function inside it and call it immediately. That's the standard 
            pattern every React developer uses.*/
            try {
                const { data, error} = await supabase.from('posts').select('*')
                /* You need data too, not just error — that's where the actual posts come back.

                Any time you want to access a database table in Supabase, you use supabase.from(). 
                The '*' means "give me all columns."

                Anytime you want to read data from a table, you use .select() Think of it like this:
                - insert() — add a new row
                - select() — read existing rows
                - update() — change an existing row
                - delete() — remove a row

                For the feed you want to read all the posts, so you'll use select()
                */

                if (error) throw error
                // do something with data
            }catch(err){
                console.error(err.message)
            }
        }
        fetchPosts()
    },[])

}