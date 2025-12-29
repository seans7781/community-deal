export type HttpMethod = 'GET' | 'POST'

function getOrigin() {
  const configured = (import.meta as any)?.env?.VITE_API_ORIGIN as string | undefined
  if (configured && /^https?:\/\//i.test(configured)) return configured.replace(/\/$/, '')
  return typeof window !== 'undefined' ? window.location.origin : ''
}

function joinUrl(base: string, path: string) {
  const b = (base || '').replace(/\/+$/, '')
  const p = (path || '').replace(/^\/+/, '')
  return `${b}/${p}`
}

export async function request(path: string, options?: { method?: HttpMethod; headers?: Record<string, string>; body?: any; token?: string; formData?: FormData; query?: Record<string, string> }) {
  const method = options?.method || 'GET'
  let full = joinUrl(getOrigin(), '/wyapi')
  full = joinUrl(full, path)
  if (options?.query) {
    const usp = new URLSearchParams()
    Object.entries(options.query).forEach(([k, v]) => usp.append(k, v))
    const qs = usp.toString()
    if (qs) full += (full.includes('?') ? '&' : '?') + qs
  }
  const headers: Record<string, string> = options?.headers ? { ...options.headers } : {}
  if (!options?.formData && method === 'POST') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }
  const tokenHeader = options?.token || (typeof localStorage !== 'undefined' ? (localStorage.getItem('token') || '') : '')
  if (tokenHeader) {
    headers['token'] = tokenHeader
  }
  const init: RequestInit = { method, headers }
  if (options?.formData) {
    init.body = options.formData
  } else if (method === 'POST' && options?.body !== undefined) {
    init.body = JSON.stringify(options.body)
  }
  const res = await fetch(full, init)
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    return { ok: res.ok, status: res.status, data: null }
  }
  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}

export function toRole(role: string): 'owner' | 'admin' | 'property' {
  const r = (role || '').toLowerCase()
  if (r === 'admin') return 'admin'
  if (r === 'property') return 'property'
  return 'owner'
}