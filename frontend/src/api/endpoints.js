import { meta, getSettings } from './client'

function pid() { return getSettings().phoneNumberId }
function waba() { return getSettings().wabaId }

// Account
export const fetchAccount = async () => {
  const [wabaInfo, phones] = await Promise.all([
    meta.get(waba(), { fields: 'id,name,currency,timezone_id,message_template_namespace' }),
    meta.get(`${waba()}/phone_numbers`, { fields: 'display_phone_number,verified_name,quality_rating,id,name_status,code_verification_status' }),
  ])
  return {
    ...wabaInfo,
    phone_number_count: phones.data?.length ?? 0,
    phone_numbers: phones.data ?? [],
  }
}

// Profile
export const fetchProfile = async () => {
  const res = await meta.get(`${pid()}/whatsapp_business_profile`, {
    fields: 'about,address,description,email,profile_picture_url,websites,vertical',
  })
  return res.data?.[0] ?? {}
}

export const updateProfile = (data) =>
  meta.post(`${pid()}/whatsapp_business_profile`, { messaging_product: 'whatsapp', ...data })

// Phone Numbers
export const fetchPhoneNumbers = async () => {
  const res = await meta.get(`${waba()}/phone_numbers`, {
    fields: 'display_phone_number,verified_name,quality_rating,id,name_status,code_verification_status',
  })
  return res.data ?? []
}

export const fetchPhoneNumber = (id) =>
  meta.get(id, { fields: 'display_phone_number,verified_name,quality_rating,id,name_status,code_verification_status' })

export const requestNameChange = (phoneId, pin) =>
  meta.post(`${phoneId}/register`, { messaging_product: 'whatsapp', pin })

// Templates
export const fetchTemplates = async () => {
  const res = await meta.get(`${waba()}/message_templates`, {
    fields: 'name,status,category,language,components,quality_score,id',
    limit: '100',
  })
  return res.data ?? []
}

export const createTemplate = (data) =>
  meta.post(`${waba()}/message_templates`, data)

export const deleteTemplate = (name) =>
  meta.del(`${waba()}/message_templates`, { name })

// Messages
export const sendMessage = (data) =>
  meta.post(`${pid()}/messages`, { messaging_product: 'whatsapp', ...data })

// Analytics
export const fetchAnalytics = (start, end, granularity = 'DAY') =>
  meta.get(waba(), {
    fields: `analytics.start(${start}).end(${end}).granularity(${granularity}).phone_numbers([])`,
  })

export const fetchConversationAnalytics = (start, end, granularity = 'MONTHLY') =>
  meta.get(waba(), {
    fields: `conversation_analytics.start(${start}).end(${end}).granularity(${granularity}).dimensions(["conversation_type","conversation_direction"])`,
  })
