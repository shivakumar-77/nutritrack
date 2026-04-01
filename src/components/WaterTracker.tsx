'use client'
import { useState, useRef } from 'react'
const AMOUNTS = [100,250,500,750,1000]
export default function WaterTracker({waterGoal=2000}:{waterGoal?:number}) {
  const [totalMl,setTotalMl] = useState(0)
  const [selectedIdx,setSelectedIdx] = useState(1)
  const [logs,setLogs] = useState<{ml:number,time:string}[]>([])
  const startY = useRef(0)
  const ITEM_H = 52
  function onDragStart(y:number){startY.current=y}
  function onDragEnd(y:number){
    const diff=startY.current-y
    if(Math.abs(diff)<10)return
    if(diff>20)setSelectedIdx(i=>Math.min(AMOUNTS.length-1,i+1))
    if(diff<-20)setSelectedIdx(i=>Math.max(0,i-1))
  }
  function addWater(){
    const ml=AMOUNTS[selectedIdx]
    setTotalMl(prev=>Math.min(waterGoal,prev+ml))
    setLogs(prev=>[{ml,time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})},...prev].slice(0,6))
  }
  const pct=Math.min(1,totalMl/waterGoal)
  const wc=totalMl>=waterGoal?'#4ade80':'#60a5fa'
  const ww=totalMl>=waterGoal?'#86efac':'#93c5fd'
  const fillH=Math.round(140*pct)
  const fillY=150-fillH
  return (
    <div className="card" style={{marginTop:16,padding:'16px 20px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <div style={{fontWeight:500,fontSize:14}}>Water intake</div>
          <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{totalMl}ml of {waterGoal}ml</div>
        </div>
        <div style={{fontSize:12,fontWeight:500,color:totalMl>=waterGoal?'var(--green)':'var(--muted)'}}>
          {totalMl>=waterGoal?'Goal reached!':`${waterGoal-totalMl}ml to go`}
        </div>
      </div>
      <div style={{display:'flex',gap:16,alignItems:'center'}}>
        <div style={{flexShrink:0}}>
          <svg width="72" height="170" viewBox="0 0 72 170">
            <defs><clipPath id="wclip"><path d="M6 10 L3 158 Q3 162 7 162 L65 162 Q69 162 69 158 L66 10 Z"/></clipPath></defs>
            <path d="M6 10 L3 158 Q3 162 7 162 L65 162 Q69 162 69 158 L66 10 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
            <g clipPath="url(#wclip)">
              <rect x="3" y={fillY+6} width="66" height={Math.max(0,fillH)} fill={wc} style={{transition:'y 0.7s cubic-bezier(0.34,1.56,0.64,1),height 0.7s cubic-bezier(0.34,1.56,0.64,1)'}}/>
              {totalMl>0&&<ellipse cx="36" cy={fillY+6} rx="33" ry="5" fill={ww} style={{transition:'cy 0.7s cubic-bezier(0.34,1.56,0.64,1)'}}/>}
              {pct>0.15&&<><circle cx="18" cy={fillY+22} r="2" fill="rgba(255,255,255,0.25)" style={{animation:'b1 2s ease-in-out infinite'}}/><circle cx="52" cy={fillY+40} r="1.5" fill="rgba(255,255,255,0.2)" style={{animation:'b2 2.8s ease-in-out infinite'}}/></>}
            </g>
          </svg>
          {totalMl>0&&<button onClick={()=>{setTotalMl(0);setLogs([])}} style={{display:'block',margin:'4px auto 0',background:'none',border:'none',color:'var(--muted)',fontSize:10,cursor:'pointer'}}>reset</button>}
        </div>
        <div style={{flex:1}}>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:8,textAlign:'center'}}>Scroll to pick amount</div>
            <div style={{position:'relative',height:ITEM_H*3,overflow:'hidden',borderRadius:14,background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',cursor:'ns-resize',userSelect:'none'}}
              onTouchStart={e=>onDragStart(e.touches[0].clientY)} onTouchEnd={e=>onDragEnd(e.changedTouches[0].clientY)}
              onMouseDown={e=>onDragStart(e.clientY)} onMouseUp={e=>onDragEnd(e.clientY)}>
              <div style={{position:'absolute',top:ITEM_H,left:0,right:0,height:ITEM_H,background:'rgba(96,165,250,0.12)',borderTop:'1px solid rgba(96,165,250,0.3)',borderBottom:'1px solid rgba(96,165,250,0.3)',zIndex:1,pointerEvents:'none'}}/>
              <div style={{position:'absolute',width:'100%',transition:'transform 0.25s cubic-bezier(0.34,1.2,0.64,1)',transform:`translateY(${(1-selectedIdx)*ITEM_H}px)`}}>
                {AMOUNTS.map((ml,i)=>{const d=Math.abs(i-selectedIdx);return(
                  <div key={ml} onClick={()=>setSelectedIdx(i)} style={{height:ITEM_H,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',cursor:'pointer',transition:'all 0.2s',opacity:d===0?1:d===1?0.5:0.2,transform:`scale(${d===0?1:d===1?0.88:0.75})`}}>
                    <span style={{fontSize:d===0?22:17,fontWeight:d===0?600:400,color:d===0?'var(--text)':'var(--muted)',lineHeight:1.1}}>{ml}</span>
                    <span style={{fontSize:10,color:'var(--muted)',marginTop:1}}>ml</span>
                  </div>
                )})}
              </div>
              <div style={{position:'absolute',top:0,left:0,right:0,height:ITEM_H,background:'linear-gradient(to bottom,var(--card),transparent)',pointerEvents:'none',zIndex:2}}/>
              <div style={{position:'absolute',bottom:0,left:0,right:0,height:ITEM_H,background:'linear-gradient(to top,var(--card),transparent)',pointerEvents:'none',zIndex:2}}/>
              <div style={{position:'absolute',top:6,left:0,right:0,textAlign:'center',fontSize:10,color:'var(--muted)',zIndex:3,pointerEvents:'none'}}>▲</div>
              <div style={{position:'absolute',bottom:6,left:0,right:0,textAlign:'center',fontSize:10,color:'var(--muted)',zIndex:3,pointerEvents:'none'}}>▼</div>
            </div>
          </div>
          <button className="btn btn-primary" style={{width:'100%',padding:'13px',fontSize:14,fontWeight:600}} onClick={addWater}>+ Add {AMOUNTS[selectedIdx]}ml</button>
          {logs.length>0&&<div style={{marginTop:10,display:'flex',flexWrap:'wrap',gap:6}}>{logs.map((l,i)=><div key={i} style={{fontSize:11,padding:'3px 8px',borderRadius:99,background:'rgba(96,165,250,0.1)',color:'#93c5fd'}}>+{l.ml}ml {l.time}</div>)}</div>}
        </div>
      </div>
      <div style={{marginTop:14,height:4,background:'rgba(255,255,255,0.06)',borderRadius:2}}>
        <div style={{height:'100%',borderRadius:2,background:wc,width:`${pct*100}%`,transition:'width 0.6s ease'}}/>
      </div>
    </div>
  )
}
