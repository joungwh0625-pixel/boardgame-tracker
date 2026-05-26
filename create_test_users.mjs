import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nznmvnvioilcvpulqhkp.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bm12bnZpb2lsY3ZwdWxxaGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzQyNjMsImV4cCI6MjA5NTMxMDI2M30.lM5c6Vxl14LegH2vIxRy0ZIXzWiK_oItl7BDgIrBGnY'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function run() {
  const users = [
    { email: 'test_delete_1@test.com', password: 'password123', display_name: '테스트유저1' },
    { email: 'test_delete_2@test.com', password: 'password123', display_name: '테스트유저2' },
    { email: 'test_delete_3@test.com', password: 'password123', display_name: '테스트유저3' }
  ]

  for (const u of users) {
    console.log(`Signing up ${u.email}...`)
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: {
        data: {
          display_name: u.display_name,
        }
      }
    })
    
    if (error) {
      console.error(`Error signing up ${u.email}:`, error.message)
    } else {
      console.log(`Successfully created ${u.email}`)
    }
  }
}

run()
