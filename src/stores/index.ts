import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: string
  name: string
  role: 'owner' | 'admin' | 'property'
  phone?: string
  building?: string
  room?: string
  password?: string
  token?: string
}

export interface WorkOrder {
  id: string
  type: 'repair' | 'complaint'
  subtype: string
  building: string
  description: string
  phone: string
  images: string[]
  status: 'PendingApproval' | 'Approved' | 'Rejected' | 'Handling' | 'Closed'
  submitTime: string
  ownerName: string
  reviewTime?: string
  reviewer?: string
  reviewComment?: string
  handleTime?: string
  handler?: string
  handleDescription?: string
  handleImages?: string[]
}

export interface ChatMessage {
  id: string
  content: string
  senderName: string
  senderId: string
  senderRole: 'owner' | 'admin' | 'property'
  submitTime: string
  status: 'pending' | 'approved' | 'rejected'
  reviewTime?: string
  reviewer?: string
  reviewComment?: string
}

export interface Suggestion {
  id: string
  title: string
  content: string
  senderName: string
  senderId: string
  senderRole: 'owner' | 'property'
  targetRole: 'owner' | 'property'
  submitTime: string
  status: 'pending' | 'approved' | 'rejected'
  reviewTime?: string
  reviewer?: string
  reviewComment?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)

  const login = (userData: User) => {
    user.value = userData
    isLoggedIn.value = true
  }

  const logout = () => {
    user.value = null
    isLoggedIn.value = false
    try { localStorage.removeItem('token') } catch {}
  }

  const registerOwner = async (data: { name: string; phone: string; building: string; room: string; password: string }) => {
    const payload = { building: data.building, roomNo: data.room, phone: data.phone, name: data.name, password: data.password }
    const res = await (await import('@/services/communityHome')).ownerRegister(payload)
    return res
  }

  const loginWithPassword = async (phone: string, password: string) => {
    const api = await import('@/services/communityHome')
    const ret = await api.login({ usernameOrPhone: phone, password })
    if (!ret || ret.ok === false) {
      return { ok: false, msg: ret?.msg || '账号或密码错误' }
    }
    login({ id: ret.userId as string, name: ret.name as string, role: ret.role as any, phone, token: ret.token as string })
    try { localStorage.setItem('token', ret.token as string) } catch {}
    return { ok: true }
  }

  return {
    user,
    isLoggedIn,
    login,
    logout,
    registerOwner,
    loginWithPassword
  }
})

export const useWorkOrderStore = defineStore('workOrder', () => {
  const workOrders = ref<WorkOrder[]>([])

  const addWorkOrder = (order: WorkOrder) => {
    workOrders.value.push(order)
  }

  const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    const index = workOrders.value.findIndex(order => order.id === id)
    if (index !== -1) {
      workOrders.value[index] = { ...workOrders.value[index], ...updates }
    }
  }

  const getWorkOrderById = (id: string) => {
    return workOrders.value.find(order => order.id === id)
  }

  const getWorkOrdersByStatus = (status: string) => {
    return workOrders.value.filter(order => order.status === status)
  }

  const getOwnerWorkOrders = (ownerId: string) => {
    return workOrders.value.filter(order => order.ownerName === ownerId)
  }

  return {
    workOrders,
    addWorkOrder,
    updateWorkOrder,
    getWorkOrderById,
    getWorkOrdersByStatus,
    getOwnerWorkOrders
  }
})

export * from './carouselStore'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])

  const addMessage = (message: ChatMessage) => {
    messages.value.push(message)
  }

  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    const index = messages.value.findIndex(msg => msg.id === id)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates }
    }
  }

  const deleteMessage = (id: string) => {
    const index = messages.value.findIndex(msg => msg.id === id)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  const getPendingMessages = () => {
    return messages.value.filter(msg => msg.status === 'pending')
  }

  const getApprovedMessages = () => {
    return messages.value.filter(msg => msg.status === 'approved')
  }

  const getRejectedMessages = () => {
    return messages.value.filter(msg => msg.status === 'rejected')
  }

  const getMessagesBySender = (senderId: string) => {
    return messages.value.filter(msg => msg.senderId === senderId)
  }

  return {
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    getPendingMessages,
    getApprovedMessages,
    getRejectedMessages,
    getMessagesBySender
  }
})

export const useSuggestionStore = defineStore('suggestion', () => {
  const suggestions = ref<Suggestion[]>([])

  const addSuggestion = (s: Suggestion) => {
    suggestions.value.push(s)
  }

  const updateSuggestion = (id: string, updates: Partial<Suggestion>) => {
    const idx = suggestions.value.findIndex(it => it.id === id)
    if (idx !== -1) {
      suggestions.value[idx] = { ...suggestions.value[idx], ...updates }
    }
  }

  const getPendingSuggestions = () => {
    return suggestions.value.filter(s => s.status === 'pending')
  }

  const getApprovedSuggestionsForRole = (role: 'owner' | 'property') => {
    return suggestions.value
      .filter(s => s.status === 'approved' && s.targetRole === role)
      .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
  }

  return {
    suggestions,
    addSuggestion,
    updateSuggestion,
    getPendingSuggestions,
    getApprovedSuggestionsForRole
  }
})