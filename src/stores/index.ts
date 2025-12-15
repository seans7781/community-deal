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
}

export interface WorkOrder {
  id: string
  type: 'repair' | 'complaint'
  subtype: string
  building: string
  description: string
  phone: string
  images: string[]
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed'
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
  const registeredOwners = ref<User[]>([])
  const presetUsers = ref<User[]>([])

  if (presetUsers.value.length === 0) {
    presetUsers.value.push(
      { id: 'admin-001', name: '管理员', role: 'admin', phone: '13800138001', password: 'admin123' },
      { id: 'owner-demo-001', name: '张三', role: 'owner', phone: '13800138002', building: '1栋', room: '101', password: 'owner123' },
      { id: 'property-001', name: '物业客服', role: 'property', phone: '13800138003', password: 'property123' }
    )
  }

  const login = (userData: User) => {
    user.value = userData
    isLoggedIn.value = true
  }

  const logout = () => {
    user.value = null
    isLoggedIn.value = false
  }

  const registerOwner = (data: { name: string; phone: string; building: string; room: string; password: string }) => {
    const exists = registeredOwners.value.find(u => u.phone === data.phone)
    if (exists) return null
    const newUser: User = {
      id: 'owner-' + Date.now().toString(),
      name: data.name,
      role: 'owner',
      phone: data.phone,
      building: data.building,
      room: data.room,
      password: data.password
    }
    registeredOwners.value.push(newUser)
    return newUser
  }

  const getOwnerByPhone = (phone: string) => {
    return registeredOwners.value.find(u => u.phone === phone) || null
  }

  const loginWithPassword = (phone: string, password: string) => {
    const preset = presetUsers.value.find(u => u.phone === phone)
    const found = preset || getOwnerByPhone(phone)
    if (found && found.password === password) {
      login(found)
      return true
    }
    return false
  }

  return {
    user,
    isLoggedIn,
    login,
    logout,
    registeredOwners,
    presetUsers,
    registerOwner,
    getOwnerByPhone,
    
    loginWithPassword
  }
})

export const useWorkOrderStore = defineStore('workOrder', () => {
  const workOrders = ref<WorkOrder[]>([])

  if (workOrders.value.length === 0) {
    const seed: WorkOrder[] = [
      {
        id: 'TS20250609001',
        type: 'complaint',
        subtype: '噪音扰民',
        building: '5栋1单元302',
        description: '楼上住户晚上10点后大声播放音乐，影响休息。',
        phone: '13800000001',
        images: [],
        status: 'approved',
        submitTime: '2025-06-09 16:45:12',
        ownerName: '李四'
      },
      {
        id: 'TS20250609002',
        type: 'complaint',
        subtype: '电梯异常',
        building: '3栋2单元电梯',
        description: '电梯运行时有异响，担心安全问题。',
        phone: '13800000002',
        images: [],
        status: 'approved',
        submitTime: '2025-06-09 15:20:10',
        ownerName: '王五'
      },
      {
        id: 'TS20250609003',
        type: 'complaint',
        subtype: '公共卫生',
        building: '2栋一楼大厅',
        description: '大厅地面有积尘，需加强保洁。',
        phone: '13800000003',
        images: [],
        status: 'approved',
        submitTime: '2025-06-09 14:05:33',
        ownerName: '赵六'
      },
      {
        id: 'TS20250609004',
        type: 'complaint',
        subtype: '绿化维护',
        building: '小区主路旁',
        description: '绿化带杂草较多，影响美观。',
        phone: '13800000004',
        images: [],
        status: 'approved',
        submitTime: '2025-06-09 13:18:27',
        ownerName: '孙七'
      },
      {
        id: 'TS20250609005',
        type: 'complaint',
        subtype: '停车管理',
        building: '地下车库B区',
        description: '有车辆长期占用消防通道。',
        phone: '13800000005',
        images: [],
        status: 'approved',
        submitTime: '2025-06-09 12:40:05',
        ownerName: '周八'
      },
      {
        id: 'TS20250609006',
        type: 'complaint',
        subtype: '噪音扰民',
        building: '1栋2单元502',
        description: '装修施工噪音超时，望规范。',
        phone: '13800000006',
        images: [],
        status: 'approved',
        submitTime: '2025-06-09 11:12:48',
        ownerName: '钱九'
      }
    ]
    workOrders.value.push(...seed)
  }

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

  if (messages.value.length === 0) {
    messages.value.push(
      {
        id: 'ANN20250609001',
        content: '本周五晚8点社区会议室召开业主大会，请准时参加',
        senderName: '管理员',
        senderId: 'admin',
        senderRole: 'admin',
        submitTime: '2025-06-09 10:00:00',
        status: 'approved'
      },
      {
        id: 'ANN20250609002',
        content: '高温来临，请注意用电安全，及时关闭电器',
        senderName: '管理员',
        senderId: 'admin',
        senderRole: 'admin',
        submitTime: '2025-06-09 11:00:00',
        status: 'approved'
      },
      {
        id: 'ANN20250609003',
        content: '电梯维保周三上午进行，请合理安排出行',
        senderName: '管理员',
        senderId: 'admin',
        senderRole: 'admin',
        submitTime: '2025-06-09 12:00:00',
        status: 'approved'
      },
      {
        id: 'ANN20250609004',
        content: '地下车库B区将进行清洁，届时请勿长时间停放',
        senderName: '管理员',
        senderId: 'admin',
        senderRole: 'admin',
        submitTime: '2025-06-09 13:00:00',
        status: 'approved'
      }
    )
  }

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