'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import BarcodeScanner from '@/components/BarcodeScanner'
export const dynamic = 'force-dynamic'
interface Food { name:string; cal:number; protein:number; carb:number; fat:number; fiber:number; unit:string; baseQty:number }
interface MacroResult extends Food { qty:number }
const MEAL_TYPES = ['breakfast','lunch','dinner','snack','other']
const today = () => new Date().toISOString().slice(0,10)
function scale(food:Food,qty:number):MacroResult {
  const r=qty/food.baseQty
  return {...food,qty,cal:Math.round(food.cal*r),protein:Math.round(food.protein*r*10)/10,carb:Math.round(food.carb*r*10)/10,fat:Math.round(food.fat*r*10)/10,fiber:Math.round(food.fiber*r*10)/10}
}
export default function LogPage() {
  const router = useRouter()
  const [tab,setTab] = useState<'search'|'scan'|'barcode'|'manual'>('search')
  const [query,setQuery] = useState('')
  const [results,setResults] = useState<Food[]>([])
  const [searching,setSearching] = useState(false)
  const [selected,setSelected] = useState<Food|null>(null)
  const [qty,setQty] = useState(1)
  const [mealType,setMealType] = useState('other')
  const [saving,setSaving] = useState(false)
  const [photoPreview,setPhotoPreview] = useState<string|null>(null)
  const [scanning,setScanning] = useState(false)
  const [manual,setManual] = useState({name:'',qty:'1',unit:'piece',cal:'',protein:'',carb:'',fat:'',fiber:''})
  const fileRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<any>(null)
  function onQueryChange(val:string){
    setQuery(val);setSelected(null)
    clearTimeout(debounceRef.current)
    if(!val.trim()){setResults([]);return}
    debounceRef.current=setTimeout(()=>searchFood(val),300)
  }
  async function searchFood(q:string){
    setSearching(true)
    try{
      const res=await fetch('/api/meal-search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})})
      const data=await res.json()
      setResults(data.results??[])
    }catch{setResults([])}finally{setSearching(false)}
  }
  function selectFood(food:Food){setSelected(food);setQty(food.baseQty);setResults([]);setQuery(food.name)}
  const preview=selected?scale(selected,qty):null
  async function logFood(){
    if(!preview)return
    setSaving(true)
    const {data:{user}}=await supabase.auth.getUser()
    if(!user){router.replace('/auth');return}
    await supabase.from('food_logs').insert({user_id:user.id,logged_at:today(),name:preview.name,qty:preview.qty,unit:preview.unit,cal:preview.cal,protein:preview.protein,carb:preview.carb,fat:preview.fat,fiber:preview.fiber,meal_type:mealType})
    setSaving(false);router.push('/dashboard')
  }
  async function logManual(){
    setSaving(true)
    const {data:{user}}=await supabase.auth.getUser()
    if(!user)return
    await supabase.from('food_logs').insert({user_id:user.id,logged_at:today(),name:manual.name||'Custom food',qty:parseFloat(manual.qty)||1,unit:manual.unit,cal:parseFloat(manual.cal)||0,protein:parseFloat(manual.protein)||0,carb:parseFloat(manual.carb)||0,fat:parseFloat(manual.fat)||0,fiber:parseFloat(manual.fiber)||0,meal_type:mealType})
    setSaving(false);router.push('/dashboard')
  }
  async function autoFill(){
    if(!manual.name)return
    setSearching(true)
    try{
      const res=await fetch('/api/meal-search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:manual.name})})
      const data=await res.json()
      if(data.results?.[0]){
        const f=data.results[0]
        setManual(p=>({...p,cal:String(f.cal),protein:String(f.protein),carb:String(f.carb),fat:String(f.fat),fiber:String(f.fiber),unit:f.unit,qty:String(f.baseQty)}))
      }
    }catch{}finally{setSearching(false)}
  }
  async function scanPhoto(e:React.ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];if(!file)return
    const reader=new FileReader()
    reader.onload=async ev=>{
      const base64=(ev.target?.result as string).split(',')[1]
      setPhotoPreview(ev.target?.result as string);setScanning(true)
      try{
        const res=await fetch('/api/ai-scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:base64,mimeType:file.type})})
        const data=await res.json()
        if(data.result){setSelected({...data.result,baseQty:data.result.qty});setQty(data.result.qty);setTab('search')}
      }catch{}finally{setScanning(false)}
    }
    reader.readAsDataURL(file);e.target.value=''
  }
  return(
    <div className="page" style={{paddingTop:24}}>
      <h1 style={{fontSize:22,fontWeight:600,letterSpacing:'-0.02em',marginBottom:20}}>Log food</h1>
      <div style={{display:'flex',gap:8,marginBottom:20,overflowX:'auto',paddingBottom:4}}>
        {(['search','scan','barcode','manual'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={tab===t?'btn btn-primary':'btn btn-ghost'} style={{padding:'8px 16px',fontSize:13,borderRadius:99,whiteSpace:'nowrap'}}>
            {t==='search'?'🔍 Search':t==='scan'?'📷 AI Scan':t==='barcode'?'📊 Barcode':'✏️ Manual'}
          </button>
        ))}
      </div>
      {tab==='search'&&(
        <div>
          <div style={{position:'relative',marginBottom:12}}>
            <input placeholder="Search — egg, chicken, dosa, dal…" value={query} onChange={e=>onQueryChange(e.target.value)} autoFocus style={{paddingRight:query?36:14}}/>
            {query&&<button onClick={()=>{setQuery('');setResults([]);setSelected(null)}} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:18}}>×</button>}
          </div>
          {results.length>0&&!selected&&(
            <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden',marginBottom:16}}>
              {results.map((r,i)=>(
                <button key={i} onClick={()=>selectFood(r)} style={{width:'100%',padding:'14px 16px',textAlign:'left',background:'none',border:'none',borderBottom:i<results.length-1?'1px solid var(--border)':'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',transition:'background 0.1s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.04)')} onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                  <div>
                    <div style={{fontWeight:500,fontSize:14,color:'var(--text)'}}>{r.name}</div>
                    <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>per {r.baseQty}{r.unit} · {r.cal} kcal · {r.protein}g protein</div>
                  </div>
                  <div style={{color:'var(--green)',fontSize:18}}>›</div>
                </button>
              ))}
            </div>
          )}
          {searching&&<p style={{color:'var(--muted)',fontSize:13,textAlign:'center',padding:'16px 0'}}>Searching…</p>}
          {selected&&(
            <div className="slide-up">
              <div className="card" style={{marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:16}}>{selected.name}</div>
                    <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>per {selected.baseQty} {selected.unit}</div>
                  </div>
                  <button onClick={()=>{setSelected(null);setQuery('')}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:20}}>×</button>
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:8}}>Quantity ({selected.unit})</label>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <button onClick={()=>setQty(q=>Math.max(selected.unit==='piece'||selected.unit==='scoop'||selected.unit==='slice'?1:10,q-(selected.unit==='piece'||selected.unit==='scoop'?1:10)))} style={{width:44,height:44,borderRadius:12,background:'var(--card2)',border:'1px solid var(--border)',color:'var(--text)',fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>−</button>
                    <input type="number" value={qty} onChange={e=>setQty(Math.max(0,parseFloat(e.target.value)||0))} style={{textAlign:'center',fontWeight:600,fontSize:20,flex:1}}/>
                    <button onClick={()=>setQty(q=>q+(selected.unit==='piece'||selected.unit==='scoop'?1:10))} style={{width:44,height:44,borderRadius:12,background:'var(--card2)',border:'1px solid var(--border)',color:'var(--text)',fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>+</button>
                  </div>
                </div>
                {preview&&(
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
                    {[{l:'Calories',v:preview.cal,u:'kcal',c:'#4ade80'},{l:'Protein',v:preview.protein,u:'g',c:'#60a5fa'},{l:'Carbs',v:preview.carb,u:'g',c:'#fbbf24'},{l:'Fat',v:preview.fat,u:'g',c:'#f87171'}].map(m=>(
                      <div key={m.l} style={{background:'var(--card2)',borderRadius:10,padding:'10px 8px',textAlign:'center'}}>
                        <div style={{fontSize:10,color:'var(--muted)',marginBottom:4}}>{m.l}</div>
                        <div style={{fontSize:16,fontWeight:600,color:m.c}}>{m.v}</div>
                        <div style={{fontSize:10,color:'var(--muted)'}}>{m.u}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:8}}>Meal</label>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {MEAL_TYPES.map(m=>(
                      <button key={m} onClick={()=>setMealType(m)} className={mealType===m?'btn btn-primary':'btn btn-ghost'} style={{padding:'6px 14px',fontSize:12,borderRadius:99}}>
                        {m.charAt(0).toUpperCase()+m.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn btn-primary" style={{width:'100%',padding:'14px',fontSize:15,fontWeight:600}} onClick={logFood} disabled={saving}>
                  {saving?'Saving…':`Add ${preview?.cal} kcal to ${mealType}`}
                </button>
              </div>
            </div>
          )}
          {!query&&!selected&&(
            <div style={{textAlign:'center',padding:'32px 0',color:'var(--muted)'}}>
              <div style={{fontSize:40,marginBottom:12}}>🥗</div>
              <p style={{fontSize:14}}>Start typing to search</p>
              <p style={{fontSize:12,marginTop:4}}>egg, chicken, rice, dal, roti, dosa…</p>
            </div>
          )}
        </div>
      )}
      {tab==='scan'&&(
        <div style={{textAlign:'center'}}>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={scanPhoto} style={{display:'none'}}/>
          {photoPreview?(
            <div>
              <img src={photoPreview} alt="Food" style={{width:'100%',borderRadius:16,marginBottom:16,maxHeight:280,objectFit:'cover'}}/>
              {scanning&&<div style={{color:'var(--muted)',fontSize:14,padding:'16px 0'}}><div style={{width:24,height:24,borderRadius:'50%',border:'2px solid var(--green)',borderTopColor:'transparent',animation:'spin 0.7s linear infinite',margin:'0 auto 10px'}}/>Analysing photo…</div>}
              {!scanning&&selected&&<p style={{color:'var(--green)',fontSize:14}}>Found! Switch to Search tab to adjust qty.</p>}
              <button className="btn btn-ghost" style={{marginTop:8}} onClick={()=>{setPhotoPreview(null);fileRef.current?.click()}}>Try another photo</button>
            </div>
          ):(
            <div style={{padding:'40px 0'}}>
              <div style={{fontSize:64,marginBottom:16}}>📷</div>
              <p style={{fontWeight:500,marginBottom:8}}>Take a photo of your food</p>
              <p style={{color:'var(--muted)',fontSize:13,marginBottom:24}}>AI identifies the food and estimates macros</p>
              <button className="btn btn-primary pulse-green" style={{padding:'14px 32px',fontSize:15}} onClick={()=>fileRef.current?.click()}>Open camera</button>
            </div>
          )}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
      {tab==='barcode'&&<BarcodeScanner onResult={f=>{setSelected({...f,baseQty:f.qty});setQty(f.qty);setTab('search')}}/>}
      {tab==='manual'&&(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div>
            <label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:6}}>Food name</label>
            <div style={{display:'flex',gap:8}}>
              <input placeholder="e.g. Chicken tikka, Masala dosa…" value={manual.name} onChange={e=>setManual(p=>({...p,name:e.target.value}))} style={{flex:1}}/>
              <button className="btn btn-ghost" style={{flexShrink:0,padding:'12px 14px',fontSize:13}} disabled={!manual.name||searching} onClick={autoFill}>
                {searching?'…':'Auto-fill'}
              </button>
            </div>
            <p style={{fontSize:11,color:'var(--muted)',marginTop:4}}>Tap Auto-fill to get macros automatically</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div><label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:6}}>Quantity</label><input type="number" value={manual.qty} onChange={e=>setManual(p=>({...p,qty:e.target.value}))}/></div>
            <div><label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:6}}>Unit</label>
              <select value={manual.unit} onChange={e=>setManual(p=>({...p,unit:e.target.value}))}>
                <option value="piece">piece / egg</option><option value="g">grams (g)</option><option value="ml">ml</option><option value="scoop">scoop</option><option value="slice">slice</option>
              </select>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[{l:'Calories (kcal)',k:'cal',c:'#4ade80'},{l:'Protein (g)',k:'protein',c:'#60a5fa'},{l:'Carbs (g)',k:'carb',c:'#fbbf24'},{l:'Fat (g)',k:'fat',c:'#f87171'},{l:'Fiber (g)',k:'fiber',c:'#a78bfa'}].map(f=>(
              <div key={f.k}><label style={{fontSize:12,color:f.c,display:'block',marginBottom:6}}>{f.l}</label><input type="number" placeholder="0" value={manual[f.k as keyof typeof manual]} onChange={e=>setManual(p=>({...p,[f.k]:e.target.value}))}/></div>
            ))}
          </div>
          <div>
            <label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:8}}>Meal</label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {MEAL_TYPES.map(m=><button key={m} onClick={()=>setMealType(m)} className={mealType===m?'btn btn-primary':'btn btn-ghost'} style={{padding:'6px 14px',fontSize:12,borderRadius:99}}>{m.charAt(0).toUpperCase()+m.slice(1)}</button>)}
            </div>
          </div>
          <button className="btn btn-primary" style={{padding:'14px',fontSize:15,fontWeight:600}} onClick={logManual} disabled={saving}>{saving?'Saving…':'Add to log'}</button>
        </div>
      )}
      <BottomNav/>
    </div>
  )
}