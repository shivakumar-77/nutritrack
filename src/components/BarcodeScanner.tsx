'use client'
import { useRef, useState, useEffect } from 'react'

interface Props { onResult: (result: any) => void }

export default function BarcodeScanner({ onResult }: Props) {
  const [mode, setMode] = useState<'idle'|'scanning'|'manual'>('idle')
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<any>(null)
  const streamRef = useRef<MediaStream|null>(null)

  async function startScan() {
    setError(''); setHint('Starting camera…')
    setMode('scanning')
    await new Promise(r => setTimeout(r, 400))
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setHint('Align barcode in the green frame…')
      const { BrowserMultiFormatReader } = await import('@zxing/browser')
      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader
      scanLoop(reader)
    } catch (e: any) {
      setError('Camera not available. Use manual entry below.')
      setMode('manual')
    }
  }

  async function scanLoop(reader: any) {
    if (!videoRef.current) return
    try {
      const result = await reader.decodeOnceFromVideoElement(videoRef.current)
      if (result?.getText()) {
        setHint('Barcode detected!')
        await lookup(result.getText())
      }
    } catch {
      if (streamRef.current) setTimeout(() => scanLoop(reader), 300)
    }
  }

  function stopScan() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setMode('idle'); setHint('')
  }

  async function lookup(code: string) {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(code.trim())}`)
      const data = await res.json()
      if (data.result) { stopScan(); onResult(data.result) }
      else { setError(`"${code}" not found. Try manual entry.`); setMode('idle') }
    } catch { setError('Lookup failed.') }
    finally { setLoading(false) }
  }

  useEffect(() => () => stopScan(), [])

  return (
    <div>
      <style>{`
        @keyframes scanline{0%,100%{top:20%}50%{top:75%}}
        .sl{position:absolute;left:8%;right:8%;height:2px;background:rgba(74,222,128,0.9);animation:scanline 1.8s ease-in-out infinite;pointer-events:none}
        .sc{position:absolute;width:22px;height:22px;pointer-events:none}
        .sc.tl{top:10%;left:8%;border-top:3px solid #4ade80;border-left:3px solid #4ade80}
        .sc.tr{top:10%;right:8%;border-top:3px solid #4ade80;border-right:3px solid #4ade80}
        .sc.bl{bottom:10%;left:8%;border-bottom:3px solid #4ade80;border-left:3px solid #4ade80}
        .sc.br{bottom:10%;right:8%;border-bottom:3px solid #4ade80;border-right:3px solid #4ade80}
      `}</style>

      {mode==='idle' && (
        <div style={{textAlign:'center',padding:'20px 0'}}>
          <div style={{fontSize:52,marginBottom:14}}>📦</div>
          <p style={{fontWeight:500,fontSize:16,marginBottom:6}}>Scan product barcode</p>
          <p style={{color:'var(--muted)',fontSize:13,marginBottom:24}}>Point camera at any packaged food barcode</p>
          <button className="btn btn-primary pulse-green" style={{width:'100%',padding:'16px',fontSize:15,fontWeight:600,marginBottom:10}} onClick={startScan}>
            Start scanning
          </button>
          <button className="btn btn-ghost" style={{width:'100%',padding:'14px',fontSize:14}} onClick={()=>setMode('manual')}>
            Enter barcode number
          </button>
          {error&&<div style={{marginTop:12,background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:12,padding:'10px 14px'}}><p style={{color:'var(--red)',fontSize:13}}>{error}</p></div>}
        </div>
      )}

      {mode==='scanning' && (
        <div>
          <div style={{position:'relative',borderRadius:16,overflow:'hidden',background:'#000',marginBottom:12}}>
            <video ref={videoRef} muted playsInline style={{width:'100%',height:280,objectFit:'cover',display:'block'}}/>
            <div className="sl"/>
            <div className="sc tl"/><div className="sc tr"/>
            <div className="sc bl"/><div className="sc br"/>
          </div>
          <p style={{textAlign:'center',color:loading?'var(--green)':'var(--muted)',fontSize:13,marginBottom:12}}>
            {loading?'Looking up product…':hint}
          </p>
          {error&&<div style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:12,padding:'10px 14px',marginBottom:12}}><p style={{color:'var(--red)',fontSize:13}}>{error}</p></div>}
          <button className="btn btn-ghost" style={{width:'100%',marginBottom:12}} onClick={stopScan}>Cancel</button>
          <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
            <p style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>Or type barcode number</p>
            <div style={{display:'flex',gap:8}}>
              <input type="number" placeholder="e.g. 8901058857538" value={manualCode}
                onChange={e=>setManualCode(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&manualCode&&lookup(manualCode)} style={{flex:1}}/>
              <button className="btn btn-primary" onClick={()=>manualCode&&lookup(manualCode)}
                disabled={loading||!manualCode} style={{flexShrink:0,padding:'12px 16px'}}>
                {loading?'…':'Go'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mode==='manual' && (
        <div>
          <button onClick={()=>setMode('idle')} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:13,marginBottom:20,padding:0}}>← Back</button>
          <h3 style={{fontSize:16,fontWeight:500,marginBottom:6}}>Enter barcode number</h3>
          <p style={{fontSize:13,color:'var(--muted)',marginBottom:16}}>Find the number printed below the barcode lines</p>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <input type="number" placeholder="e.g. 8901058857538" value={manualCode}
              onChange={e=>setManualCode(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&manualCode&&lookup(manualCode)}
              style={{flex:1}} autoFocus/>
            <button className="btn btn-primary" onClick={()=>manualCode&&lookup(manualCode)}
              disabled={loading||!manualCode} style={{flexShrink:0,padding:'12px 18px'}}>
              {loading?'…':'Search'}
            </button>
          </div>
          {loading&&<p style={{textAlign:'center',color:'var(--muted)',fontSize:13}}>Looking up product…</p>}
          {error&&<div style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:12,padding:'10px 14px'}}><p style={{color:'var(--red)',fontSize:13}}>{error}</p></div>}
        </div>
      )}
    </div>
  )
}
