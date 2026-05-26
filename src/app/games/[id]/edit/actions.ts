'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateGame(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const imageFile = formData.get('image_file') as File | null

  // Ensure user is authenticated and is master
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_master').eq('id', user.user.id).single()
  if (!profile?.is_master) return redirect('/')

  let updates: any = {
    title,
    description
  }

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('games')
      .upload(fileName, imageFile)
      
    if (uploadError) {
      console.error('Upload Error:', uploadError)
    } else if (uploadData) {
      const { data: publicUrlData } = supabase.storage.from('games').getPublicUrl(uploadData.path)
      updates.image_url = publicUrlData.publicUrl
    }
  }

  const { error } = await supabase.from('games').update(updates).eq('id', id)

  if (!error) {
    revalidatePath('/', 'layout')
    redirect('/games/new')
  } else {
    console.error('Update Game Error:', error)
    redirect(`/games/${id}/edit?message=error`)
  }
}
