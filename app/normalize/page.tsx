'use client'

import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/header'
import { pipelinePreview, pipelineProcess, pipelineJob, exportXlsx, copyRowsTsv, type PipelinePreview, type PipelineResult } from '@/lib/engine'

const LS_KEY = 'normalizeJob'

const ROLE_LABEL: Record<string, string> = {
  venue: 'Venue', spot: 'Spot / Lot', event: 'Event', date: 'Date',
  buyingPrice: 'Buying price', competitorPrice: 'Competitor price', status: 'Status', remarks: 'Remarks',
}
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  MATCHED: { bg: 'color-mix(in srgb, var(--green) 18%, var(--surface))', color: '#137333' },
  FLAGGED: { bg: 'color-mix(in srgb, var(--yellow) 22%, var(--surface))', color: '#806600' },
  NO_DATA: { bg: 'color-mix(in srgb, var(--red) 14%, var(--surface))', color: '#c5221f' },
  ERROR:   { bg: 'color-mix(in srgb, var(--red) 18%, var(--surface))', color: '#c5221f' },
  SKIPPED: { bg: 'var(--pill)', color: 'var(--text-2)' },
}

function fmtElapsed(ms: number) {
  const s = Math.floor((ms || 0) / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

interface Progress { processed: number; total: number; elapsedMs: number; status: string }

export default function NormalizePage() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<PipelinePreview | null>(null)
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [limit, setLimit] = useState(25)
  const [loading, setLoading] = useState<'preview' | 'process' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }

  const startPolling = (jobId: string) => {
    stopPolling()
    const tick = async () => {
      try {
        const j = await pipelineJob(jobId)
        setProgress({ processed: j.processed, total: j.total, elapsedMs: j.elapsedMs, status: j.status })
        if (j.done && j.result) {
          setResult(j.result); setLoading(null); stopPolling(); localStorage.removeItem(LS_KEY)
        } else if (j.status === 'error') {
          setError(j.error || 'Processing failed'); setLoading(null); stopPolling(); localStorage.removeItem(LS_KEY)
        }
      } catch (e: any) {
        setError(e.message || 'Lost track of the job — the engine may have restarted.')
        setLoading(null); stopPolling(); localStorage.removeItem(LS_KEY)
      }
    }
    tick()
    pollRef.current = setInterval(tick, 1500)
  }

  // Resume an in-flight job after navigation / refresh.
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null
    if (saved) {
      try {
        const { jobId, fileName: fn } = JSON.parse(saved)
        if (jobId) { setFileName(fn || ''); setLoading('process'); startPolling(jobId) }
      } catch { localStorage.removeItem(LS_KEY) }
    }
    return () => stopPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onFile = async (f: File | null) => {
    setFile(f); setFileName(f?.name || ''); setPreview(null); setResult(null); setError(null); setProgress(null)
    if (!f) return
    setLoading('preview')
    try { setPreview(await pipelinePreview(f)) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(null) }
  }

  const startJob = async () => {
    if (!file) return
    setLoading('process'); setError(null); setResult(null)
    setProgress({ processed: 0, total: Math.min(limit, preview?.rowCount || limit), elapsedMs: 0, status: 'queued' })
    try {
      const { jobId } = await pipelineProcess(file, limit)
      localStorage.setItem(LS_KEY, JSON.stringify({ jobId, fileName: file.name }))
      startPolling(jobId)
    } catch (e: any) {
      setError(e.message); setLoading(null); setProgress(null)
    }
  }

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Header />
      <div className="wrap" style={{ paddingTop: '56px', paddingBottom: '80px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-1.5px' }}>Sheet Normalizer</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '32px', fontSize: '16px', maxWidth: '720px' }}>
          Upload a messy XLSX or CSV. The engine auto-detects your columns, fetches live parking per row,
          and matches it back with a confidence score. Your original columns are never overwritten — enriched
          columns are appended.
        </p>

        {/* Upload */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0] || null) }}
          style={{ border: '2px dashed var(--border)', borderRadius: '16px', padding: '36px', textAlign: 'center', cursor: 'pointer', background: 'var(--surface)', marginBottom: '24px' }}
        >
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={(e) => onFile(e.target.files?.[0] || null)} />
          <div style={{ fontSize: '15px', color: 'var(--text)', fontWeight: 600 }}>{file ? file.name : 'Drop a sheet here or click to upload'}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '6px' }}>XLSX, XLS, or CSV · messy columns welcome</div>
        </div>

        {error && <p style={{ color: '#c5221f', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}
        {loading === 'preview' && <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Parsing…</p>}

        {/* Detected columns + process */}
        {preview && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow)', marginBottom: '28px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '4px' }}>Detected columns</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '14px' }}>{preview.rowCount} rows · mapped from your headers automatically</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {Object.keys(ROLE_LABEL).map((role) => {
                const header = preview.detected[role]
                return (
                  <span key={role} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '999px', border: '1px solid var(--border)', background: header ? 'color-mix(in srgb, var(--blue) 10%, var(--surface))' : 'var(--bg)', color: header ? 'var(--text)' : 'var(--text-3, var(--text-2))' }}>
                    <strong>{ROLE_LABEL[role]}</strong>{header ? <> → {header}</> : ' → (none)'}
                  </span>
                )
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                Process first{' '}
                <select value={limit} onChange={(e) => setLimit(+e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                  {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>{' '}rows
              </label>
              <button onClick={startJob} disabled={loading === 'process'}
                style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: loading === 'process' ? 'wait' : 'pointer', opacity: loading === 'process' ? 0.7 : 1 }}>
                {loading === 'process' ? 'Processing…' : 'Process & Enrich'}
              </button>
              {!preview.detected.venue && <span style={{ fontSize: '12px', color: '#c5221f' }}>No venue column detected — rows will be skipped.</span>}
            </div>
          </div>
        )}

        {/* Progress — shows on a fresh run and when resuming after navigation */}
        {loading === 'process' && progress && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow)', marginBottom: '28px' }}>
            {!preview && <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Resuming your in-progress run{fileName ? ` — ${fileName}` : ''}…</p>}
            <ProgressBar progress={progress} />
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            <StatsBar stats={result.stats} />
            <MatchingNote gemini={result.stats.viaGemini || 0} local={result.stats.viaLocal || 0} fallback={result.stats.viaFallback || 0} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px' }}>
              <button onClick={() => copyRowsTsv(result.rows, result.columns)} style={ghostBtn}>Copy</button>
              <button onClick={() => exportXlsx(result.rows, `enriched_${(fileName || 'sheet').replace(/\.[^.]+$/, '')}`, result.columns)} style={primaryBtn}>Download XLSX</button>
            </div>
            <EnrichedTable columns={result.columns} rows={result.rows} detectedCount={Object.keys(result.detected).length} />
          </>
        )}
      </div>
    </main>
  )
}

