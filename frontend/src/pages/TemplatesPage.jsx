import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { fetchTemplates, createTemplate, deleteTemplate } from '../api/endpoints'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorCard from '../components/ErrorCard'
import StatusBadge from '../components/StatusBadge'
import ConfirmModal from '../components/ConfirmModal'
import TemplateForm from '../components/template/TemplateForm'
import TemplatePreview from '../components/template/TemplatePreview'

export default function TemplatesPage() {
  const { data, loading, error, refetch } = useApi(fetchTemplates)
  const [view, setView] = useState('list') // 'list' | 'create'
  const [deleting, setDeleting] = useState(null)
  const [preview, setPreview] = useState({ name: '', components: [] })
  const [expandedId, setExpandedId] = useState(null)

  async function handleDelete() {
    try {
      await deleteTemplate(deleting)
      setDeleting(null)
      refetch()
    } catch (e) {
      alert(`Delete failed: ${e.message}`)
      setDeleting(null)
    }
  }

  async function handleCreate(payload) {
    await createTemplate(payload)
    setView('list')
    refetch()
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  if (view === 'create') {
    return (
      <div>
        <h2 className="text-2xl font-bold">Create Template</h2>
        <p className="mt-1 text-sm text-gray-500">Design a new message template with live preview</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,360px]">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <TemplateForm
              onSubmit={handleCreate}
              onCancel={() => setView('list')}
              onChange={setPreview}
            />
          </div>
          <div className="lg:sticky lg:top-6 self-start">
            <TemplatePreview template={preview} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Message Templates</h2>
          <p className="mt-1 text-sm text-gray-500">{data?.length ?? 0} templates</p>
        </div>
        <button
          onClick={() => { setView('create'); setPreview({ name: '', components: [] }) }}
          className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          + New Template
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {data?.map((t) => (
          <div key={t.id ?? t.name + t.language} className="rounded-xl border bg-white shadow-sm">
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.language} / {t.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge value={t.status} />
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleting(t.name) }}
                  className="text-gray-400 hover:text-red-500"
                  title="Delete template"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === t.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {expandedId === t.id && (
              <div className="border-t px-5 py-4 grid gap-4 lg:grid-cols-[1fr,320px]">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Components</h4>
                  <div className="space-y-2">
                    {t.components?.map((c, i) => (
                      <div key={i} className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">{c.type}</p>
                        {c.text && <p className="text-sm mt-1">{c.text}</p>}
                        {c.format && <p className="text-xs text-gray-400">Format: {c.format}</p>}
                        {c.buttons && (
                          <div className="mt-1 space-y-1">
                            {c.buttons.map((b, j) => (
                              <p key={j} className="text-xs text-gray-600">
                                [{b.type}] {b.text}
                                {b.url && ` -> ${b.url}`}
                                {b.phone_number && ` -> ${b.phone_number}`}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <TemplatePreview template={{ name: t.name, components: t.components ?? [] }} />
              </div>
            )}
          </div>
        ))}

        {data?.length === 0 && (
          <div className="text-center py-12 text-gray-400">No templates found</div>
        )}
      </div>

      <ConfirmModal
        open={!!deleting}
        title="Delete Template"
        message={`Are you sure you want to delete the template "${deleting}"? This will delete all language versions.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
