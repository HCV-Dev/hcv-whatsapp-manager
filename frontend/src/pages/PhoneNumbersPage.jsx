import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { fetchPhoneNumbers, requestNameChange } from '../api/endpoints'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorCard from '../components/ErrorCard'
import StatusBadge from '../components/StatusBadge'

export default function PhoneNumbersPage() {
  const { data, loading, error, refetch } = useApi(fetchPhoneNumbers)
  const [registering, setRegistering] = useState(null) // phone ID being registered
  const [pin, setPin] = useState('')
  const [regStatus, setRegStatus] = useState({ msg: '', ok: false })
  const [submitting, setSubmitting] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    if (!pin || pin.length !== 6) {
      setRegStatus({ msg: 'PIN must be exactly 6 digits', ok: false })
      return
    }
    setSubmitting(true)
    setRegStatus({ msg: '', ok: false })
    try {
      await requestNameChange(registering, pin)
      setRegStatus({ msg: 'Registration request submitted. If a name change was approved in WhatsApp Manager, it will now take effect.', ok: true })
      setPin('')
      refetch()
    } catch (err) {
      setRegStatus({ msg: err.message, ok: false })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  return (
    <div>
      <h2 className="text-2xl font-bold">Phone Numbers</h2>
      <p className="mt-1 text-sm text-gray-500">Registered WhatsApp business phone numbers</p>

      <div className="mt-6 space-y-4">
        {data?.map((p) => (
          <div key={p.id} className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="font-medium">{p.display_phone_number}</p>
                  <p className="text-sm text-gray-500">{p.verified_name}</p>
                </div>
                <StatusBadge value={p.quality_rating} />
                <StatusBadge value={p.name_status} />
                <span className="text-xs text-gray-400 font-mono">{p.id}</span>
              </div>
              <button
                onClick={() => { setRegistering(registering === p.id ? null : p.id); setPin(''); setRegStatus({ msg: '', ok: false }) }}
                className="text-sm text-emerald-600 hover:text-emerald-800"
              >
                {registering === p.id ? 'Cancel' : 'Re-register'}
              </button>
            </div>

            {registering === p.id && (
              <div className="border-t px-6 py-4">
                <div className="max-w-md">
                  <p className="text-sm text-gray-600 mb-3">
                    To apply an approved display name change, re-register this phone number.
                    You must first approve the new name in{' '}
                    <a href="https://business.facebook.com/wa/manage/home/" target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      WhatsApp Manager
                    </a>
                    , then re-register here with your 6-digit two-step verification PIN.
                  </p>

                  {regStatus.msg && (
                    <p className={`text-sm mb-3 ${regStatus.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                      {regStatus.msg}
                    </p>
                  )}

                  <form onSubmit={handleRegister} className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit PIN"
                      className="w-36 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={submitting || pin.length !== 6}
                      className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Re-register'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ))}

        {data?.length === 0 && (
          <div className="text-center py-12 text-gray-400">No phone numbers found</div>
        )}
      </div>
    </div>
  )
}
