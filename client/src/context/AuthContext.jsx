import { createContext, useContext, useEffect, useState } from 'react' 
import { supabase } from '../supabaseClient' 

const AuthContext = createContext() 

export const AuthProvider = ({ children }) => { 
  const [user, setUser] = useState(null) 
  const [loading, setLoading] = useState(true) 

  useEffect(() => { 
    supabase.auth.getSession().then(({ data: { session } }) => {
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
      setLoading(false) 
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

useEffect(()=>{}, [dependency])
useEffect(()=>{}, [dependency])
useEffect(()=>{}, [dependency])