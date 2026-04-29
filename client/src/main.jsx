import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>  {/* When you write this in main.jsx React doesn't automatically know what to do with <App />. 
    It just receives it as a prop called children. If you never use children inside AuthProvider, the content simply never renders — it gets swallowed and disappears. 
    Think of it like a picture frame. The frame (AuthProvider) exists, but if you never put the picture inside it, you just have an empty frame. The {children} in the 
    return statement of AuthContext.jsx is what actually places the picture inside the frame.*/}
      <App />
    </AuthProvider>
  </StrictMode>,
)