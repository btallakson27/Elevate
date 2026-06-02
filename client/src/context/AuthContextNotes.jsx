/* 
What is a context file? A context file is just any file whose main job is to create and manage a React Context.
Remember what context does — it creates a broadcast that shares data across your entire app without prop drilling. Any file that sets up that broadcast is considered a context file.
If you find yourself passing the same prop through multiple components just to get it somewhere deep in your app, that's the signal to make a context file instead.
Auth is the classic example — you need to know who's logged in almost everywhere in your app. Without context you'd have to pass user as a prop from main.jsx down to App.jsx down to every page down to every component that needs it. That's a nightmare.
With context you just call useAuth() anywhere and you're done.

AuthContext.jsx qualifies because it:

Creates a context with createContext()
Sets up a provider that broadcasts data
Exports a custom hook to consume that data

That's the pattern. If a file does those three things, it's a context file. That's why it lives in the context folder.

Full explanation of what's going on here in your Google docs. Title: AuthContext.jsx (from Elevate) — In My Own Words */

import { createContext, useContext, useEffect, useState } from 'react' /* imports various tools from the react library*/
import { supabase } from '../supabaseClient' /* Imports the supabase connection object that you created
in supabaseClient.js. Remember that file creates the connection to your Supabase project using your URL and 
anon key. This line just pulls that already-configured connection into AuthContext.jsx so you can use it here.
*/ 

const AuthContext = createContext() /* creates the empty container that will eventually hold the auth state and share it across the app.
Auth state is just the answer to these 2 questions:
  Is someone logged in?
  If yes, who are they?
In your code that's represented as the user variable — either a user object or null.

In regards to AuthContext.Provider below — when you call createContext() it doesn't 
just create an empty container, it creates an object that has a .Provider component built into it. That .Provider is what 
actually does the broadcasting. You wrap your app in it and pass value={{ user, loading }} which is what gets broadcast to 
every component inside it.
*/

