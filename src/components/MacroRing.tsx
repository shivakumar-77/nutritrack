'use client'
interface Props { cal:number; calTarget:number; protein:number; proteinTarget:number; carb:number; carbTarget:number; fat:number; fatTarget:number; remaining:number }
const pct = (v:number,t:number) => Math.min(1,v/t)
export default function MacroRing({cal,calTarget,protein,proteinTarget,carb,carbTarget,fat,fatTarget,remaining}:Props) {
  const over = cal > calTarget
  return (
    <div style={{position:'relative',width:220,height:220}}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
        <circle cx="110" cy="110" r="90" fill="none" stroke={over?'#f87171':'#4ade80'} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${2*Math.PI*90}`} strokeDashoffset={2*Math.PI*90*(1-pct(cal,calTarget))}
          style={{transformOrigin:'110px 110px',transform:'rotate(-90deg)',transition:'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)'}}/>
        <circle cx="110" cy="110" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7"/>
        <circle cx="110" cy="110" r="70" fill="none" stroke="#60a5fa" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${2*Math.PI*70}`} strokeDashoffset={2*Math.PI*70*(1-pct(protein,proteinTarget))}
          style={{transformOrigin:'110px 110px',transform:'rotate(-90deg)',transition:'stroke-dashoffset 0.8s 0.1s cubic-bezier(0.34,1.56,0.64,1)'}}/>
        <circle cx="110" cy="110" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7"/>
        <circle cx="110" cy="110" r="52" fill="none" stroke="#fbbf24" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${2*Math.PI*52}`} strokeDashoffset={2*Math.PI*52*(1-pct(carb,carbTarget))}
          style={{transformOrigin:'110px 110px',transform:'rotate(-90deg)',transition:'stroke-dashoffset 0.8s 0.2s cubic-bezier(0.34,1.56,0.64,1)'}}/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div style={{fontSize:32,fontWeight:700,letterSpacing:'-0.03em',color:over?'#f87171':'#f5f5f5'}}>{Math.round(cal)}</div>
        <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>kcal</div>
        <div style={{fontSize:13,marginTop:6,fontWeight:500,color:over?'#f87171':'var(--green)'}}>{over?`${Math.round(cal-calTarget)} over`:`${Math.round(remaining)} left`}</div>
        <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>of {calTarget}</div>
      </div>
    </div>
  )
}
