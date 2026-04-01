'use client'
import { useState } from 'react'
import { type FoodLog } from '@/lib/supabase'
interface Props { log:FoodLog; onDelete:(id:string)=>void }
export default function FoodLogItem({log,onDelete}:Props) {
  const [deleting,setDeleting] = useState(false)
  return (
    <div className="card slide-up" style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:12}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:500,fontSize:14,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{log.name}</div>
        <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>{log.qty}{log.unit} · {Math.round(log.protein)}g P · {Math.round(log.carb)}g C · {Math.round(log.fat)}g F</div>
      </div>
      <div style={{textAlign:'right',flexShrink:0}}>
        <div style={{fontSize:16,fontWeight:600}}>{Math.round(log.cal)}</div>
        <div style={{fontSize:11,color:'var(--muted)'}}>kcal</div>
      </div>
      <button onClick={async()=>{setDeleting(true);await onDelete(log.id)}} disabled={deleting}
        style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4,flexShrink:0,fontSize:18,lineHeight:1}}>×</button>
    </div>
  )
}
