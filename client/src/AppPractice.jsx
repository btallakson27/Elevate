/* this is where the routing happens, which basically connects users to different urls */
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import ProtectedRoute from "./ProtectedRoute.jsx"
import Login from './pages/Login'
import Signup from './pages/Signup'
import Upload from './pages/Upload'

function App(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/Login" element={<Login/>}/>
            </Routes>
        </BrowserRouter>
    )
}