'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/login')

  const display_name = formData.get('display_name') as string
  const avatarFile = formData.get('avatar_file') as File | null

  let updates: any = {
    display_name
  }

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile)
      
    if (uploadError) {
      console.error('Upload Error:', uploadError)
    } else if (uploadData) {
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
      updates.avatar_url = publicUrlData.publicUrl
    }
  }

  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)

  if (!error) {
    // Also update raw_user_meta_data for consistency if needed, though we primarily read from profiles
    await supabase.auth.updateUser({ data: updates })
    
    revalidatePath('/', 'layout')
    redirect(encodeURI('/mypage?message=성공적으로 수정이 완료되었습니다.'))
  } else {
    console.error('Update Profile Error:', error)
    redirect(encodeURI('/mypage?message=프로필 수정에 실패했습니다.'))
  }
}
