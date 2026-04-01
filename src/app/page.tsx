'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
export const dynamic = 'force-dynamic'
export default function RootPage() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      router.replace(data.session ? '/dashboard' : '/auth')
    })
  }, [router])
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100dvh'}}>
      <div style={{width:32,height:32,borderRadius:'50%',border:'2px solid #4ade80',borderTopColor:'transparent',animation:'spin 0.7s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