function ProgressBar({ progress }: { progress: Progress }) {
  const pct = progress.total ? Math.min(100, Math.round((progress.processed / progress.total) * 100)) : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-2)', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <span>
          {progress.status === 'queued'
            ? 'Queued — waiting for a free worker…'
            : <>Processed <strong style={{ color: 'var(--text)' }}>{progress.processed}</strong> / {progress.total || '…'} rows{progress.total ? ` · ${pct}%` : ''}</>}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtElapsed(progress.elapsedMs)} elapsed</span>
      </div>
      <div style={{ height: '9px', borderRadius: '999px', background: 'var(--pill)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--blue)', transition: 'width 0.4s ease' }} />
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-3, var(--text-2))', marginTop: '12px' }}>
        Each row is scraped live (~30–60s). This runs on the server — you can leave this page and come back, and progress
        resumes automatically. (Closing the browser is fine too, as long as the engine stays running.)
      </p>
    </div>
  )
}

function MatchingNote({ gemini, local, fallback }: { gemini: number; local: number; fallback: number }) {
  if (gemini === 0 && local === 0 && fallback === 0) return null
  // Only an actual Gemini ERROR (fallback) is a warning. Local-by-design (the gate
  // skipping clear matches to save credits) is expected and shown in green.
  const warn = fallback > 0
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px',
        padding: '12px 16px', borderRadius: '12px', fontSize: '13.5px',
        background: warn ? 'color-mix(in srgb, var(--yellow) 16%, var(--surface))' : 'color-mix(in srgb, var(--green) 14%, var(--surface))',
        border: `1px solid ${warn ? 'color-mix(in srgb, var(--yellow) 40%, var(--border))' : 'color-mix(in srgb, var(--green) 35%, var(--border))'}`,
        color: warn ? '#806600' : '#137333',
      }}
    >
      <span style={{ fontWeight: 700 }}>{warn ? '⚠' : '✓'}</span>
      <span>
        {warn
          ? <><strong>{fallback}</strong> row{fallback === 1 ? '' : 's'} fell back to local matching because Gemini errored (likely rate limit or invalid key). Gemini ×{gemini}, resolved locally ×{local}.</>
          : gemini > 0
            ? <>Matched via <strong>Gemini ×{gemini}</strong>; <strong>{local}</strong> clear row{local === 1 ? '' : 's'} resolved locally (no Gemini call needed — saves credits).</>
            : <>All <strong>{local}</strong> row{local === 1 ? '' : 's'} resolved by local matching — no Gemini calls used.</>}
      </span>
    </div>
  )
}

function StatsBar({ stats }: { stats: Record<string, number> }) {
  const items = [
    ['Total', stats.total], ['Processed', stats.processed], ['Matched', stats.matched],
    ['Spot matched', stats.spotMatched], ['Flagged', stats.flagged], ['No data', stats.noData],
    ['Skipped', stats.skipped], ['Errors', stats.errors],
  ] as const
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
      {items.map(([label, n]) => (
        <div key={label} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 18px', background: 'var(--surface)', minWidth: '90px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700 }}>{n ?? 0}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

function EnrichedTable({ columns, rows }: { columns: string[]; rows: Record<string, any>[]; detectedCount: number }) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
        <thead>
          <tr style={{ background: 'var(--bg)' }}>
            {columns.map((c) => (
              <th key={c} style={{ textAlign: 'left', padding: '9px 12px', color: 'var(--text-2)', fontWeight: 600, borderBottom: '1px solid var(--border)', position: 'sticky', top: 0 }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              {columns.map((c) => {
                const v = r[c]
                const sc = c.startsWith('Match Status') ? STATUS_COLOR[String(v)] : null
                return (
                  <td key={c} style={{ padding: '8px 12px', color: 'var(--text)' }}>
                    {sc ? <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: sc.bg, color: sc.color }}>{v}</span>
                       : (v === '' || v == null ? <span style={{ color: 'var(--text-3, var(--text-2))' }}>—</span> : String(v))}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ghostBtn = { padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' } as const
const primaryBtn = { padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--blue)', color: '#fff' } as const
