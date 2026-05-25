/* supabaseClient.js is the single place where you initialize the connection to your Supabase project using those two values — 
the URL tells your app where your database lives, and the anon key gives it permission to talk to it. Every file that needs to 
interact with Supabase imports from there so they're all using that same initialized connection.  */

import { createClient } from '@supabase/supabase-js' 
/* createClient is a function that comes from the Supabase JavaScript library.  It takes your URL and anon key and returns a fully configured Supabase connection object.
That connection object — which you named supabase — is what gives you access to all of Supabase's features. It's the thing you use throughout your app to talk to your database, 
handle auth, and interact with storage. 
*/

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)