// Client for the live-engine service (parking-arbitrage/src/engine/server.js).
// Separate from NEXT_PUBLIC_API_URL (the read-only Supabase analytics API) —
// this one runs the live Playwright fetches + sheet pipeline.

// Every engine call goes through a same-origin Vercel proxy route
// (app/api/engine/[...path]) that injects the engine origin + API key
// server-side. So the browser only ever talks to the Vercel app over HTTPS —
// no mixed-content, and the engine URL/key never reach the client.
export const ENGINE_URL = '/api/engine'

export interface LiveRow {
  platform: string
  venue: string
  event: string | null
  spot: string
  address: string
  price: number | null
  advertised?: number | null
  currency?: string
  availability: string
  availableSpaces?: number | null
  distanceMeters?: number | null
  distanceMiles?: number | null
  confidence: number | null
  date?: string | null
  amenities?: string
  timestamp?: string
}

export interface PlatformStatus {
  platform: string
  status: string
  count: number
  matchedEvent?: string | null
  eventConfidence?: number | null
  venueConfidence?: number | null
  needsConfirmation?: boolean
  candidates?: { title: string; date?: string }[]
  error?: string | null
}

export interface LiveResult {
  query: Record<string, any>
  mode: string
  platforms: PlatformStatus[]
  rows: LiveRow[]
  summary: {
    totalRows: number
    platformsOk: number
    platformsTotal: number
    needsConfirmation: boolean
    generatedAt: string
  }
}

async function postJson<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${ENGINE_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `Engine error (${res.status})`)
  return data as T
}

export const liveEvent = (p: { venue: string; event: string; date?: string; platforms?: string[] }) =>
  postJson<LiveResult>('/api/live/event', p)

export const liveDate = (p: { venue: string; start: string; end: string; platforms?: string[] }) =>
  postJson<LiveResult>('/api/live/date', p)

export interface AddVenueResult {
  added: boolean
  name: string
  reason?: string
  lat?: number
  lon?: number
}

// Validate + dedupe-add a venue to the tracking sheet. Returns the result for the
// expected outcomes — added (201), already-tracked (409), not-a-real-venue (422) —
// all carry { added, reason }. Only throws on a 5xx / network failure.
export async function addVenue(name: string): Promise<AddVenueResult> {
  const res = await fetch(`${ENGINE_URL}/api/venues`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status >= 500) throw new Error(data?.error || `Engine error (${res.status})`)
  return data as AddVenueResult
}

export async function engineHealth(): Promise<{ ok: boolean; gemini: boolean } | null> {
  try {
    const res = await fetch(`${ENGINE_URL}/health`)
    return res.ok ? await res.json() : null
  } catch { return null }
}

// --- Tool 3 sheet pipeline -------------------------------------------------

export interface PipelinePreview {
  headers: string[]
  detected: Record<string, string>
  rowCount: number
  sample: Record<string, any>[]
}

export interface PipelineResult {
  columns: string[]
  detected: Record<string, string>
  rows: Record<string, any>[]
  stats: Record<string, number>
}

export async function pipelinePreview(file: File): Promise<PipelinePreview> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${ENGINE_URL}/api/pipeline/preview`, { method: 'POST', body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `Preview failed (${res.status})`)
  return data
}

// Starts a background job (survives navigation) and returns its id. Poll
// pipelineJob(id) for progress + the final result.
export async function pipelineProcess(file: File, limit = 50): Promise<{ jobId: string }> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('limit', String(limit))
  const res = await fetch(`${ENGINE_URL}/api/pipeline/process`, { method: 'POST', body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `Processing failed (${res.status})`)
  return data
}

export interface PipelineJob {
  id: string
  status: string          // queued | running | done | error
  processed: number
  total: number
  done: boolean
  error?: string | null
  elapsedMs: number
  result?: PipelineResult // present only when done
}

export async function pipelineJob(jobId: string): Promise<PipelineJob> {
  const res = await fetch(`${ENGINE_URL}/api/pipeline/job/${jobId}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `Job lookup failed (${res.status})`)
  return data
}

// --- export / clipboard ----------------------------------------------------

/** Ask the engine to build an XLSX from rows and trigger a browser download. */
export async function exportXlsx(rows: Record<string, any>[], filename: string, columns?: string[]) {
  const res = await fetch(`${ENGINE_URL}/api/export/xlsx`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rows, columns: columns || null, filename }),
  })
  if (!res.ok) throw new Error(`Export failed (${res.status})`)
  const blob = await res.blob()
  triggerDownload(blob, `${filename}.xlsx`)
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/** Copy rows as TSV (paste-friendly into Sheets/Excel) to the clipboard. */
export async function copyRowsTsv(rows: Record<string, any>[], columns?: string[]) {
  if (!rows.length) return
  let cols = columns
  if (!cols) {
    const set = new Set<string>()
    for (const r of rows) for (const k of Object.keys(r)) set.add(k)
    cols = Array.from(set)
  }
  const esc = (v: any) => (v == null ? '' : String(v).replace(/\t/g, ' ').replace(/\n/g, ' '))
  const lines = [cols.join('\t'), ...rows.map(r => cols.map(c => esc(r[c])).join('\t'))]
  await navigator.clipboard.writeText(lines.join('\n'))
}
