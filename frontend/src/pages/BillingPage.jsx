import { useState, useMemo } from 'react'
import { fetchAnalytics, fetchConversationAnalytics } from '../api/endpoints'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorCard from '../components/ErrorCard'

function daysAgo(n) {
  return Math.floor((Date.now() - n * 86400000) / 1000)
}

function fmtDate(unix) {
  return new Date(unix * 1000).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}

function fmtMonth(unix) {
  return new Date(unix * 1000).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value?.toLocaleString() ?? '-'}</p>
    </div>
  )
}

function BarChart({ data, labelKey, bars, maxHeight = 160 }) {
  const maxVal = Math.max(...data.flatMap(d => bars.map(b => d[b.key] ?? 0)), 1)
  return (
    <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ minHeight: maxHeight + 40 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 min-w-[40px]">
          <div className="flex items-end gap-px" style={{ height: maxHeight }}>
            {bars.map((b) => {
              const val = d[b.key] ?? 0
              const h = Math.max((val / maxVal) * maxHeight, 2)
              return (
                <div
                  key={b.key}
                  title={`${b.label}: ${val.toLocaleString()}`}
                  className={`w-3 rounded-t ${b.color}`}
                  style={{ height: h }}
                />
              )
            })}
          </div>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  )
}

export default function BillingPage() {
  const [range, setRange] = useState(30)
  const [msgData, setMsgData] = useState(null)
  const [convData, setConvData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadData(days) {
    setRange(days)
    setLoading(true)
    setError('')
    try {
      const start = daysAgo(days)
      const end = daysAgo(0)
      const granularity = days <= 31 ? 'DAY' : 'MONTHLY'
      const [msg, conv] = await Promise.all([
        fetchAnalytics(start, end, granularity),
        fetchConversationAnalytics(start, end, days <= 31 ? 'DAY' : 'MONTHLY'),
      ])
      setMsgData(msg)
      setConvData(conv)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Load on first render
  useMemo(() => { loadData(30) }, [])

  const msgPoints = msgData?.analytics?.data_points ?? []
  const convPoints = convData?.conversation_analytics?.data_points ?? []
  const isMonthly = range > 31

  const totalSent = msgPoints.reduce((s, d) => s + (d.sent ?? 0), 0)
  const totalDelivered = msgPoints.reduce((s, d) => s + (d.delivered ?? 0), 0)
  const deliveryRate = totalSent ? ((totalDelivered / totalSent) * 100).toFixed(1) : '-'

  const totalConversations = convPoints.reduce((s, d) => s + (d.conversation ?? 0), 0)
  const totalCost = convPoints.reduce((s, d) => s + (d.cost ?? 0), 0)

  const chartMsgData = msgPoints.map((d) => ({
    label: isMonthly ? fmtMonth(d.start) : fmtDate(d.start),
    sent: d.sent ?? 0,
    delivered: d.delivered ?? 0,
  }))

  // Parse conversation data points - they have a nested structure
  const chartConvData = convPoints.map((d) => {
    const row = { label: isMonthly ? fmtMonth(d.start) : fmtDate(d.start) }
    let total = 0
    if (d.conversation_types) {
      for (const ct of d.conversation_types) {
        row[ct.conversation_type] = ct.conversation ?? ct.count ?? 0
        total += row[ct.conversation_type]
      }
    }
    // Flat structure fallback
    if (d.conversation !== undefined) total = d.conversation
    row.total = total || d.conversation || 0
    return row
  })

  return (
    <div>
      <h2 className="text-2xl font-bold">Billing & Analytics</h2>
      <p className="mt-1 text-sm text-gray-500">Message delivery and conversation billing data</p>

      <div className="mt-4 flex gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => loadData(d)}
            className={`px-3 py-1.5 text-sm rounded-lg border ${range === d ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-gray-50'}`}
          >
            {d} days
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorCard message={error} onRetry={() => loadData(range)} />}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Messages Sent" value={totalSent} />
            <StatCard label="Messages Delivered" value={totalDelivered} />
            <StatCard label="Delivery Rate" value={deliveryRate !== '-' ? `${deliveryRate}%` : '-'} />
            <StatCard label="Conversations" value={totalConversations || '-'} />
          </div>

          {/* Message Analytics Chart */}
          {chartMsgData.length > 0 && (
            <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Message Delivery</h3>
              <div className="mt-1 flex gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Sent</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" /> Delivered</span>
              </div>
              <BarChart
                data={chartMsgData}
                labelKey="label"
                bars={[
                  { key: 'sent', label: 'Sent', color: 'bg-emerald-500' },
                  { key: 'delivered', label: 'Delivered', color: 'bg-blue-500' },
                ]}
              />
            </div>
          )}

          {/* Conversation Analytics */}
          {chartConvData.length > 0 && (
            <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Conversations</h3>
              <p className="text-xs text-gray-400 mt-1 mb-4">Billable conversation sessions</p>
              <BarChart
                data={chartConvData}
                labelKey="label"
                bars={[
                  { key: 'total', label: 'Conversations', color: 'bg-violet-500' },
                ]}
              />
            </div>
          )}

          {/* Raw data table */}
          {msgPoints.length > 0 && (
            <div className="mt-6 rounded-xl border bg-white shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Period</th>
                    <th className="px-6 py-3 text-right">Sent</th>
                    <th className="px-6 py-3 text-right">Delivered</th>
                    <th className="px-6 py-3 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {msgPoints.map((d, i) => {
                    const rate = d.sent ? ((d.delivered / d.sent) * 100).toFixed(1) : '-'
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          {isMonthly ? fmtMonth(d.start) : fmtDate(d.start)} - {isMonthly ? fmtMonth(d.end) : fmtDate(d.end)}
                        </td>
                        <td className="px-6 py-3 text-right font-mono">{(d.sent ?? 0).toLocaleString()}</td>
                        <td className="px-6 py-3 text-right font-mono">{(d.delivered ?? 0).toLocaleString()}</td>
                        <td className="px-6 py-3 text-right font-mono">{rate}%</td>
                      </tr>
                    )
                  })}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-3">Total</td>
                    <td className="px-6 py-3 text-right font-mono">{totalSent.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-mono">{totalDelivered.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-mono">{deliveryRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {msgPoints.length === 0 && !loading && (
            <div className="mt-6 text-center py-12 text-gray-400">No analytics data for this period</div>
          )}
        </>
      )}
    </div>
  )
}
