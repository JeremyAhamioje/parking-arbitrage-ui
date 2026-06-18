// Same-origin proxy to the live engine on the VPS. The browser calls
// /api/engine/* (HTTPS, same origin as this app); this server-side handler
// forwards to the engine over HTTP, injecting the API key. Keeps ENGINE_ORIGIN
// and the key off the client, and sidesteps mixed-content (the browser never
// talks to the box directly). Handles JSON, multipart uploads, and binary
// (XLSX) responses by passing raw bytes through unchanged.
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ENGINE_ORIGIN = process.env.ENGINE_ORIGIN || 'http://localhost:4000'
const API_KEY = process.env.ENGINE_API_KEY || ''

async function proxy(req: NextRequest, path: string[]) {
  const url = `${ENGINE_ORIGIN}/${path.join('/')}${req.nextUrl.search || ''}`

  const headers = new Headers()
  const ct = req.headers.get('content-type')
  if (ct) headers.set('content-type', ct)
  if (API_KEY) headers.set('x-api-key', API_KEY)

  const init: RequestInit = { method: req.method, headers }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer() // raw bytes — preserves JSON + multipart boundary
  }

  let res: Response
  try {
    res = await fetch(url, init)
  } catch (e: any) {
    return Response.json({ error: `engine unreachable: ${e?.message || e}` }, { status: 502 })
  }

  const out = new Headers()
  for (const h of ['content-type', 'content-disposition', 'cache-control']) {
    const v = res.headers.get(h)
    if (v) out.set(h, v)
  }
  return new Response(res.body, { status: res.status, headers: out })
}

export function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params.path)
}
export function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params.path)
}
