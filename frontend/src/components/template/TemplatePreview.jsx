export default function TemplatePreview({ template }) {
  const { name, components = [] } = template
  const header = components.find((c) => c.type === 'HEADER')
  const body = components.find((c) => c.type === 'BODY')
  const footer = components.find((c) => c.type === 'FOOTER')
  const buttons = components.find((c) => c.type === 'BUTTONS')

  const hasContent = header?.text || header?.format || body?.text || footer?.text

  function renderBody(text) {
    if (!text) return null
    // Replace {{1}}, {{2}} etc. with styled placeholders
    return text.replace(/\{\{(\d+)\}\}/g, (_, n) => `[Variable ${n}]`)
  }

  return (
    <div className="rounded-xl border bg-gray-100 p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Preview</p>

      <div className="mx-auto max-w-xs">
        {/* Phone frame */}
        <div className="rounded-2xl bg-[#e5ddd5] p-3 min-h-[200px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')]">

          {!hasContent ? (
            <p className="text-center text-xs text-gray-500 py-8">
              Start building your template to see a preview
            </p>
          ) : (
            <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%] ml-auto">
              {/* Header */}
              {header?.format === 'TEXT' && header.text && (
                <p className="font-semibold text-sm text-gray-900 mb-1">{header.text}</p>
              )}
              {header?.format === 'IMAGE' && (
                <div className="bg-gray-200 rounded h-32 flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {header?.format === 'VIDEO' && (
                <div className="bg-gray-200 rounded h-32 flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              {header?.format === 'DOCUMENT' && (
                <div className="bg-gray-200 rounded h-16 flex items-center justify-center mb-2 gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs text-gray-500">Document</span>
                </div>
              )}
              {header?.format === 'LOCATION' && (
                <div className="bg-emerald-100 rounded h-24 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}

              {/* Body */}
              {body?.text && (
                <p className="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {renderBody(body.text)}
                </p>
              )}

              {/* Footer */}
              {footer?.text && (
                <p className="text-[11px] text-gray-400 mt-1">{footer.text}</p>
              )}

              {/* Timestamp */}
              <p className="text-[10px] text-gray-400 text-right mt-1">12:00 PM</p>

              {/* Buttons */}
              {buttons?.buttons?.length > 0 && (
                <div className="mt-2 border-t pt-2 space-y-1">
                  {buttons.buttons.map((btn, i) => (
                    <div key={i} className="text-center text-[13px] text-blue-500 font-medium py-1 border rounded">
                      {btn.text || `Button ${i + 1}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {name && (
          <p className="text-center text-xs text-gray-400 mt-2">Template: {name}</p>
        )}
      </div>
    </div>
  )
}
