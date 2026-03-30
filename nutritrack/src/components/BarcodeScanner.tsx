'use client'
import { useRef, useState } from 'react'
interface Props { onResult:(result:any)=>void }
export default function BarcodeScanner({onResult}:Props){
  const inputRef=useRef<HTMLInputElement>(null)
  const [manualCode,setManualCode]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [status,setStatus]=useState('')
  async function lookup(code:string){
    setLoading(true);setError('');setStatus('Looking up…')
    try{
      const res=await fetch(`/api/barcode?code=${encodeURIComponent(code.trim())}`)
      const data=await res.json()
      if(data.result)onResult(data.result)
      else setError('Product not found. Try another barcode.')
    }catch{setError('Lookup failed.')}finally{setLoading(false);setStatus('')}
  }
  async function handleImage(e:React.ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];if(!file)return
    setStatus('Reading barcode…');setError('')
    try{
      const {BrowserMultiFormatReader}=await import('@zxing/library')
      const reader=new BrowserMultiFormatReader()
      const url=URL.createObjectURL(file)
      const img=new Image();img.src=url
      img.onload=async()=>{
        try{
          const result=await reader.decodeFromImageElement(img)
          if(result?.getText()){URL.revokeObjectURL(url);await lookup(result.getText())}
        }catch{URL.revokeObjectURL(url);setError('Could not read barcode. Enter manually.');setStatus('')}
      }
    }catch{setError('Scanner not available. Enter manually.');setStatus('')}
    e.target.value=''
  }
  return(
    <div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleImage} style={{display:'none'}}/>
      <div style={{textAlign:'center',padding:'16px 0 24px'}}>
        <button className="btn btn-primary pulse-green" style={{width:'100%',padding:'20px',fontSize:16,fontWeight:600,borderRadius:16}} onClick={()=>{setError('');inputRef.current?.click()}} disabled={loading}>
          {loading?'Looking up…':'📷  Scan barcode'}
        </button>
        <p style={{color:'var(--muted)',fontSize:12,marginTop:10}}>Takes a photo → reads barcode instantly</p>
      </div>
      {status&&<div style={{textAlign:'center',padding:'12px 0',color:'var(--muted)',fontSize:14}}><div style={{width:20,height:20,borderRadius:'50%',border:'2px solid var(--green)',borderTopColor:'transparent',animation:'spin 0.7s linear infinite',margin:'0 auto 8px'}}/>{status}</div>}
      {error&&<div style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:12,padding:'12px 14px',marginBottom:16}}><p style={{color:'var(--red)',fontSize:13}}>{error}</p></div>}
      <div style={{display:'flex',alignItems:'center',gap:12,margin:'8px 0 16px'}}>
        <div style={{flex:1,height:1,background:'var(--border)'}}/>
        <span style={{fontSize:12,color:'var(--muted)'}}>or enter manually</span>
        <div style={{flex:1,height:1,background:'var(--border)'}}/>
      </div>
      <div style={{display:'flex',gap:8}}>
        <input type="number" placeholder="e.g. 8901058857538" value={manualCode} onChange={e=>setManualCode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&manualCode&&lookup(manualCode)} style={{flex:1}}/>
        <button className="btn btn-primary" onClick={()=>manualCode&&lookup(manualCode)} disabled={loading||!manualCode} style={{flexShrink:0,padding:'12px 18px'}}>{loading?'…':'Go'}</button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
