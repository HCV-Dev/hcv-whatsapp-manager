import { useApi } from '../hooks/useApi'
import { fetchAccount } from '../api/endpoints'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorCard from '../components/ErrorCard'
import StatusBadge from '../components/StatusBadge'

export default function DashboardPage() {
  const { data, loading, error, refetch } = useApi(fetchAccount)

  if (loading) return <LoadingSpinner />
  if (error || !data) return <ErrorCard message={error || 'Failed to load account data'} onRetry={refetch} />

  const stats = [
    { label: 'Account Name', value: data.name },
    { label: 'WABA ID', value: data.id },
    { label: 'Currency', value: data.currency },
    { label: 'Timezone ID', value: data.timezone_id },
    { label: 'Template Namespace', value: data.message_template_namespace },
    { label: 'Phone Numbers', value: data.phone_number_count },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="mt-1 text-sm text-gray-500">WhatsApp Business Account overview</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-lg font-semibold break-all">{value ?? '-'}</p>
          </div>
        ))}
      </div>

      {data.phone_numbers?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Phone Numbers</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {data.phone_numbers.map((p) => (
              <div key={p.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <p className="font-medium">{p.display_phone_number}</p>
                <p className="text-sm text-gray-500">{p.verified_name}</p>
                <div className="mt-2">
                  <StatusBadge value={p.quality_rating} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
