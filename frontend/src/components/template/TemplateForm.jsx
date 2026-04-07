import { useState } from 'react'

const CATEGORIES = ['MARKETING', 'UTILITY', 'AUTHENTICATION']
const LANGUAGES = [
  'en', 'en_US', 'en_GB', 'af', 'ar', 'es', 'pt_BR', 'fr', 'de', 'it',
  'hi', 'id', 'ja', 'ko', 'nl', 'ru', 'tr', 'zh_CN', 'zh_TW', 'zu',
]
const HEADER_FORMATS = ['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION']
const BUTTON_TYPES = ['QUICK_REPLY', 'URL', 'PHONE_NUMBER']

export default function TemplateForm({ onSubmit, onCancel, onChange }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('MARKETING')
  const [language, setLanguage] = useState('en_US')
  const [headerFormat, setHeaderFormat] = useState('NONE')
  const [headerText, setHeaderText] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [footerText, setFooterText] = useState('')
  const [buttons, setButtons] = useState([])
  const [headerExample, setHeaderExample] = useState('')
  const [bodyExamples, setBodyExamples] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function buildComponents() {
    const components = []
    if (headerFormat !== 'NONE') {
      const h = { type: 'HEADER', format: headerFormat }
      if (headerFormat === 'TEXT') {
        h.text = headerText
        if (headerText.includes('{{') && headerExample) {
          h.example = { header_text: [headerExample] }
        }
      }
      if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerFormat) && headerExample) {
        h.example = { header_handle: [headerExample] }
      }
      components.push(h)
    }
    if (bodyText) {
      const b = { type: 'BODY', text: bodyText }
      const varCount = (bodyText.match(/\{\{\d+\}\}/g) || []).length
      if (varCount > 0 && bodyExamples.length > 0) {
        b.example = { body_text: [bodyExamples.slice(0, varCount)] }
      }
      components.push(b)
    }
    if (footerText) {
      components.push({ type: 'FOOTER', text: footerText })
    }
    if (buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: buttons.map((btn) => {
          const b = { type: btn.type, text: btn.text }
          if (btn.type === 'URL') b.url = btn.url
          if (btn.type === 'PHONE_NUMBER') b.phone_number = btn.phone_number
          return b
        }),
      })
    }
    return components
  }

  function emitChange(overrides = {}) {
    const merged = {
      name: overrides.name ?? name,
      components: overrides.components ?? buildComponents(),
    }
    // rebuild components with overrides applied
    onChange?.({
      name: merged.name,
      components: overrides.components ?? buildComponents(),
    })
  }

  function updateField(setter, field, value) {
    setter(value)
    // Defer to let state settle, then emit
    setTimeout(() => emitChange(), 0)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name || !bodyText) {
      setError('Name and body text are required')
      return
    }
    if (!/^[a-z0-9_]+$/.test(name)) {
      setError('Name must be lowercase letters, numbers, and underscores only')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name,
        language,
        category,
        components: buildComponents(),
      }
      await onSubmit(payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function addButton() {
    if (buttons.length >= 3) return
    setButtons([...buttons, { type: 'QUICK_REPLY', text: '' }])
    setTimeout(() => emitChange(), 0)
  }

  function updateButton(i, field, value) {
    const updated = [...buttons]
    updated[i] = { ...updated[i], [field]: value }
    setButtons(updated)
    setTimeout(() => emitChange(), 0)
  }

  function removeButton(i) {
    setButtons(buttons.filter((_, idx) => idx !== i))
    setTimeout(() => emitChange(), 0)
  }

  // Count body variables for example inputs
  const bodyVarCount = (bodyText.match(/\{\{\d+\}\}/g) || []).length

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

      {/* Basic Info */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Template Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => updateField(setName, 'name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="my_template_name"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Header */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Header</label>
        <select value={headerFormat} onChange={(e) => updateField(setHeaderFormat, 'headerFormat', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {HEADER_FORMATS.map((f) => <option key={f} value={f}>{f === 'NONE' ? 'No header' : f}</option>)}
        </select>
        {headerFormat === 'TEXT' && (
          <input
            type="text"
            value={headerText}
            onChange={(e) => updateField(setHeaderText, 'headerText', e.target.value)}
            placeholder="Header text (supports {{1}} variables)"
            maxLength={60}
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        )}
        {headerFormat === 'TEXT' && headerText.includes('{{') && (
          <input
            type="text"
            value={headerExample}
            onChange={(e) => setHeaderExample(e.target.value)}
            placeholder="Example value for header variable"
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        )}
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Body <span className="text-gray-400 font-normal">- Use {'{{1}}'}, {'{{2}}'} for variables</span>
        </label>
        <textarea
          value={bodyText}
          onChange={(e) => updateField(setBodyText, 'bodyText', e.target.value)}
          placeholder="Hi {{1}}, your order {{2}} is ready!"
          maxLength={1024}
          rows={4}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-gray-400 mt-1">{bodyText.length}/1024</p>
        {bodyVarCount > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-gray-500">Example values for variables:</p>
            {Array.from({ length: bodyVarCount }, (_, i) => (
              <input
                key={i}
                type="text"
                value={bodyExamples[i] ?? ''}
                onChange={(e) => {
                  const ex = [...bodyExamples]
                  ex[i] = e.target.value
                  setBodyExamples(ex)
                }}
                placeholder={`Example for {{${i + 1}}}`}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Footer (optional)</label>
        <input
          type="text"
          value={footerText}
          onChange={(e) => updateField(setFooterText, 'footerText', e.target.value)}
          placeholder="Footer text"
          maxLength={60}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Buttons */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Buttons (optional, max 3)</label>
          {buttons.length < 3 && (
            <button type="button" onClick={addButton} className="text-sm text-emerald-600 hover:text-emerald-800">
              + Add button
            </button>
          )}
        </div>
        {buttons.map((btn, i) => (
          <div key={i} className="mt-2 flex gap-2 items-start">
            <select
              value={btn.type}
              onChange={(e) => updateButton(i, 'type', e.target.value)}
              className="rounded-lg border px-2 py-2 text-sm shrink-0"
            >
              {BUTTON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="text"
              value={btn.text}
              onChange={(e) => updateButton(i, 'text', e.target.value)}
              placeholder="Button text"
              maxLength={25}
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {btn.type === 'URL' && (
              <input
                type="url"
                value={btn.url ?? ''}
                onChange={(e) => updateButton(i, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            )}
            {btn.type === 'PHONE_NUMBER' && (
              <input
                type="tel"
                value={btn.phone_number ?? ''}
                onChange={(e) => updateButton(i, 'phone_number', e.target.value)}
                placeholder="+1234567890"
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            )}
            <button type="button" onClick={() => removeButton(i)} className="text-red-400 hover:text-red-600 px-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
          {submitting ? 'Creating...' : 'Create Template'}
        </button>
      </div>
    </form>
  )
}
