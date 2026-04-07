const STORAGE_KEY = 'wa_manager_settings'

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function clearSettings() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isConfigured() {
  const s = getSettings()
  return !!(s.accessToken && s.phoneNumberId && s.wabaId)
}

class ApiError extends Error {
  constructor(status, message, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request(method, path, body, params) {
  const settings = getSettings()
  if (!settings.accessToken) {
    throw new ApiError(401, 'Not configured. Go to Settings and enter your Meta API credentials.')
  }

  const version = settings.apiVersion || 'v21.0'
  const url = new URL(`https://graph.facebook.com/${version}/${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${settings.accessToken}`,
      'Content-Type': 'application/json',
    },
  }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(url.toString(), opts)
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const error = data?.error || {}
    throw new ApiError(
      res.status,
      error.message || error.error_user_msg || res.statusText,
      data,
    )
  }
  return data
}

export const meta = {
  get: (path, params) => request('GET', path, null, params),
  post: (path, body) => request('POST', path, body),
  del: (path, params) => request('DELETE', path, null, params),
}
