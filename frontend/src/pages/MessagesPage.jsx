import { useState } from 'react'
import { sendMessage, fetchTemplates } from '../api/endpoints'
import { useApi } from '../hooks/useApi'

export default function MessagesPage() {
  const [to, setTo] = useState('')
  const [type, setType] = useState('text')
  const [textBody, setTextBody] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [templateLang, setTemplateLang] = useState('en_US')
  const [templateParams, setTemplateParams] = useState([])
  const [mediaLink, setMediaLink] = useState('')
  const [mediaCaption, setMediaCaption] = useState('')
  const [docFilename, setDocFilename] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  const { data: templates } = useApi(fetchTemplates)

  async function handleSend(e) {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!to) { setError('Recipient phone number is required'); return }

    let payload = { to, type }

    if (type === 'text') {
      if (!textBody) { setError('Message body is required'); return }
      payload.text = { preview_url: false, body: textBody }
    } else if (type === 'template') {
      if (!templateName) { setError('Select a template'); return }
      const tmpl = { name: templateName, language: { code: templateLang } }
      if (templateParams.some(p => p)) {
        tmpl.components = [{
          type: 'body',
          parameters: templateParams.filter(p => p).map(p => ({ type: 'text', text: p })),
        }]
      }
      payload.template = tmpl
    } else if (type === 'image') {
      if (!mediaLink) { setError('Image URL is required'); return }
      payload.image = { link: mediaLink, caption: mediaCaption || undefined }
    } else if (type === 'document') {
      if (!mediaLink) { setError('Document URL is required'); return }
      payload.document = { link: mediaLink, caption: mediaCaption || undefined, filename: docFilename || undefined }
    }

    setSending(true)
    try {
      const res = await sendMessage(payload)
      setResult(res)
      setHistory(prev => [{ to, type, id: res.messages?.[0]?.id, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)])
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  function handleTemplateSelect(name) {
    setTemplateName(name)
    const tmpl = templates?.find(t => t.name === name)
    if (tmpl) {
      const body = tmpl.components?.find(c => c.type === 'BODY')
      const vars = body?.text?.match(/\{\{\d+\}\}/g) || []
      setTemplateParams(new Array(vars.length).fill(''))
      setTemplateLang(tmpl.language || 'en_US')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Send Message</h2>
      <p className="mt-1 text-sm text-gray-500">Send messages via the WhatsApp Cloud API</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,380px]">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSend} className="space-y-5">
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
            {result && (
              <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg p-3">
                Message sent! ID: {result.messages?.[0]?.id}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Recipient Phone Number</label>
              <input
                type="tel"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="+27821234567"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message Type</label>
              <div className="mt-1 flex gap-2">
                {['text', 'template', 'image', 'document'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setType(t); setError(''); setResult(null) }}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${type === t ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-gray-50'}`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                  rows={4}
                  maxLength={4096}
                  placeholder="Type your message..."
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {type === 'template' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Template</label>
                  <select
                    value={templateName}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select a template...</option>
                    {templates?.filter(t => t.status === 'APPROVED').map(t => (
                      <option key={t.name + t.language} value={t.name}>
                        {t.name} ({t.language})
                      </option>
                    ))}
                  </select>
                </div>
                {templateParams.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Template parameters:</p>
                    {templateParams.map((p, i) => (
                      <input
                        key={i}
                        type="text"
                        value={p}
                        onChange={(e) => {
                          const params = [...templateParams]
                          params[i] = e.target.value
                          setTemplateParams(params)
                        }}
                        placeholder={`Value for {{${i + 1}}}`}
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {(type === 'image' || type === 'document') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{type === 'image' ? 'Image' : 'Document'} URL</label>
                  <input
                    type="url"
                    value={mediaLink}
                    onChange={(e) => setMediaLink(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Caption (optional)</label>
                  <input
                    type="text"
                    value={mediaCaption}
                    onChange={(e) => setMediaCaption(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {type === 'document' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Filename (optional)</label>
                    <input
                      type="text"
                      value={docFilename}
                      onChange={(e) => setDocFilename(e.target.value)}
                      placeholder="report.pdf"
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </>
            )}

            <button type="submit" disabled={sending} className="w-full px-4 py-2.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Send History */}
        <div className="rounded-xl border bg-white p-5 shadow-sm self-start">
          <h3 className="text-sm font-semibold text-gray-700">Recent Sends</h3>
          {history.length === 0 ? (
            <p className="mt-3 text-xs text-gray-400">No messages sent yet</p>
          ) : (
            <div className="mt-3 space-y-2">
              {history.map((h, i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">{h.to}</span>
                    <span className="text-xs text-gray-400">{h.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{h.type} - {h.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
