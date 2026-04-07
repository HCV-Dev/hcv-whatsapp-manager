import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { fetchProfile, updateProfile } from '../api/endpoints'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorCard from '../components/ErrorCard'

const FIELDS = [
  { key: 'about', label: 'About', type: 'text', max: 139 },
  { key: 'description', label: 'Description', type: 'textarea', max: 256 },
  { key: 'address', label: 'Address', type: 'text', max: 256 },
  { key: 'email', label: 'Email', type: 'email', max: 128 },
  { key: 'vertical', label: 'Industry', type: 'select', options: [
    'UNDEFINED','OTHER','AUTO','BEAUTY','APPAREL','EDU','ENTERTAIN',
    'EVENT_PLAN','FINANCE','GROCERY','GOVT','HOTEL','HEALTH',
    'NONPROFIT','PROF_SERVICES','RETAIL','TRAVEL','RESTAURANT','NOT_A_BIZ',
  ]},
]

export default function ProfilePage() {
  const { data, loading, error, refetch } = useApi(fetchProfile)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  function startEdit() {
    setForm({
      about: data?.about ?? '',
      description: data?.description ?? '',
      address: data?.address ?? '',
      email: data?.email ?? '',
      vertical: data?.vertical ?? 'UNDEFINED',
      websites: data?.websites ?? [],
    })
    setEditing(true)
    setSaveMsg('')
  }

  async function handleSave() {
    setSaving(true)
    setSaveMsg('')
    try {
      await updateProfile(form)
      setSaveMsg('Profile updated')
      setEditing(false)
      refetch()
    } catch (e) {
      setSaveMsg(`Error: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Profile</h2>
          <p className="mt-1 text-sm text-gray-500">View and update your WhatsApp business profile</p>
        </div>
        {!editing && (
          <button onClick={startEdit} className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
            Edit Profile
          </button>
        )}
      </div>

      {saveMsg && (
        <p className={`mt-4 text-sm ${saveMsg.startsWith('Error') ? 'text-red-600' : 'text-emerald-600'}`}>
          {saveMsg}
        </p>
      )}

      <div className="mt-6 rounded-xl border bg-white shadow-sm">
        {data?.profile_picture_url && (
          <div className="p-6 border-b flex items-center gap-4">
            <img src={data.profile_picture_url} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            <span className="text-sm text-gray-500">Profile Picture</span>
          </div>
        )}

        <div className="p-6 space-y-5">
          {FIELDS.map(({ key, label, type, max, options }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              {editing ? (
                type === 'textarea' ? (
                  <textarea
                    value={form[key] ?? ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    maxLength={max}
                    rows={3}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : type === 'select' ? (
                  <select
                    value={form[key] ?? ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={type}
                    value={form[key] ?? ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    maxLength={max}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )
              ) : (
                <p className="mt-1 text-sm text-gray-800">{data?.[key] || '-'}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700">Websites</label>
            {editing ? (
              <div className="mt-1 space-y-2">
                {(form.websites || ['']).map((url, i) => (
                  <input
                    key={i}
                    type="url"
                    value={url}
                    placeholder="https://"
                    onChange={(e) => {
                      const ws = [...(form.websites || [''])]
                      ws[i] = e.target.value
                      setForm({ ...form, websites: ws })
                    }}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ))}
                {(form.websites?.length ?? 0) < 2 && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, websites: [...(form.websites || []), ''] })}
                    className="text-sm text-emerald-600 hover:text-emerald-800"
                  >
                    + Add website
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-1 space-y-1">
                {data?.websites?.length ? data.websites.map((w, i) => (
                  <p key={i} className="text-sm text-blue-600">{w}</p>
                )) : <p className="text-sm text-gray-500">-</p>}
              </div>
            )}
          </div>
        </div>

        {editing && (
          <div className="flex justify-end gap-3 border-t p-6">
            <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
