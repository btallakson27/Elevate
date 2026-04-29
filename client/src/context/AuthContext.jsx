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
*/

export const AuthProvider = ({ children }) => { /* creates and exports a component called AuthProvider that accepts whatever is nested inside it as children. 
  If you look at main.jsx you will see that your entire app is wrapped inside AuthProvider, making the nested children your entire app. <App /> contains your entire 
  app, every page, every component. That's why any component anywhere in Elevate can call useAuth() and get the current user — because AuthProvider is wrapped 
  around all of it, sharing that auth state down to everything inside. You never see a variable literally called authState anywhere in the code. "Auth state" is just 
  a concept — a way of describing what the code is tracking. The actual implementation of that concept is just these two variables:
    user — who is logged in (or null)
    loading — are we still checking*/
  const [user, setUser] = useState(null) /* begins as null because the app opens with no one logged in. */ 
  const [loading, setLoading] = useState(true) /* When the app first loads or when a user refreshes the page, React starts from scratch with user as null. 
  It then needs a split second to check with Supabase whether a session already exists. During that moment, loading is true which tells the app "don't render 
  any routes yet, we're still checking." Once Supabase responds and confirms whether a session exists or not, setLoading(false) runs and the app renders the correct page.
  Without loading starting as true, a logged-in user would briefly see the login page every time they refresh — because for that split second user is null and the app 
  would think nobody is logged in.*/

  useEffect(() => { /* Most complex part of the file, the useEffect block. useEffect is a React hook that lets you run code after the component renders. It's for anything 
    that needs to happen as a side effect of the component loading — things like fetching data, setting up listeners, or connecting to external services. In your case, when 
    AuthProvider first loads, useEffect runs and does two things:
      1. Checks if a session already exists in Supabase
      2. Sets up a listener for future login/logout events

    The [] at the end is the dependency array. When it's empty like this, it means "only run this once — when the component first mounts." If you put variables inside it, 
    the effect would re-run whenever those variables change. A simple analogy: think of useEffect like an "on open" automation. When the component opens, run this code. 
    The [] says run it once and don't run it again.*/
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)