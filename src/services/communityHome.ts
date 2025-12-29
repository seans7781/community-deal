import { request, toRole } from './http'

export interface LoginPayload {
  usernameOrPhone: string
  password: string
}

export async function login(payload: LoginPayload) {
  const res = await request('/api/CommunityHome/Login', { method: 'POST', body: payload })
  if (!res.ok) return { ok: false, msg: '网络错误' }
  const result = res.data?.result
  const msg = res.data?.msg as string | undefined
  if (result === false) {
    return { ok: false, msg: msg || '登录失败' }
  }
  const d = res.data?.data || {}
  return {
    ok: true,
    userId: d.userId as string,
    name: d.name as string,
    role: toRole(d.role as string),
    token: d.token as string,
    msg: msg,
  }
}

export async function ownerRegister(payload: { building: string; roomNo: string; phone: string; name: string; password: string }) {
  const res = await request('/api/CommunityHome/OwnerRegister', { method: 'POST', body: payload })
  return res?.data || null
}

export async function announcementsPublic() {
  const res = await request('/api/CommunityHome/AnnouncementsPublic', { method: 'GET' })
  return res?.data || null
}

export async function announcementsAdmin(token: string) {
  const res = await request('/api/CommunityHome/AnnouncementsAdmin', { method: 'GET', token })
  return res?.data || null
}

export async function announcementCreate(token: string, payload: { content: string; enabled: boolean }) {
  const res = await request('/api/CommunityHome/AnnouncementCreate', { method: 'POST', token, body: payload })
  return res?.data || null
}

export async function announcementUpdate(token: string, payload: { id: string; content: string; enabled: boolean }) {
  const res = await request('/api/CommunityHome/AnnouncementUpdate', { method: 'POST', token, body: payload })
  return res?.data || null
}

export async function complaintSubmit(token: string, payload: { requestType: 'COMPLAINT' | 'REPAIR'; type: string; building: string; description: string; images: string[]; contactPhone: string }) {
  const res = await request('/api/CommunityHome/ComplaintSubmit', { method: 'POST', token, body: payload })
  return res?.data || null
}

export async function complaintMy(token: string, requestType?: 'COMPLAINT' | 'REPAIR') {
  const res = await request('/api/CommunityHome/ComplaintMy', { method: 'GET', token, query: requestType ? { requestType } : undefined })
  return res?.data || null
}

export async function complaintDetail(token: string, id: string) {
  const res = await request('/api/CommunityHome/ComplaintDetail', { method: 'GET', token, query: { id } })
  return res?.data || null
}

export async function complaintApprove(token: string, payload: { complaintId: string; approved: boolean; reason: string }) {
  const res = await request('/api/CommunityHome/ComplaintApprove', { method: 'POST', token, body: payload })
  return res?.data || null
}

export async function complaintHandle(token: string, payload: { complaintId: string; resultDescription: string; photos: string[] }) {
  const res = await request('/api/CommunityHome/ComplaintHandle', { method: 'POST', token, body: payload })
  return res?.data || null
}

export async function complaintIgnore(token: string, complaintId: string) {
  const res = await request('/api/CommunityHome/ComplaintIgnore', { method: 'POST', token, body: { complaintId } })
  return res?.data || null
}

export async function complaintsTop100() {
  const res = await request('/api/CommunityHome/ComplaintsTop100', { method: 'GET' })
  return res?.data || null
}

export async function complaintReminders() {
  const res = await request('/api/CommunityHome/ComplaintReminders', { method: 'GET' })
  return res?.data || null
}

export async function bannerCreate(token: string, payload: { title: string; imageUrl: string; linkUrl: string; enabled: boolean; sortOrder: number }) {
  const res = await request('/api/CommunityHome/BannerCreate', { method: 'POST', token, body: payload })
  return res?.data || null
}

export async function bannerUpdate(token: string, payload: { id: string; title: string; imageUrl: string; linkUrl: string; enabled: boolean; sortOrder: number }) {
  const res = await request('/api/CommunityHome/BannerUpdate', { method: 'POST', token, body: payload })
  return res?.data || null
}

