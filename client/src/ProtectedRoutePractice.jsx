/* protecting any urls that require user to be logged in. which in this case would be, Upload and a welcome message. */
import {useAuth} from "..context/AuthContext.jsx"
import {Navigate} from "react-router-dom"

function ProtectedRoute(argument){
    const {user,loading}=useAuth()

    if (loading) return <div>Loading...</div>

    return user ? argument : <Navigate to="/login"/>
}

export default ProtectedRoute