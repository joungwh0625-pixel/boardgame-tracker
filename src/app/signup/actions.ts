'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const display_name = formData.get('display_name') as string
  const avatarFile = formData.get('avatar_file') as File | null

  let avatar_url = ''

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
      avatar_url = publicUrlData.publicUrl
    }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name,
        avatar_url,
      }
    }
  })

  if (error) {
    console.error(error)
    redirect(encodeURI('/signup?message=회원가입에 실패했습니다.'))
  }

  redirect(encodeURI('/login?message=회원가입이 완료되었습니다. 로그인해주세요.'))
}
