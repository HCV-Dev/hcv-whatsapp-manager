import { useState } from 'react'
import { getSettings, saveSettings, clearSettings } from '../api/client'

const FIELDS = [
  { key: 'accessToken', label: 'Access Token', type: 'password', required: true, help: 'System user access token with whatsapp_business_messaging and whatsapp_business_management permissions' },
  { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true, help: 'Find in WhatsApp Manager or via the phone_numbers API endpoint' },
  { key: 'wabaId', label: 'WABA ID', type: 'text', required: true, help: 'WhatsApp Business Account ID from Meta Business Suite' },
  { key: 'businessId', label: 'Business ID', type: 'text', required: false, help: 'Business portfolio ID (optional)' },
  { key: 'apiVersion', label: 'API Version', type: 'text', required: false, help: 'Graph API version, defaults to v21.0' },
]

export default function SettingsPage() {
  const [form, setForm] = useState(() => {
    const s = getSettings()
    return {
      accessToken: s.accessToken ?? '',
      phoneNumberId: s.phoneNumberId ?? '',
      wabaId: s.wabaId ?? '',
      businessId: s.businessId ?? '',
      apiVersion: s.apiVersion ?? 'v21.0',
    }
  })
  const [saved, setSaved] = useState(false)
  const [showToken, setShowToken] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    saveSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleClear() {
    if (confirm('Clear all stored credentials? You will need to re-enter them.')) {
      clearSettings()
      setForm({ accessToken: '', phoneNumberId: '', wabaId: '', businessId: '', apiVersion: 'v21.0' })
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Settings</h2>
      <p className="mt-1 text-sm text-gray-500">Configure your Meta WhatsApp Cloud API credentials. Stored in your browser's localStorage only.</p>

      <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
        <p className="text-xs text-amber-800">
          Credentials are stored locally in your browser and sent directly to Meta's Graph API.
          They never pass through any intermediate server. Use this tool on a trusted device only.
        </p>
      </div>

      <form onSubmit={handleSave} className="mt-6 rounded-xl border bg-white p-6 shadow-sm space-y-5 max-w-2xl">
        {FIELDS.map(({ key, label, type, required, help }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">
              {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="mt-1 relative">
              <input
                type={key === 'accessToken' && !showToken ? 'password' : 'text'}
                value={form[key]}
                onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setSaved(false) }}
                required={required}
                placeholder={key === 'apiVersion' ? 'v21.0' : ''}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-16"
              />
              {key === 'accessToken' && (
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">{help}</p>
          </div>
        ))}

        <div className="flex items-center justify-between pt-4 border-t">
          <button type="button" onClick={handleClear} className="text-sm text-red-500 hover:text-red-700">
            Clear all credentials
          </button>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-emerald-600">Saved</span>}
            <button type="submit" className="px-5 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
