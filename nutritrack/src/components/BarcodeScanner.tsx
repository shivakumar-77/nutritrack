'use client'
import { useRef, useState, useEffect } from 'react'

interface Props { onResult: (result: any) => void }

export default function BarcodeScanner({ onResult }: Props) {
  const [mode, setMode] = useState<'idle'|'scanning'|'manual'>('idle')
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detected, setDetected] = useState('')
  const quaggaRef = useRef<any>(null)

  async function startScan() {
    setError(''); setDetected('')
    setMode('scanning')
    await new Promise(r => setTimeout(r, 600))
    try {
      const Quagga = (await import('quagga')).default
      quaggaRef.current = Quagga
      Quagga.init({
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: document.getElementById('qv'),
          constraints: { facingMode: 'environment' },
        },
        decoder: {
          readers: ['ean_reader','ean_8_reader','code_128_reader','upc_reader','upc_e_reader']
        },
      }, (err: any) => {
        if (err) { setError('Camera failed. Use manual entry.'); setMode('idle'); return }
        Quagga.start()
      })
      Quagga.onDetected((data: any) => {
        const code = data?.result?.codeResult?.code
        if (!code) return
        setDetected(code)
        Quagga.stop()
        lookup(code)
      })
    } catch {
      setError('Scanner unavailable. Use manual entry.')
      setMode('idle')
    }
  }

  function stopScan() {
    try { quaggaRef.current?.stop() } catch {}
    setMode('idle'); setDetected('')
  }

  async function lookup(code: string) {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(code.trim())}`)
      const data = await res.json()
      if (data.result) { stopScan(); onResult(data.result) }
      else { setError(`"${code}" not found. Try another product.`); setMode('idle') }
    } catch { setError('Lookup failed.') }
    finally { setLoading(false) }
  }

  useEffect(() => () => { try { quaggaRef.current?.stop() } catch {} }, [])

  return (
    <div>
      <style>{`
        #qv { position:relative;width:100%;border-radius:16px;overflow:hidden;background:#000; }
        #qv video { width:100%;height:280px;object-fit:cover;display:block; }
        #qv canvas { display:none; }
        @keyframes scanline { 0%,100%{top:15%} 50%{top:80%} }
        .sl { position:absolute;left:8%;right:8%;height:2px;background:rgba(74,222,128,0.9);animation:scanline 1.8s ease-in-out infinite;box-shadow:0 0 8px rgba(74,222,128,0.5);pointer-events:none; }
        .sc { position:absolute;width:22px;height:22px;pointer-events:none; }
        .sc.tl{top:10%;left:8%;border-top:3px solid #4ade80;border-left:3px solid #4ade80;}
        .sc.tr{top:10%;right:8%;border-top:3px solid #4ade80;border-right:3px solid #4ade80;}
        .sc.bl{bottom:10%;left:8%;border-bottom:3px solid #4ade80;border-left:3px solid #4ade80;}
        .sc.br{bottom:10%;right:8%;border-bottom:3px solid #4ade80;border-right:3px solid #4ade80;}
      `}</style>

      {mode==='idle' && (
        <div style={{textAlign:'center',padding:'20px 0'}}>
          <div style={{fontSize:52,marginBottom:14}}>📦</div>
          <p style={{fontWeight:500,fontSize:16,marginBottom:6}}>Scan product barcode</p>
          <p style={{color:'var(--muted)',fontSize:13,marginBottom:24}}>Point camera at any packaged food barcode</p>
          <button className="btn btn-primary pulse-green" style={{width:'100%',padding:'16px',fontSize:15,fontWeight:600,marginBottom:10}} onClick={startScan}>
            Start scanning
          </button>
          <button className="btn btn-ghost" style={{width:'100%',padding:'14px',fontSize:14}} onClick={()=>{setMode('manual');setError('')}}>
            Enter barcode number
          </button>
          {error&&<div style={{marginTop:12,background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:12,padding:'10px 14px'}}><p style={{color:'var(--red)',fontSize:13}}>{error}</p></div>}
        </div>
      )}

      {mode==='scanning' && (
        <div>
          <div id="qv" style={{marginBottom:12}}>
            <div className="sl"/>
            <div className="sc tl"/><div className="sc tr"/>
            <div className="sc bl"/><div className="sc br"/>
          </div>
          <p style={{textAlign:'center',color:loading?'var(--green)':'var(--muted)',fontSize:13,marginBottom:12}}>
            {loading?`Found ${detected} — looking up…`:detected?`Detected: ${detected}`:'Align barcode in the green frame…'}
          </p>
          {error&&<div style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:12,padding:'10px 14px',marginBottom:12}}><p style={{color:'var(--red)',fontSize:13}}>{error}</p></div>}
          <button className="btn btn-ghost" style={{width:'100%',marginBottom:12}} onClick={stopScan}>Cancel</button>
          <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
            <p style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>Or type barcode number</p>
            <div style={{display:'flex',gap:8}}>
              <input type="number" placeholder="e.g. 8901058857538" value={manualCode} onChange={e=>setManualCode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&manualCode&&lookup(manualCode)} style={{flex:1}}/>
              <button className="btn btn-primary" onClick={()=>manualCode&&lookup(manualCode)} disabled={loading||!manualCode} style={{flexShrink:0,padding:'12px 16px'}}>{loading?'…':'Go'}</button>
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
            <input type="number" placeholder="e.g. 8901058857538" value={manualCode} onChange={e=>setManualCode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&manualCode&&lookup(manualCode)} style={{flex:1}} autoFocus/>
            <button className="btn btn-primary" onClick={()=>manualCode&&lookup(manualCode)} disabled={loading||!manualCode} style={{flexShrink:0,padding:'12px 18px'}}>{loading?'…':'Search'}</button>
          </div>
          {loading&&<p style={{textAlign:'center',color:'var(--muted)',fontSize:13}}>Looking up product…</p>}
          {error&&<div style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:12,padding:'10px 14px'}}><p style={{color:'var(--red)',fontSize:13}}>{error}</p></div>}
        </div>
      )}
    </div>
  )
}
