const colorMap = {
  APPROVED: 'bg-emerald-100 text-emerald-800',
  GREEN: 'bg-emerald-100 text-emerald-800',
  PENDING: 'bg-amber-100 text-amber-800',
  YELLOW: 'bg-amber-100 text-amber-800',
  IN_APPEAL: 'bg-amber-100 text-amber-800',
  REJECTED: 'bg-red-100 text-red-800',
  RED: 'bg-red-100 text-red-800',
  DISABLED: 'bg-gray-100 text-gray-600',
  PAUSED: 'bg-gray-100 text-gray-600',
  NA: 'bg-gray-100 text-gray-500',
}

export default function StatusBadge({ value }) {
  if (!value) return null
  const colors = colorMap[value.toUpperCase()] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {value}
    </span>
  )
}
