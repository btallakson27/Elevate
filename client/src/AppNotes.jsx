import { BrowserRouter, Routes, Route } from 'react-router-dom'
/* These all come from a library called React Router — it's not built into React, it's a separate package that handles navigation and routing in React apps. 
That's why you have to import it from 'react-router-dom' instead of just 'react'. Without React Router, React has no idea what a URL is. 
It just renders components — it doesn't know anything about /login or /upload. React Router is what connects URLs to components.

Why each one needs to be imported:

    - BrowserRouter — sets up the routing system for your whole app. It uses the browser's built in history API to keep track of the current URL. 
      Everything that needs routing has to live inside it.
    - Routes — a wrapper that looks at the current URL and finds the matching Route to render. You can think of it as the traffic controller.
    - Route — defines one specific path and what to show there. You need one for every page in your app.
    - Navigate — lets you programmatically redirect a user to a different path. Used here to kick unauthenticated users to the login page.

They're all separate pieces that work together to make navigation work. You need all four to build what your App.jsx is doing. 

Yes exactly. With traditional HTML you'd have to make a separate login.html, signup.html, upload.html and link between them. Every click would trigger a full page reload, 
losing all your state and feeling slow. With React Router you have one page, one root div, and React just swaps components in and out instantly. No reloads, no lost state, 
much faster for the user, and much cleaner for you to manage. It's one of the main reasons React became so popular for building modern web apps.
*/
import ProtectedRoute from './ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Upload from './pages/Upload'

function App() {
    return (
        <BrowserRouter> {/* this is what enables navigation in your app. It watches the URL in the browser and tells React what to render based on it. 
    Without it, React has no concept of URLs or pages. */}
            <Routes> {/* a container that holds all your Route definitions. It looks at the current URL and finds the matching Route to render. */}
                <Route path="/login" element={<Login/>}/> {/* defines a single URL path and what component to show when the user is on that path. 
        So path="/login" means "when the URL is /login, show the Login component." */}
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/upload" element={<ProtectedRoute><Upload/></ProtectedRoute>}/>
                {/* Navigate — a component that redirects the user to a different path. So <Navigate to="/login" /> is basically saying "send them to /login right now." */}
                <Route path="/" element={<ProtectedRoute><div>Welcome, {user.email}!</div></ProtectedRoute>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App /* App gets imported in main.jsx */