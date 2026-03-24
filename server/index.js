import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import { createClient } from "@supabase/supabase-js"

const app = express()
app.use(express.json())
app.use(cors())

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

app.get("/", (req, res) => {
    res.json({ message: "Elevate API is running" })
})

app.listen(3001, () => console.log("Server running on port 3001"))