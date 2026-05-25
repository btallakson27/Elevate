import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Upload from './pages/Upload'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/upload" element={<ProtectedRoute><Upload/></ProtectedRoute>}/>
                <Route path="/" element={<ProtectedRoute><div>Welcome, {user.email}!</div></ProtectedRoute>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App