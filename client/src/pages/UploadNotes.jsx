import { useState } from 'react'
import { supabase } from '../supabaseClient'
/* supabaseClient.js is the single place where you initialize the connection to your Supabase project using those two values — 
the URL tells your app where your database lives, and the anon key gives it permission to talk to it. Every file that needs to 
interact with Supabase imports from there so they're all using that same initialized connection.  */
import { useAuth } from '../context/AuthContext'
/*  useAuth is what gives you access to user.id — which you use to name the uploaded file 
(${user.id}-${Date.now()}) and to associate the post with the correct user in the database (user_id: user.id). 
Without it you'd have no way of knowing who is logged in. */
import { useNavigate } from 'react-router-dom'

export default function Upload() {
  const { user } = useAuth() /* Here is where you deconstruct the user objecct to get the user ID below. */
  const navigate = useNavigate()
  const [image, setImage] = useState(null)
  const [caption, setCaption] = useState('')
  const [medium, setMedium] = useState('')
  const [dimensions, setDimensions] = useState('') 
  const [forSale, setForSale] = useState(false) 
  const [price, setPrice] = useState('') 
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => { 
    e.preventDefault() /*the Default behavior of a form is to refresh the page and delete everything that was typed into it when the 
    form is submitted */
    setError(null)
    /*The reason you call setError(null) at the top of handleSubmit is to reset the error back to null each time the user submits. 
    That way if a user submits, gets an error message, fixes their input, and submits again — the old error clears before the new 
    attempt runs. Without it, a previous error message could linger on screen even after a successful submission. */
    setLoading(true)
    /* setLoading(true) for 2 reasons:
    1. You want the user to see a loading screen after they submit the form 
    2.  It also disables the submit button while the upload is happening — look at your button in the return:
    <button type="submit" disabled={loading}>
      {loading ? 'Uploading...' : 'Post'}
    </button>

    When loading is true, two things happen: the button is disabled so the user can't submit twice, and the text changes from "Post" 
    to "Uploading..." so the user knows something is happening. Then at the very end in the finally block, setLoading(false) resets it 
    regardless of whether the upload succeeded or failed.
    */

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = image.name.split('.').pop()
      /* image.name.split('.') splits the filename at every period. So my-painting.jpg becomes ['my-painting', 'jpg']. Then .pop() 
      removes and returns the last item in that array — which is jpg. So fileExt ends up being just the file extension. The goal is 
      to grab whatever extension the original file had so the uploaded file 
      keeps the right format. */

      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      /* It comes from the user object you deconstructed from useAuth at the top. Supabase assigns every user a unique ID when they 
      sign up, and that's what user.id is. */

      const { error: uploadError } = await supabase.storage /* This is destructuring with renaming. So { error: uploadError } means 
      "pull out the property called error 
      from this object, but call it uploadError in my code." You're deconstructing error out of the response Supabase returns, and 
      renaming it uploadError so it doesn't 
      conflict with other error variables later in the same function.  */
        .from('post-images')
        .upload(fileName, image)

      if (uploadError) throw uploadError

      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName)

      // 3. Insert post into database
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          caption,
          medium,
          dimensions,
          for_sale: forSale,
          price: forSale ? parseFloat(price) : null
        })

      if (insertError) throw insertError

      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false) /*resets loading regardless of whether the upload succeeded or failed. */
    }
  }

  return (
    <div>
      <h1>Upload Your Work</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input
          type="text"
          placeholder="Medium (e.g. Oil on canvas)"
          value={medium}
          onChange={(e) => setMedium(e.target.value)}
        />
        <input
          type="text"
          placeholder="Dimensions (e.g. 24x36in)"
          value={dimensions}
          onChange={(e) => setDimensions(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={forSale}
            onChange={(e) => setForSale(e.target.checked)}
          />
          Available for sale
        </label>
        {forSale && (
          <input
            type="number"
            placeholder="Price ($)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={loading}> {/* disabled prevents double submission */}
            {loading ? 'Uploading...' : 'Post'} {/* text updates from "Post" to "Uploading..." to show upload is in progress */}
          </button>
          {/* setLoading(false) in the finally block above resets this regardless of success or failure */}
      </form>
    </div>
  )
}