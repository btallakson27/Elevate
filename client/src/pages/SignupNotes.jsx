import { useState } from 'react'
import { supabase } from '../supabaseClient'
/* supabaseClient.js is the single place where you initialize the connection to your Supabase project using those two values — 
the URL tells your app where your database lives, and the anon key gives it permission to talk to it. Every file that needs to 
interact with Supabase imports from there so they're all using that same initialized connection.  */
import { Link } from 'react-router-dom' /* React Router is a third-party package that adds routing/navigation on top of React. */

/* everyting below is within the Signup function because everything needs access to the same state variables — email, password, username, error, success.
f handleSignup lived outside the function it wouldn't have access to those state variables. If the return lived outside it wouldn't either. Keeping everything 
inside the component function is what gives all the pieces shared access to the same state. That's actually the core idea of a React component — it's a 
self-contained unit that bundles its own state, its own logic, and its own UI together in one function.*/
export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false) 


  /* The state is already set by the time handleSignup runs — that's what all those onChange handlers do in real time as the user types. 
  By the time they hit submit, the state variables already hold the values. handleSignup just reads those state values and passes them to Supabase. */
  const handleSignup = async (e) => { /* the event is submitting the form below. */
    e.preventDefault() /* prevents page from refreshing when form is submitted. */
    setError(null)

    /* For the code immediately below, the setup has nothing to do with React. This is just the shape that the Supabase API expects when you call Signup. 
    Think of it like a form Supabase designed. It has required fields (email, password) and then an optional section called options where you can pass extra stuff. 
    Inside options, there's a data field specifically for any custom user metadata you want to store — things Supabase doesn't have a built-in field for, 
    like username or display_name. So the nesting isn't a React thing, it's just Supabase saying: "if you want to store extra info about the user, put it inside options.data."*/
    const { error } = await supabase.auth.signUp({ /* talks to the backend */
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
        }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
  return (
    <div>
      <h2>Check your email</h2>
      <p>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
    </div>
  )
}

/* The return section is what the component returns to React so it knows what to render in the browser. There's no communication to the backend here — the return 
is purely about the UI. The only part that talks to the backend is the supabase.auth.signUp() call inside handleSignup.*/
  return (
    <div>
      <h1>Create your Elevate account</h1>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  )
}