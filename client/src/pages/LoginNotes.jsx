/*  this login file in our pages folder within source on the client end because it's part of the front end that does the requesting 
and the login page is one of the pages the user will see*/

import { useState } from 'react'
import { supabase } from '../supabaseClient'
/* supabaseClient.js is the single place where you initialize the connection to your Supabase project using those two values — 
the URL tells your app where your database lives, and the anon key gives it permission to talk to it. Every file that needs to 
interact with Supabase imports from there so they're all using that same initialized connection.  */
import { useNavigate, Link } from 'react-router-dom'
/* useNavigate — a React Router hook that lets you programmatically redirect the user to a different page. const navigate = useNavigate() 
gives you a function you can call like navigate('/') to send the user wherever you want. Without it you'd have no way to redirect after a 
successful login. 

useNavigate — redirect triggered by an action (button click, form submit, etc.)
Navigate — redirect triggered by rendering (component appears on screen)

Link — a React Router component that works like an <a> tag but without a full page reload. So <Link to="/signup"> navigates to the signup 
page the React way.
*/

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  /* What errors is it catching?
    Specifically errors from Supabase when the login attempt fails. Things like:

    - Wrong password
    - Email not found
    - Account not confirmed
    - Network issues

    When supabase.auth.signInWithPassword() fails it returns an error object with a message explaining what went wrong. 
    Your code grabs that and stores it.

    Why must errors be stored in state?
    Because you want to display the error to the user on screen. And in React, anything that needs to appear on screen 
    must be stored in state — because state is what triggers a re-render. */

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault() /*  Prevents the browser's default form submission behavior which would 
    reload the entire page. You want to handle the submission yourself with your own JavaScript instead. */
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    /*  this line is saying: "send this email and password to Supabase and wait for a response, then pull out the error from that response."
        {error} is destructuring (extracting specific values out of an object or array without taking the whole thing.)
        Supabase actually returns a bigger object that looks like this: { data: {...}, error: null }
        So the full response has both data and error in it, but you only care about error right now.

    */

    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

 return (
  <div>
    <h1>Log in to Elevate</h1>
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email} /* Connects the input field to React state. Whatever is stored in the email 
        state variable is what shows in the input box. This is called a controlled component — 
        React is in charge of what the input displays, not the browser.
        
        How it works step by step:
        1. Component loads (the login page) when user navigates to /login — email state starts as an empty string via useState('')
        2. value={email} displays whatever is in the email state. Starts empty so the box is empty.
        3. User types a character — onChange fires and calls setEmail(e.target.value), updating the state.
        4. React re-renders — value={email} now displays the updated state in the input box.
        5. Steps 3 and 4 repeat for every character typed.
        6. User hits submit — email state holds the complete email address and gets passed to 
           supabase.auth.signInWithPassword({ email, password }). */
        onChange={(e) => setEmail(e.target.value)} /* Every time the user types a character this fires 
        and updates the email state with whatever is currently in the input box. e.target.value is 
        "whatever the user typed." value and onChange work together — onChange updates the state, 
        value displays the state. */
        required /* makes this a required field — form won't submit without it */

        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Log In</button>
      </form>
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </div>
  )
}
