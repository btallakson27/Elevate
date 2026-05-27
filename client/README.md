# Elevate

A social media platform built for fine artists to share their work, connect with other creatives, and sell their art.

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database & Auth:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage

## Features

- User authentication (signup, login, protected routing)
- Image upload with artwork metadata (caption, medium, dimensions)
- Mark artwork as available for sale with pricing
- Artwork stored in Supabase Storage, metadata stored in database
- Row Level Security (RLS) policies for data protection

## In Progress

- Artist feed
- Likes
- Follows
- Artist profiles

## Run Locally

**1. Clone the repository**
```bash
git clone https://github.com/btallakson27/Elevate
cd Elevate
```

**2. Install dependencies**
```bash
cd client
npm install
```

**3. Set up environment variables**

Create a `.env` file inside the `client` folder:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

**4. Start the development server**
```bash
npm run dev
```

## Author

Ben Tallakson — [GitHub](https://github.com/btallakson27) | [Portfolio](https://codingwithben.netlify.app)