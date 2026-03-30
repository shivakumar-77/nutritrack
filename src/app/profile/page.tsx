'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Profile, type WeightLog } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
export default function ProfilePage() {
  const router = useRouter()
  const [profile,setProfile] = useState<Profile|null>(null)
  const [weights,setWeights] = useState<WeightLog[]>([])
  const [saving,setSaving] = useState(false)
  const [saved,setSaved] = useState(false)
  const [weightVal,setWeightVal] = useState('')
  const [form,setForm] = useState({name:'',goal:'lose',cal_target:1700,protein_target:167,carb_target:144,fat_target:60,fiber_target:25,weight_goal:72,water_goal:2000})
  useEffect(()=>{
    async function load(){
      const {data:{user}}=await supabase.auth.getUser()
      if(!user){router.replace('/auth');return}
      const [{data:prof},{data:wlogs}]=await Promise.all([
        supabase.from('profiles').select('*').eq('id',user.id).single(),
        supabase.from('weight_logs').select('*').eq('user_id',user.id).order('logged_at',{ascending:false}).limit(14)
      ])
      if(prof){setProfile(prof as Profile);setForm({name:prof.name??'',goal:prof.goal??'lose',cal_target:prof.cal_target??1700,protein_target:prof.protein_target??167,carb_target:prof.carb_target??144,fat_target:prof.fat_target??60,fiber_target:prof.fiber_target??25,weight_goal:prof.weight_goal??72,water_goal:prof.water_goal??2000})}
      if(wlogs)setWeights(wlogs as WeightLog[])
    }
    load()
  },[router])
  async function saveProfile(){
    setSaving(true)
    const {data:{user}}=await supabase.auth.getUser()
    if(!user)return
    await supabase.from('profiles').update(form).eq('id',user.id)
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000)
  }
  async function logWeight(){
    const val=parseFloat(weightVal);if(!val)return
    const {data:{user}}=await supabase.auth.getUser();if(!user)return
    const today=new Date().toISOString().slice(0,10)
    await supabase.from('weight_logs').upsert({user_id:user.id,logged_at:today,weight_kg:val})
    setWeightVal('')
    const {data}=await supabase.from('weight_logs').select('*').eq('user_id',user.id).order('logged_at',{ascending:false}).limit(14)
    if(data)setWeights(data as WeightLog[])
  }
  const latest=weights[0];const prev=weights[1]
  const change=latest&&prev?(latest.weight_kg-prev.weight_kg).toFixed(1):null
  return(
    <div className="page" style={{paddingTop:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:600,letterSpacing:'-0.02em'}}>Profile</h1>
        <button className="btn btn-ghost" style={{fontSize:13,padding:'8px 14px'}} onClick={async()=>{await supabase.auth.signOut();router.replace('/auth')}}>Sign out</button>
      </div>
      <div className="card" style={{marginBottom:16}}>
        <p style={{fontSize:13,color:'var(--muted)',marginBottom:12}}>Weight log</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          <div style={{background:'var(--card2)',borderRadius:12,padding:'12px 14px'}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>Current</div>
            <div style={{fontSize:22,fontWeight:600}}>{latest?`${latest.weight_kg} kg`:'—'}</div>
            {change&&<div style={{fontSize:12,color:parseFloat(change)<=0?'#4ade80':'#f87171',marginTop:2}}>{parseFloat(change)>0?'+':''}{change} kg</div>}
          </div>
          <div style={{background:'var(--card2)',borderRadius:12,padding:'12px 14px'}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>Goal</div>
            <div style={{fontSize:22,fontWeight:600}}>{form.weight_goal} kg</div>
            {latest&&<div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{Math.abs(latest.weight_kg-form.weight_goal).toFixed(1)} kg to go</div>}
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <input type="number" placeholder="Today's weight (kg)" value={weightVal} onChange={e=>setWeightVal(e.target.value)} step="0.1" style={{flex:1}}/>
          <button className="btn btn-primary" onClick={logWeight} style={{flexShrink:0,padding:'12px 18px'}}>Log</button>
        </div>
        {weights.length>1&&(
          <div style={{marginTop:14,display:'flex',gap:4,alignItems:'flex-end',height:60}}>
            {[...weights].reverse().map((w,i)=>{
              const vals=weights.map(x=>x.weight_kg);const min=Math.min(...vals)-1;const max=Math.max(...vals)+1
              const h=Math.round(((w.weight_kg-min)/(max-min))*50)+10
              return(<div key={w.id} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                <div style={{width:'100%',height:h,background:i===weights.length-1?'#4ade80':'rgba(255,255,255,0.1)',borderRadius:3}}/>
                <div style={{fontSize:9,color:'var(--muted)'}}>{w.logged_at.slice(5)}</div>
              </div>)
            })}
          </div>
        )}
      </div>
      <div className="card" style={{marginBottom:16}}>
        <p style={{fontSize:13,color:'var(--muted)',marginBottom:14}}>Goals & preferences</p>
        <div style={{marginBottom:12}}><label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:6}}>Your name</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Name"/></div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:8}}>Goal</label>
          <div style={{display:'flex',gap:8}}>
            {(['lose','maintain','gain'] as const).map(g=>(
              <button key={g} onClick={()=>setForm(p=>({...p,goal:g}))} className={form.goal===g?'btn btn-primary':'btn btn-ghost'} style={{flex:1,padding:'10px 8px',fontSize:13,borderRadius:10}}>
                {g==='lose'?'Lose fat':g==='gain'?'Build muscle':'Maintain'}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          {[{label:'Calories',key:'cal_target',unit:'kcal'},{label:'Protein',key:'protein_target',unit:'g'},{label:'Carbs',key:'carb_target',unit:'g'},{label:'Fat',key:'fat_target',unit:'g'},{label:'Fiber',key:'fiber_target',unit:'g'},{label:'Goal weight',key:'weight_goal',unit:'kg'},{label:'Water goal',key:'water_goal',unit:'ml'}].map(f=>(
            <div key={f.key}>
              <label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:6}}>{f.label} ({f.unit})</label>
              <input type="number" value={form[f.key as keyof typeof form]} onChange={e=>setForm(p=>({...p,[f.key]:parseFloat(e.target.value)||0}))}/>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{width:'100%',padding:'14px'}} onClick={saveProfile} disabled={saving}>
          {saving?'Saving…':saved?'✓ Saved!':'Save goals'}
        </button>
      </div>
      <div style={{marginBottom:16}} className="card">
        <p style={{fontSize:13,color:'var(--muted)',marginBottom:8}}>Reminders</p>
        <p style={{fontSize:12,color:'var(--muted)',marginBottom:12,lineHeight:1.6}}>Enable browser notifications for meal reminders.</p>
        <button className="btn btn-ghost" style={{width:'100%',fontSize:13}} onClick={async()=>{
          const p=await Notification.requestPermission()
          if(p==='granted')new Notification('NutriTrack reminders on!',{body:"We'll remind you to log your meals."})
        }}>Enable notifications</button>
      </div>
      <BottomNav/>
    </div>
  )
}
