import { useApi } from '../hooks/useApi'
import { fetchPhoneNumbers } from '../api/endpoints'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorCard from '../components/ErrorCard'
import StatusBadge from '../components/StatusBadge'

export default function PhoneNumbersPage() {
  const { data, loading, error, refetch } = useApi(fetchPhoneNumbers)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  return (
    <div>
      <h2 className="text-2xl font-bold">Phone Numbers</h2>
      <p className="mt-1 text-sm text-gray-500">Registered WhatsApp business phone numbers</p>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">Phone Number</th>
              <th className="px-6 py-3">Verified Name</th>
              <th className="px-6 py-3">Quality</th>
              <th className="px-6 py-3">Name Status</th>
              <th className="px-6 py-3">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{p.display_phone_number}</td>
                <td className="px-6 py-4">{p.verified_name}</td>
                <td className="px-6 py-4"><StatusBadge value={p.quality_rating} /></td>
                <td className="px-6 py-4"><StatusBadge value={p.name_status} /></td>
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{p.id}</td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No phone numbers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
