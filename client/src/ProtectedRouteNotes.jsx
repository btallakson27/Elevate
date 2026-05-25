/* A protected route is just a route that requires the user to be logged in to access it.
Without protection, anyone could type yourapp.com/upload directly into the browser and reach that page even if they're not logged in. 
A protected route intercepts that and says "do you have a valid user? No? Then go to login instead."
In Elevate's case:

/login and /signup — not protected, anyone can visit these
/upload and / — protected, only logged in users should see these

That's literally all ProtectedRoute.jsx is doing. It checks user — if there is one, show the page, if not, redirect to login. 
The component just gives that logic a clean reusable home. */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' /* useAuth is the remote, and importing brings it into the room. 
Any component that needs to tune in imports and calls it, and gets back whatever the broadcast is currently sending */

function ProtectedRoute({ children }) { /* You won't know to make children as an argument until you work on the App.jsx file. 
  Once you do that, this function must now take {children} as an argument because ProtectedRoute is now a wrapper — it wraps around 
  other components like <Upload/> — and children is how React refers to whatever is nested inside a component.
  When you write this in App.jsx: <ProtectedRoute><Upload/></ProtectedRoute>
  <Upload/> is the child. Without { children } as an argument, ProtectedRoute would have no way to access or render it.
  */
    const { user, loading } = useAuth() /* Here you're saying "tune in and give me these two channels right now." 
  user and loading are not always the default — they're whatever the current state value is at that moment, which changes over time as the auth state updates.
  The reason you only see user and loading and not setUser and setLoading is that the context intentionally only exposes what components need to read. 
  The setter functions stay private inside AuthContext — components shouldn't be directly setting auth state, that's the context's job.*/

    if (loading) return <div>Loading...</div>

    return user ? children : <Navigate to="/login"/>
    /* It's saying "if the user is logged in, render whatever was passed in (Upload, Profile, etc.), otherwise redirect." The component doesn't 
    need to know or care what the child is — it just either renders it or it doesn't. That's what makes it reusable. You can wrap any page with 
    <ProtectedRoute> and it handles the logic without you having to repeat yourself. 
    
    How does this know what /login is? It doesn't — and it doesn't need to. It's just a string. ProtectedRoute has no idea what's 
    at /login — it's just pointing at an address. It's like writing down a street address without knowing what building is there.
    App.jsx is what connects /login to the actual Login component:*/
}

export default ProtectedRoute