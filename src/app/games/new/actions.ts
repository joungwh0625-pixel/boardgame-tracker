'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function addGame(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const imageFile = formData.get('image_file') as File | null

  let image_url = ''

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
      image_url = publicUrlData.publicUrl
    }
  }

  const { error } = await supabase.from('games').insert({
    title,
    description,
    image_url: image_url || null
  })

  if (!error) {
    revalidatePath('/', 'layout')
    redirect('/')
  } else {
    console.error(error)
    redirect('/games/new?message=error')
  }
}

export async function deleteGame(formData: FormData) {
  const supabase = await createClient()
  const game_id = formData.get('game_id') as string

  if (game_id) {
    const { error } = await supabase.from('games').delete().eq('id', game_id)
    if (error) console.error('Delete Game Error:', error)
  }
  
  revalidatePath('/', 'layout')
}

export async function toggleMasterStatus(formData: FormData) {
  const supabase = await createClient()
  const user_id = formData.get('user_id') as string
  const current_status = formData.get('current_status') === 'true'

  if (user_id) {
    const { error } = await supabase.from('profiles').update({ is_master: !current_status }).eq('id', user_id)
    if (error) console.error('Toggle Master Error:', error)
  }
  
  revalidatePath('/', 'layout')
}
