import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dxuptoypcfccrhrdjyzp.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXB0b3lwY2ZjY3JocmRqeXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5NDg3NjEsImV4cCI6MjA0ODUyNDc2MX0.cbBrgh_u6rn1ovAjGSTaDOm-Hiue_w6QkuW4Z4jnSnw"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})