import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Upload() {
  const { user } = useAuth()
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
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
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
      setLoading(false)
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
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Post'}
        </button>
      </form>
    </div>
  )
}