export const AuthProvider = ({ children }) => { /* creates and exports a component called AuthProvider that accepts whatever is nested inside it as children. 
  If you look at main.jsx you will see that your entire app is wrapped inside AuthProvider, making the nested children your entire app. <App /> contains your entire 
  app, every page, every component. That's why any component anywhere in Elevate can call useAuth() and get the current user — because AuthProvider is wrapped 
  around all of it, sharing that auth state down to everything inside. You never see a variable literally called authState anywhere in the code. "Auth state" is just 
  a concept — a way of describing what the code is tracking. The actual implementation of that concept is just these two variables:
    user — who is logged in (or null)
    loading — are we still checking
  
  AuthProvider is doing four things:
  1. Setting up two pieces of state (lines 8-9)
  It creates a user variable to hold whoever is logged in (starts as null meaning nobody) and a loading variable to track whether it's still checking (starts as true).
  2. Checking if someone is already logged in (lines 12-15)
  When the app first loads it asks Supabase "is anyone already logged in?" If yes, it saves that user. Then it sets loading to false because it's done checking.
  3. Listening for login/logout events (lines 18-20)
  It sets up a listener that watches for any auth changes. If someone logs in or out anywhere in the app, this catches it and updates the user state immediately.
  4. Sharing that info with the whole app (lines 25-29)
  It wraps everything in AuthContext.Provider and passes user and loading down to the entire app. This is the broadcast — any component that needs to know who's logged in can just tune in.
  And the cleanup (line 22)
  When the component unmounts it unsubscribes from that listener so it doesn't keep running in the background.
  Everything in this file exists to answer one question for the rest of your app: who is logged in right now?
*/

  const [user, setUser] = useState(null) /* begins as null because the app opens with no one logged in. */ 
  const [loading, setLoading] = useState(true) /* When the app first loads or when a user refreshes the page, React starts from scratch with user as null. 
  It then needs a split second to check with Supabase whether a session already exists. During that moment, loading is true which tells the app "don't render 
  any routes yet, we're still checking." Once Supabase responds and confirms whether a session exists or not, setLoading(false) runs and the app renders the correct page.
  Without loading starting as true, a logged-in user would briefly see the login page every time they refresh — because for that split second user is null and the app 
  would think nobody is logged in.*/

  useEffect(() => { /* Most complex part of the file, the useEffect block. useEffect is a React hook that lets you 
    run code after the component renders. It's for anything that needs to happen as a side effect of the component 
    loading — things like fetching data, setting up listeners, or connecting to external services. In your case, when 
    AuthProvider first loads, useEffect runs and does two things:
      1. Checks if a session already exists in Supabase
      2. Sets up a listener for future login/logout events

    The [] at the end is the dependency array. When it's empty like this, it means "only run this once — when the component first mounts." 
    If you put variables inside it, the effect would re-run whenever those variables change. A simple analogy: think of useEffect like an 
    "on open" automation. When the component opens, run this code. The [] says run it once and don't run it again.*/

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => { /* When someone opens your app, your app has no idea who's 
      logged in. It needs to ask Supabase "hey, is anyone already logged in right now?" — that's what getSession() does. 
      It's a one time check that happens the moment the app loads. Think of it like walking into a building and the 
      security guard checks your badge once to see if you're already cleared to be there. The reason it lives inside useEffect 
      is because it's talking to Supabase, which lives outside of React. React has a rule — if you need to talk to something 
      outside of React (like a database, an API, the browser), do it inside useEffect, not directly in the component. It's just 
      React's way of keeping things organized and predictable. The component is AuthProvider above, and you know it's the component
      because that's a function that returns JSX - which is the definition of a React component. */
      setUser(session?.user ?? null) /* user in AuthContext comes from Supabase — specifically from session?.user. Supabase defines 
      what's inside that user object, not your code. So user.id isn't something you'd see written anywhere in your own files — it's 
      a property that Supabase attaches to every user automatically. 
      
      To know what's available on the user object, you have two options:

      1. Check the Supabase docs — they document everything on the user object (id, email, created_at, user_metadata, etc.)
      2. Console.log it — in any component where you have access to user, just add console.log(user) temporarily and look at the output 
      in your browser dev tools. That shows you exactly what's there. To do this, temporarily add the code below after the 
      const { user } = useAuth() line in your Upload component: console.log(user) then cd client, npm install to install the dependencies
      including Vite. Then run npm run dev. AFter that open devtools, make sure you're on the "Upload" page, console tab, click on something.
      
      The console.log approach is actually what most developers do in practice — it's faster than reading docs and shows you the real data 
      your app is working with.*/
      
      setLoading(false) /* runs regardless of whether someone is logged in or not.  It just means "we got a response 
      from Supabase, we're done checking, render the app now." The user could be logged in or not — either way loading is done.  */
    })

    // Listen for auth changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      /* onAuthStateChange is different from getSession() because it's not a one time check — it's a continuous listener that stays active. 
      It watches for any auth event that happens after that initial check. So if a user logs in, logs out, or their token refreshes, 
      onAuthStateChange catches it in real time and updates the app immediately.
      So together they cover two different scenarios:
      - getSession() — "who's logged in right now when the app first loads?"
      - onAuthStateChange — "tell me any time the auth status changes from here on out" 
      
      _event is the type of auth event that happened (like "SIGNED_IN" or "SIGNED_OUT"). The underscore at the front is a convention 
      that means "I'm not using this variable." session is the actual session data. So you're essentially saying "I don't care what the 
      event was, just give me the session." An event still has to happen to trigger onAuthStateChange. It fires on any auth event — login, 
      logout, token refresh, password recovery, etc. You're just saying "whatever the event was, I don't need to know which one, just give 
      me the resulting session."
      */
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe() /* The cleanup doesn't run before mounting — it runs before unmounting or before the 
    effect runs again. In this case since the dependency array is empty [], the effect only runs once, so the cleanup only runs 
    when the component unmounts entirely — meaning when your app shuts down or the AuthProvider is removed from the page.
    The reason unsubscribe() needs to be there is because onAuthStateChange sets up a continuous listener that keeps running in the 
    background. Without the cleanup, even if the component unmounts, that listener would still be alive, still listening, wasting 
    resources and potentially causing bugs.
    So in plain language — when the app is done, clean up after yourself and turn off the listener.*/
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}> {/* AuthContext.Provider — when you call createContext() it doesn't just create an 
    empty container, it creates an object that has a .Provider component built into it. That .Provider is what actually does the broadcasting. 
    You wrap your app in it and pass value={{ user, loading }} which is what gets broadcast to every component inside it. On broadcasting — 
    remember earlier we talked about how context works like a TV broadcast? The .Provider is literally the transmitter. When you wrap your 
    app in <AuthContext.Provider value={{ user, loading }}> you're saying "everything inside this has access to user and loading." Any 
    component that calls useAuth() is tuning into that signal. That's what broadcasting means here — one source, available everywhere inside it.

    On why it's user and loading and not setUser and setLoading — great catch. You only pass user and loading because the rest of your app 
    only needs to read who's logged in, not change it. setUser and setLoading stay private inside AuthProvider because only AuthProvider 
    should be responsible for updating auth state. If you passed setUser down, any random component could change who's logged in, which 
    would be a mess.
    */}
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 
/* useAuth is the remote control that individual components use to tune into that broadcast. So instead of writing this every time:
const { user, loading } = useContext(AuthContext)

You just write:
const { user, loading } = useAuth()
It's a convenience hook that wraps useContext(AuthContext) so you don't have to repeat yourself in every component that needs auth data.

You export useAuth so it can get imported anywhere in your app that needs to 
know who's logged in. For example, your ProtectedRoute
.jsx component calls const { user, loading } = useAuth() to decide whether 
to show a page or redirect to login. You also write this line instead of every component having to write useContext(AuthContext), 
they just call useAuth(). It saves repeating yourself everywhere.
*/

/* ----------------------------- PRACTICE ----------------------------- */

function Practice1(){
  useEffect(()=>{
    console.log('App loaded')
  }, [])
}

function Practice2(){
  const [count, setCount] = useState(0)

  useEffect(()=>{
    console.log("Count changed to:", count)
  }, [count])
}

function Practice3(){
  useEffect(()=>{
    const timer = setInterval(() => { /* setInterval runs a function repeatedly on a timer. Meaning, it runs the function again after the amount
      of time you indicate. */
      console.log('tick')
    }, 1000) // 1000 milliseconds = 1 second
        
    return () => {
      clearInterval(timer) /* clearInterval stops it — but it needs a reference to the timer to know which one to stop */
    }
  }, [])
}