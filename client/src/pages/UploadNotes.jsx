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
  const { user } = useAuth() /* Here is where you deconstruct the user object to get the user ID below. But how would you know
  what actually comes from this? You'd look at your AuthContext.jsx file. Whatever that context is providing is what you can 
  destructure out of useAuth(). So you'd open that file and look for what it returns or provides — that's your source of truth 
  for what's available.*/
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
      /* image.name comes from the file the user selected in the file input — it's a property that every file object in JavaScript has 
      built in. When the user picks a file from their device, the browser creates a file object with properties like name, size, and type 
      automatically. That's where image.name comes from. image.name.split('.') splits the filename at every period. So my-painting.jpg becomes 
      ['my-painting', 'jpg']. Then .pop() removes and returns the last item in that array — which is jpg. So fileExt ends up being just the 
      file extension. The goal is to grab whatever extension the original file had so the uploaded file keeps the right format. */

      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      /* user.id comes from the user object you deconstructed from useAuth at the top. Supabase assigns every user a unique ID when they 
      sign up, and that's what user.id is. Example of an actual fileName: a3f8c2d1-7b4e-4f2a-9c1d-2e5f8a3b6c7d-1716300000000.jpg
      The first part (a3f8c2d1-7b4e-4f2a-9c1d-2e5f8a3b6c7d) is the Supabase user ID, then a dash, then (1716300000000) is the timestamp 
      from Date.now() in milliseconds, then .jpg is the file extension. This format guarantees every filename is unique — even if the same 
      user uploads two images at the same time, the timestamp will be different.
      */

      const { error: uploadError } = await supabase.storage /* 
      The error isn't describing what Supabase is doing — it's describing what Supabase returns. Every Supabase operation returns an object 
      that always has two possible properties: data and error. One of them will have a value and the other will be null depending on whether 
      the operation succeeded or failed. So when you write: const { error: uploadError } = await supabase.storage...
      You're saying "run the upload, and when it comes back, pull out the error property from the response." You're not saying the upload 
      itself is an error — you're just grabbing that slot from the response object in case something went wrong. Think of it like ordering food. 
      The waiter always comes back with either your food (data) or an apology (error). You're just listening for the apology.
      
      This is destructuring with renaming. So { error: uploadError } means 
      "pull out the property called error from this object, but call it uploadError in my code." You're deconstructing error out of 
      the response Supabase returns, and renaming it uploadError so it doesn't conflict with other error variables later in the same function. 
      
      supabase.storage is a built-in module that comes with the Supabase JavaScript client library. It gives you access to Supabase's file 
      storage system — think of it like a cloud hard drive attached to your project where you store things like images, videos, and documents.
      When you call supabase.storage you're not talking to your database — you're talking to a completely separate service that Supabase provides 
      alongside the database. That's why you see it used differently than supabase.from('posts'), which talks to the database tables.
      So in your app you're actually using two different Supabase services:

      - supabase.storage — for storing the actual image files
      - supabase.from() — for storing the post data (URL, caption, medium, etc.) in the database

      They work together — storage holds the file, the database holds the information about the file including the URL that points to it.

      Yes, anytime you're storing actual files — images, videos, PDFs, audio — supabase.storage is what handles that. The database alone can't 
      store files, it can only store text and numbers. So the pattern you're using in Elevate is the standard pattern for any file upload in any app:

      Upload the file to storage, get back a URL
      Save that URL to the database alongside any other data

      That pattern holds true beyond Supabase too. Other services like AWS S3, Cloudinary, and Firebase Storage all work the same way — storage 
      for the file, database for the reference to it.
      */
        .from('post-images') /*telling Supabase which storage bucket to put the file into. A bucket is like a folder in your Supabase storage.
        You named this post-images when you set up your Supabase storage bucket. It's not something Supabase decides — it's whatever name you 
        gave the bucket when you created it in your Supabase dashboard. You can find it by going to your project in Supabase then Storage. */
        .upload(fileName, image) /*telling Supabase two things — what to name the file in storage (fileName), and what the actual file is 
        (image, which is the file the user selected from their device). 
        
        So together they read as: "in the post-images bucket, upload this file and call it fileName." */

      if (uploadError) throw uploadError
      /* here we're saying, if there is an error, throw it, so the code stops running immediately. And the reason stopping immediately matters 
      is because the next two steps — getting the public URL and inserting into the database — depend on the upload succeeding. If the image 
      didn't upload, there's no URL to get, and no point inserting a post with a broken or missing image link. So throwing the error skips 
      everything else and jumps straight down to the catch block.  */

      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage /* 
       supabase.storage is a storage bucket in supabase where all uploaded images will be stored. within that, we have .from('post-images')
      which is saying, "look in my 'post-images' bucket in supabase, which I named 'post-images'. this can be found in storage. then we do 
      .getPublicUrl(filename) which is going to search for the specific file name of the image, which we established by making the "fileName" 
      variable earlier. 

      Every Supabase operation returns an object. getPublicUrl specifically returns this:

            {
        data: {
          publicUrl: "https://yourproject.supabase.co/storage/v1/..."
        }
      }

      That's just the shape Supabase decided their response object would have. data is the wrapper, and inside data is publicUrl which holds the actual URL string.
      So when you write:
        const { data: { publicUrl } } = supabase.storage...

      You're saying "from the response, dig into data, then pull out publicUrl from inside it." It's nested destructuring — two levels deep in one line.
You didn't create data or publicUrl — Supabase returns them automatically. You're just reaching into the response and grabbing what you need.

      and if you actually want to view this,

      temprarily replace the const { data: { publicUrl } } block of code with:
              const response = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName)

        console.log(response)

      Then check the console in your browser dev tools after uploading an image and you'll see the full response object with data and publicUrl inside it. After you're done looking, delete the console.log and put the code back to normal.

      publicUrl comes from Supabase. When you call getPublicUrl(fileName), 
      Supabase constructs a URL that points to the file you just uploaded in storage. You created fileName above in this line of code:
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      The URL looks something like:
      https://yourproject.supabase.co/storage/v1/object/public/post-images/userid-timestamp.jpg
      That URL is what gets saved to the database as image_url. Also, this whole thing is one statement so it all excutes together:
      supabase.storage.from('post-images').getPublicUrl(fileName) That runs completely, returns an object with data.publicUrl inside it, and 
      then the left side destructures it into publicUrl. So by the time publicUrl exists, getPublicUrl(fileName) has already run and returned 
      the URL.
      
      Then later when you want to display the image in the app, you just 
      use that URL as the src of an <img> tag and the browser fetches it directly from Supabase storage. */
        .from('post-images')
        .getPublicUrl(fileName) 

      // 3. Insert post into database
      // by inserting, you are creating a new row in your database that contains all the post information inlcuding the image_url which points to the 
      // image in storage. The image and the database record are separate - the URL is whta connects them. first we are going to deconstruct/extract 
      // the error (if there is one), but call it insertError so it doesn't get confused with other errors. now we need to await supabase, so wait on 
      // supaabase to check it's 'posts' (found in "table editor")  and insert the user.id, image_url, etc. and parseFloat converts the price from a 
      // string to a decimal and stores it in your Supabase database as such. Is this better? I'm a little confused on what the variable name is for 
      // this section if there is no error. is there one? You're only destructuring error from the response because that's all you need to check. If 
      // there's no error, the insert succeeded and the code just moves on to navigate('/'). You don't need the data from this operation because you 
      // already have everything you need — publicUrl was grabbed in step 2.
      /*And where are you attempting to insert? Inside the try block. That's the whole point of try/catch — you try to do something that might fail, 
      and if it does, the catch block handles it. The insert is one of three things you're attempting in that try block, along with the upload and 
      getting the public URL. */
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          caption,
          medium,
          dimensions,
          for_sale: forSale,
          price: forSale ? parseFloat(price) : null /*price state is a string because it comes from an input field. parseFloat converts it to a decimal 
          number before storing it in the database. If the artwork isn't for sale, it stores null instead. */
        })

      if (insertError) throw insertError

      /*The code below. If everything worked and there are no errors, navigate the user to their homepage. but if there is an error, change the setState 
      for setError to whatever the error message is. For finally— it doesn't only run when there's an error. `finally` runs always, regardless of whether 
      the try succeeded or the catch caught an error. So `setLoading(false)` runs no matter what — whether the upload succeeded or failed. That's the whole 
      point of `finally`. You want loading to stop either way so the button doesn't stay disabled and the user isn't stuck seeing "Uploading..." forever. */

      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false) /*resets loading regardless of whether the upload succeeded or failed. */
    }
  }

  /* The return is where you define what actually shows up in the browser — the structure and content. CSS is what makes it look good. Think of the return 
  as the blueprint and CSS as the interior design. */
  return (
    <div>
      <h1>Upload Your Work</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])} /*file inputs return a list of files (even if only one is selected), so files[0] grabs the first 
          one from that list. */
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
            onChange={(e) => setForSale(e.target.checked)} /*checkboxes don't have a value the way text inputs do. Instead they have checked which is 
            true or false, which is why setForSale uses e.target.checked instead of e.target.value. */
          />
          Available for sale
        </label>
        {forSale && ( /* the price input only renders if forSale is true. This is conditional rendering using the && operator — if the left side is 
        false, React skips the right side entirely. */
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