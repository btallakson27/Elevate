import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
    /* 
    createRoot(document.getElementById('root')).render() — this is what actually launches your React app. In your index.html there's a <div id="root"></div>. 
    That's just an empty div. createRoot grabs that div and tells React "this is where you're going to render everything." .render() then takes your entire component 
    tree and injects it into that div. So everything you see on screen is React filling in that one empty div.

    - document.getElementById('root') — finds the empty div in your HTML
    - createRoot() — hands that div to React and says "you're in charge of this"
    - .render() — takes your component tree and paints it into that div
    
    */
  <StrictMode> 
    {/* StrictMode — it's a development tool that intentionally runs your components twice to help catch bugs and bad practices early. It has no effect in production, 
    it's just there to help you write better code during development. You'll sometimes notice console.log statements firing twice — that's StrictMode doing its double render.
    So the whole file is basically saying: grab the empty div in index.html, wrap the entire app in StrictMode for development safety and AuthProvider for auth broadcasting, 
    and render it all into that div. */}

    <AuthProvider>  {/* When you write this in main.jsx React doesn't automatically know what to do with <App />. 
    It just receives it as a prop called children. If you never use children inside AuthProvider, the content simply never renders — it gets swallowed and disappears. 
    Think of it like a picture frame. The frame (AuthProvider) exists, but if you never put the picture inside it, you just have an empty frame. The {children} in the 
    return statement of AuthContext.jsx is what actually places the picture inside the frame.
    
    StrictMode actually only makes changes to your code in development. When you push it to production, it's as if it wasn't even there because it does nothing. 
    */}
      <App />
    </AuthProvider>
  </StrictMode>,
)