export async function bannerDelete(token: string, payload: { id: string }) {
  const res = await request('/api/CommunityHome/BannerDelete', { method: 'POST', token, body: payload })
  return res?.data || null
}

export async function uploadImage(queryType: string, file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await request('/api/CommunityHome/UploadImage', { method: 'POST', formData: fd, query: queryType ? { type: queryType } : undefined })
  return res?.data || null
}

export async function bannersPublic(token: string) {
  const res = await request('/api/CommunityHome/BannersPublic', { method: 'GET', token })
  return res?.data || null
}

export async function complaintPending(token: string) {
  const res = await request('/api/CommunityHome/ComplaintPending', { method: 'GET', token })
  return res?.data || null
}

export async function complaintAssigned(token: string) {
  const res = await request('/api/CommunityHome/ComplaintAssigned', { method: 'GET', token })
  return res?.data || null
}

export async function suggestSubmit(token: string, payload: { title: string; content: string; target: 'OWNER' | 'PROPERTY'; contactPhone: string }) {
  const res = await request('/api/CommunityHome/SuggestSubmit', { method: 'POST', token, body: payload })
  return res?.data || null
}

export async function suggestMy(token: string) {
  const res = await request('/api/CommunityHome/SuggestMy', { method: 'GET', token })
  return res?.data || null
}

export async function suggestDelete(token: string, suggestId: string) {
  const res = await request('/api/CommunityHome/SuggestDelete', { method: 'POST', token, body: { suggestionId: suggestId } })
  return res?.data || null
}

export async function suggestPendingAdmin(token: string) {
  const res = await request('/api/CommunityHome/SuggestPendingAdmin', { method: 'GET', token })
  return res?.data || null
}

export async function suggestApprove(token: string, payload: { suggestionId: string; approved: boolean; reason?: string }) {
  const body = { suggestionId: payload.suggestionId, approved: payload.approved, reason: payload.reason }
  const res = await request('/api/CommunityHome/SuggestApprove', { method: 'POST', token, body })
  return res?.data || null
}

export async function suggestAssignedProperty(token: string) {
  const res = await request('/api/CommunityHome/SuggestAssignedProperty', { method: 'GET', token })
  return res?.data || null
}

export async function suggestHandle(token: string, payload: { suggestId: string; resultDescription: string }) {
  const body = { suggestionId: payload.suggestId, note: payload.resultDescription }
  const res = await request('/api/CommunityHome/SuggestHandle', { method: 'POST', token, body })
  return res?.data || null
}

export async function suggestDetail(token: string, id: string) {
  const res = await request('/api/CommunityHome/SuggestDetail', { method: 'GET', token, query: { id } })
  return res?.data || null
}

export async function adminWorkorderStats(token: string) {
  const res = await request('/api/CommunityHome/AdminWorkorderStats', { method: 'GET', token })
  return res?.data || null
}

export async function adminHandledWorkorders(token: string) {
  const res = await request('/api/CommunityHome/AdminHandledWorkorders', { method: 'GET', token })
  return res?.data || null
}

export async function propertyHandledWorkorders(token: string) {
  const res = await request('/api/CommunityHome/PropertyHandledWorkorders', { method: 'GET', token })
  return res?.data || null
}

export async function adminHandledSuggestions(token: string) {
  const res = await request('/api/CommunityHome/AdminHandledSuggestions', { method: 'GET', token })
  return res?.data || null
}

export async function changePassword(token: string, payload: { usernameOrPhone: string; oldpassword: string; newpassword: string }) {
  const res = await request('/api/CommunityHome/ChangePassword', { method: 'POST', token, body: payload })
  return res?.data || null
}

export async function adminResetPassword(token: string, payload: { usernameOrPhone: string; newpassword: string }) {
  const res = await request('/api/CommunityHome/AdminResetPassword', { method: 'POST', token, body: payload })
  return res?.data || null
}