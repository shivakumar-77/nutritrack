'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
type Mode = 'landing'|'email'|'phone'|'otp'|'confirm'
export default function AuthPage() {
  const router = useRouter()
  const [mode,setMode] = useState<Mode>('landing')
  const [isLogin,setIsLogin] = useState(true)
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [name,setName] = useState('')
  const [phone,setPhone] = useState('')
  const [otp,setOtp] = useState(['','','','','',''])
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{if(data.session)router.replace('/dashboard')})
  },[router])
  async function signInGoogle(){
    setLoading(true);setError('')
    const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}/auth/callback`}})
    if(error){setError(error.message);setLoading(false)}
  }
  async function submitEmail(e:React.FormEvent){
    e.preventDefault();setError('');setLoading(true)
    try{
      if(isLogin){
        const {data,error}=await supabase.auth.signInWithPassword({email,password})
        if(error)throw error
        if(data.session)router.replace('/dashboard')
      }else{
        const {error}=await supabase.auth.signUp({email,password,options:{data:{name},emailRedirectTo:`${window.location.origin}/auth/callback`}})
        if(error)throw error
        setMode('confirm')
      }
    }catch(e:any){setError(e.message)}finally{setLoading(false)}
  }
  async function submitPhone(e:React.FormEvent){
    e.preventDefault();setError('');setLoading(true)
    try{
      const {error}=await supabase.auth.signInWithOtp({phone:phone.startsWith('+')?phone:`+91${phone}`})
      if(error)throw error
      setMode('otp')
    }catch(e:any){setError(e.message)}finally{setLoading(false)}
  }
  async function verifyOtp(){
    setError('');setLoading(true)
    try{
      const {data,error}=await supabase.auth.verifyOtp({phone:phone.startsWith('+')?phone:`+91${phone}`,token:otp.join(''),type:'sms'})
      if(error)throw error
      if(data.session)router.replace('/dashboard')
    }catch(e:any){setError(e.message)}finally{setLoading(false)}
  }
  function handleOtpInput(val:string,idx:number){
    const next=[...otp];next[idx]=val.slice(-1);setOtp(next)
    if(val&&idx<5)document.getElementById(`otp-${idx+1}`)?.focus()
  }
  function handleOtpKey(e:React.KeyboardEvent,idx:number){
    if(e.key==='Backspace'&&!otp[idx]&&idx>0)document.getElementById(`otp-${idx-1}`)?.focus()
  }
  const Spinner=()=><div style={{width:16,height:16,borderRadius:'50%',border:'2px solid rgba(0,0,0,0.3)',borderTopColor:'#000',animation:'spin 0.7s linear infinite'}}/>
  const ErrBox=({msg}:{msg:string})=><div style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:10,padding:'10px 14px',color:'#f87171',fontSize:13}}>{msg}</div>
  return (
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 20px',background:'var(--surface)'}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .acard{animation:fadeUp 0.35s ease forwards}
        .sbtn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px 20px;border-radius:14px;font-size:15px;font-weight:500;cursor:pointer;transition:all 0.15s;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#f5f5f5}
        .sbtn:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.2)}
        .sbtn:active{transform:scale(0.98)}
        .sbtn:disabled{opacity:0.5;cursor:not-allowed}
        .otp-box{width:46px;height:56px;text-align:center;font-size:22px;font-weight:600;border-radius:12px;border:1.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.06);color:#f5f5f5;outline:none;transition:border-color 0.15s}
        .otp-box:focus{border-color:#4ade80}
        .div-line{display:flex;align-items:center;gap:12px;color:#666;font-size:13px;margin:4px 0}
        .div-line::before,.div-line::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.08)}
        .back{background:none;border:none;color:#666;cursor:pointer;font-size:13px;padding:0;margin-bottom:20px}
        .back:hover{color:#f5f5f5}
        .tab{flex:1;padding:10px;border:none;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.15s}
      `}</style>
      <div style={{marginBottom:32,textAlign:'center',animation:'float 3s ease-in-out infinite'}}>
        <div style={{width:68,height:68,background:'#4ade80',borderRadius:22,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:34}}>🥗</div>
        <div style={{fontWeight:700,fontSize:22,letterSpacing:'-0.03em',color:'#f5f5f5'}}>NutriTrack</div>
        <div style={{fontSize:13,color:'#666',marginTop:3}}>Eat smart. Live better.</div>
      </div>
      <div className="acard" style={{width:'100%',maxWidth:380}}>
        {mode==='landing'&&(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <button className="sbtn" onClick={signInGoogle} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button className="sbtn" onClick={()=>setMode('phone')} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.1 2.18 2 2 0 012.08 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.27 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z"/></svg>
              Continue with Phone
            </button>
            <div className="div-line">or</div>
            <button className="sbtn" onClick={()=>{setMode('email');setIsLogin(true)}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Continue with Email
            </button>
            <p style={{textAlign:'center',fontSize:11,color:'#555',marginTop:8}}>By continuing you agree to our Terms & Privacy Policy</p>
          </div>
        )}
        {mode==='email'&&(
          <div>
            <button className="back" onClick={()=>setMode('landing')}>← Back</button>
            <div style={{display:'flex',gap:6,background:'rgba(255,255,255,0.05)',borderRadius:12,padding:4,marginBottom:24}}>
              <button className="tab" onClick={()=>setIsLogin(true)} style={{background:isLogin?'rgba(74,222,128,0.15)':'transparent',color:isLogin?'#4ade80':'#666',border:isLogin?'1px solid rgba(74,222,128,0.3)':'1px solid transparent'}}>Log in</button>
              <button className="tab" onClick={()=>setIsLogin(false)} style={{background:!isLogin?'rgba(74,222,128,0.15)':'transparent',color:!isLogin?'#4ade80':'#666',border:!isLogin?'1px solid rgba(74,222,128,0.3)':'1px solid transparent'}}>Sign up</button>
            </div>
            <form onSubmit={submitEmail} style={{display:'flex',flexDirection:'column',gap:12}}>
              {!isLogin&&<input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} required/>}
              <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required/>
              <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/>
              {error&&<ErrBox msg={error}/>}
              <button className="btn btn-primary" type="submit" disabled={loading} style={{padding:'14px',fontSize:15,marginTop:4,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                {loading&&<Spinner/>}{loading?'Please wait…':isLogin?'Log in':'Create account'}
              </button>
            </form>
          </div>
        )}
        {mode==='phone'&&(
          <div>
            <button className="back" onClick={()=>setMode('landing')}>← Back</button>
            <h2 style={{fontSize:20,fontWeight:600,marginBottom:6,color:'#f5f5f5'}}>Your phone number</h2>
            <p style={{fontSize:13,color:'#666',marginBottom:24}}>We'll send a 6-digit OTP via SMS</p>
            <form onSubmit={submitPhone} style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'flex',gap:8}}>
                <div style={{padding:'12px 14px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,fontSize:15,color:'#888',flexShrink:0,display:'flex',alignItems:'center'}}>🇮🇳 +91</div>
                <input type="tel" placeholder="10-digit number" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,''))} maxLength={10} required style={{flex:1}}/>
              </div>
              {error&&<ErrBox msg={error}/>}
              <button className="btn btn-primary" type="submit" disabled={loading||phone.length<10} style={{padding:'14px',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                {loading&&<Spinner/>}{loading?'Sending…':'Send OTP'}
              </button>
            </form>
          </div>
        )}
        {mode==='otp'&&(
          <div style={{textAlign:'center'}}>
            <button className="back" onClick={()=>setMode('phone')} style={{display:'block',margin:'0 0 20px'}}>← Back</button>
            <div style={{fontSize:48,marginBottom:12}}>📱</div>
            <h2 style={{fontSize:20,fontWeight:600,marginBottom:6,color:'#f5f5f5'}}>Enter OTP</h2>
            <p style={{fontSize:13,color:'#666',marginBottom:28}}>Sent to +91 {phone}</p>
            <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:24}}>
              {otp.map((digit,i)=>(
                <input key={i} id={`otp-${i}`} className="otp-box" type="number" value={digit}
                  onChange={e=>handleOtpInput(e.target.value,i)} onKeyDown={e=>handleOtpKey(e,i)}/>
              ))}
            </div>
            {error&&<ErrBox msg={error}/>}
            <button className="btn btn-primary" style={{width:'100%',padding:'14px',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:8}}
              onClick={verifyOtp} disabled={loading||otp.join('').length<6}>
              {loading&&<Spinner/>}{loading?'Verifying…':'Verify & continue'}
            </button>
            <button onClick={submitPhone as any} style={{background:'none',border:'none',color:'#666',fontSize:13,cursor:'pointer',marginTop:16}}>Resend OTP</button>
          </div>
        )}
        {mode==='confirm'&&(
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:56,marginBottom:16,animation:'float 3s ease-in-out infinite'}}>📬</div>
            <h2 style={{fontSize:20,fontWeight:600,marginBottom:8,color:'#f5f5f5'}}>Check your email</h2>
            <p style={{color:'#666',fontSize:14,lineHeight:1.7,marginBottom:20}}>Confirmation link sent to<br/><strong style={{color:'#f5f5f5'}}>{email}</strong></p>
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'16px',marginBottom:20,textAlign:'left'}}>
              <p style={{fontSize:13,color:'#666',lineHeight:1.8}}>1. Open your email app<br/>2. Find email from NutriTrack<br/>3. Tap <strong style={{color:'#4ade80'}}>Confirm your email</strong><br/>4. You'll be logged in automatically</p>
            </div>
            <button className="sbtn" onClick={()=>setMode('email')}>Use a different email</button>
          </div>
        )}
      </div>
    </div>
  )
}
