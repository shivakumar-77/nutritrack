'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Profile, type FoodLog } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import MacroRing from '@/components/MacroRing'
import FoodLogItem from '@/components/FoodLogItem'
import WaterTracker from '@/components/WaterTracker'
export const dynamic = 'force-dynamic'
const today = () => new Date().toISOString().slice(0,10)
const fmt = (n:number) => Math.round(n)
export default function Dashboard() {
  const router = useRouter()
  const [profile,setProfile] = useState<Profile|null>(null)
  const [logs,setLogs] = useState<FoodLog[]>([])
  const [loading,setLoading] = useState(true)
  const load = useCallback(async()=>{
    const {data:{user}} = await supabase.auth.getUser()
    if(!user){router.replace('/auth');return}
    const [{data:prof},{data:foodLogs}] = await Promise.all([
      supabase.from('profiles').select('*').eq('id',user.id).single(),
      supabase.from('food_logs').select('*').eq('user_id',user.id).eq('logged_at',today()).order('created_at')
    ])
    if(prof)setProfile(prof as Profile)
    if(foodLogs)setLogs(foodLogs as FoodLog[])
    setLoading(false)
  },[router])
  useEffect(()=>{load()},[load])
  const totals = logs.reduce((a,l)=>({cal:a.cal+l.cal,protein:a.protein+l.protein,carb:a.carb+l.carb,fat:a.fat+l.fat,fiber:a.fiber+l.fiber}),{cal:0,protein:0,carb:0,fat:0,fiber:0})
  const g = profile ?? {cal_target:1700,protein_target:167,carb_target:144,fat_target:60,fiber_target:25,goal:'lose',water_goal:2000}
  async function deleteLog(id:string){
    await supabase.from('food_logs').delete().eq('id',id)
    setLogs(prev=>prev.filter(l=>l.id!==id))
  }
  const mealGroups = ['breakfast','lunch','dinner','snack','other']
  if(loading) return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100dvh'}}>
      <div style={{width:28,height:28,borderRadius:'50%',border:'2px solid var(--green)',borderTopColor:'transparent',animation:'spin 0.7s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  return(
    <div className="page">
      <div style={{paddingTop:24,paddingBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <p style={{color:'var(--muted)',fontSize:13}}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
          <h1 style={{fontSize:22,fontWeight:600,letterSpacing:'-0.02em',marginTop:2}}>{profile?.name?`Hey, ${profile.name.split(' ')[0]}`:'Today'}</h1>
        </div>
        <div style={{padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:500,background:profile?.goal==='lose'?'rgba(74,222,128,0.12)':profile?.goal==='gain'?'rgba(96,165,250,0.12)':'rgba(251,191,36,0.12)',color:profile?.goal==='lose'?'var(--green)':profile?.goal==='gain'?'var(--blue)':'var(--amber)'}}>
          {profile?.goal==='lose'?'Fat loss':profile?.goal==='gain'?'Muscle gain':'Maintain'}
        </div>
      </div>
      <div style={{marginTop:20,display:'flex',justifyContent:'center'}}>
        <MacroRing cal={totals.cal} calTarget={g.cal_target} protein={totals.protein} proteinTarget={g.protein_target} carb={totals.carb} carbTarget={g.carb_target} fat={totals.fat} fatTarget={g.fat_target} remaining={g.cal_target-totals.cal}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:16}}>
        {[{label:'Protein',val:totals.protein,target:g.protein_target,unit:'g',color:'#60a5fa'},{label:'Carbs',val:totals.carb,target:g.carb_target,unit:'g',color:'#fbbf24'},{label:'Fat',val:totals.fat,target:g.fat_target,unit:'g',color:'#f87171'},{label:'Fiber',val:totals.fiber,target:g.fiber_target,unit:'g',color:'#a78bfa'}].map(m=>(
          <div key={m.label} className="card" style={{padding:'14px 16px'}}>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:6}}>{m.label}</div>
            <div style={{fontSize:20,fontWeight:600}}>{fmt(m.val)}<span style={{fontSize:13,color:'var(--muted)',fontWeight:400}}>/{m.target}{m.unit}</span></div>
            <div style={{marginTop:8,height:3,background:'rgba(255,255,255,0.06)',borderRadius:2}}>
              <div style={{height:'100%',borderRadius:2,background:m.color,width:`${Math.min(100,(m.val/m.target)*100)}%`,transition:'width 0.6s ease'}}/>
            </div>
          </div>
        ))}
      </div>
      <WaterTracker waterGoal={profile?.water_goal??2000}/>
      <button className="btn btn-primary pulse-green" style={{width:'100%',marginTop:16,fontSize:16,fontWeight:600,padding:'16px'}} onClick={()=>router.push('/log')}>+ Log food</button>
      <div style={{marginTop:28}}>
        {logs.length===0?(
          <div style={{textAlign:'center',padding:'40px 0',color:'var(--muted)'}}>
            <div style={{fontSize:36,marginBottom:12}}>🍽️</div>
            <p>Nothing logged yet today</p>
            <p style={{fontSize:13,marginTop:4}}>Tap "Log food" to start</p>
          </div>
        ):(
          mealGroups.map(meal=>{
            const items=logs.filter(l=>l.meal_type===meal)
            if(!items.length)return null
            return(
              <div key={meal} style={{marginBottom:20}}>
                <p style={{fontSize:12,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',marginBottom:10}}>{meal}</p>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {items.map(log=>(<FoodLogItem key={log.id} log={log} onDelete={deleteLog}/>))}
                </div>
              </div>
            )
          })
        )}
      </div>
      <BottomNav/>
    </div>
  )
}
