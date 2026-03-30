'use client'
import { useRef, useState, useEffect } from 'react'

interface Props { onResult: (result: any) => void }

export default function BarcodeScanner({ onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanRef = useRef(false)
  const [mode, setMode] = useState<'idle' | 'scanning' | 'manual'>('idle')
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scanStatus, setScanStatus] = useState('')

  async function startScan() {
    setError(''); setScanStatus('Starting camera…')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setMode('scanning')
      setScanStatus('Hold barcode steady in the green box…')
      scanRef.current = true
      runScanLoop()
    } catch {
      setError('Camera not available. Use manual entry.')
      setMode('manual')
    }
  }

  async function runScanLoop() {
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/library')
      const reader = new BrowserMultiFormatReader()
      const tick = async () => {
        if (!scanRef.current || !videoRef.current) return
        try {
          const result = await reader.decodeFromVideoElement(videoRef.current)
          if (result?.getText()) {
            setScanStatus('Barcode found! Looking up…')
            scanRef.current = false
            await lookup(result.getText())
          } else { if (scanRef.current) setTimeout(tick, 300) }
        } catch { if (scanRef.current) setTimeout(tick, 300) }
      }
      setTimeout(tick, 800)
    } catch { setError('Scanner failed. Use manual entry below.') }
  }

  function stopScan() {
    scanRef.current = false
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setMode('idle'); setScanStatus('')
  }

  async function lookup(code: string) {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(code.trim())}`)
      const data = await res.json()
      if (data.result) { stopScan(); onResult(data.result) }
      else {
        setError(`Product "${code}" not found. Try another barcode.`)
        setScanStatus('Hold barcode steady…')
        scanRef.current = true
        runScanLoop()
      }
    } catch { setError('Lookup failed. Check connection.') }
    finally { setLoading(false) }
  }

  useEffect(() => () => stopScan(), [])

  return (
    <div>
      {mode === 'idle' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📦</div>
          <p style={{ fontWeight: 500, fontSize: 16, marginBottom: 8 }}>Scan product barcode</p>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Point camera at any packaged food barcode</p>
          <button className="btn btn-primary pulse-green" style={{ width: '100%', padding: '16px', fontSize: 15, fontWeight: 600, marginBottom: 10 }} onClick={startScan}>
            Start scanning
          </button>
          <button className="btn btn-ghost" style={{ width: '100%', padding: '14px', fontSize: 14 }} onClick={() => setMode('manual')}>
            Enter barcode manually
          </button>
        </div>
      )}

      {mode === 'scanning' && (
        <div>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#000', marginBottom: 12 }}>
            <video ref={videoRef} muted playsInline
              style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
            {/* Scanning overlay */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ position: 'relative', width: 260, height: 100 }}>
                {/* Corner borders */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTop: '3px solid #4ade80', borderLeft: '3px solid #4ade80', borderRadius: '4px 0 0 0' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderTop: '3px solid #4ade80', borderRight: '3px solid #4ade80', borderRadius: '0 4px 0 0' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderBottom: '3px solid #4ade80', borderLeft: '3px solid #4ade80', borderRadius: '0 0 0 4px' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottom: '3px solid #4ade80', borderRight: '3px solid #4ade80', borderRadius: '0 0 4px 0' }} />
                {/* Scan line */}
                <div style={{ position: 'absolute', top: '50%', left: 8, right: 8, height: 2, background: 'rgba(74,222,128,0.8)', animation: 'scanline 1.5s ease-in-out infinite' }} />
              </div>
            </div>
          </div>
          <p style={{ textAlign: 'center', color: loading ? 'var(--green)' : 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
            {loading ? '🔍 Looking up product…' : scanStatus}
          </p>
          {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}><p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p></div>}
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={stopScan}>Cancel</button>

          {/* Manual fallback while scanning */}
          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Or enter barcode manually</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" placeholder="Barcode number" value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && manualCode && lookup(manualCode)}
                style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={() => manualCode && lookup(manualCode)}
                disabled={loading || !manualCode} style={{ flexShrink: 0, padding: '12px 18px' }}>
                {loading ? '…' : 'Go'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'manual' && (
        <div>
          <button onClick={() => setMode('idle')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, marginBottom: 20 }}>← Back</button>
          <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Enter barcode number</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Find the barcode number printed below the barcode lines</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input type="number" placeholder="e.g. 8901058857538" value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && manualCode && lookup(manualCode)}
              style={{ flex: 1 }} autoFocus />
            <button className="btn btn-primary" onClick={() => manualCode && lookup(manualCode)}
              disabled={loading || !manualCode} style={{ flexShrink: 0, padding: '12px 18px' }}>
              {loading ? '…' : 'Search'}
            </button>
          </div>
          {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '10px 14px' }}><p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p></div>}
          {loading && <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>Looking up product…</p>}
        </div>
      )}

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-30px); opacity: 1; }
          50% { transform: translateY(30px); opacity: 1; }
          100% { transform: translateY(-30px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
