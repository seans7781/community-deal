<template>
  <div class="profile-page">
    <van-nav-bar title="个人中心" left-arrow @click-left="onBack" />
    
    <div class="profile-header">
      <div class="user-avatar">
        <van-icon name="user-o" size="60" color="#1989fa" />
      </div>
      <div class="user-info">
        <h3>{{ userInfo.name }}</h3>
        <p>{{ userInfo.roleText }}</p>
        <p class="user-phone">{{ userInfo.phone || '暂无手机号' }}</p>
      </div>
    </div>

    <van-cell-group>
      <van-cell title="账号信息" icon="user-o" is-link @click="showUserInfo" />
      <van-cell title="修改密码" icon="lock" is-link @click="showChangePassword" />
      <van-cell v-if="userInfo.role === 'admin'" title="重置密码" icon="lock" is-link @click="showAdminReset" />
      <van-cell title="关于我们" icon="info-o" is-link @click="showAbout" />
      <!-- <van-cell title="消息通知" icon="bell" is-link @click="goToMessages" :value="unreadCount > 0 ? unreadCount + '条未读' : ''" /> -->
    </van-cell-group>

    <div v-if="userInfo.role === 'owner'" class="quick-actions">
      <div class="section-header">
        <h3>快捷功能</h3>
      </div>
      <van-grid :column-num="3" :gutter="12">
        <van-grid-item @click="goToRepairPage">
          <div class="qa-card qa-repair">
            <div class="qa-icon">🔧</div>
            <div class="qa-title">报修</div>
          </div>
        </van-grid-item>
        <van-grid-item @click="goToComplaintPage">
          <div class="qa-card qa-complaint">
            <div class="qa-icon">⚠️</div>
            <div class="qa-title">投诉</div>
          </div>
        </van-grid-item>
        <van-grid-item @click="goToSuggestionPage">
          <div class="qa-card qa-suggestion">
            <div class="qa-icon">💡</div>
            <div class="qa-title">建议</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <div v-if="userInfo.role === 'property'" class="quick-actions">
      <div class="section-header">
        <h3>快捷功能</h3>
      </div>
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item @click="goToSuggestionPage">
          <div class="qa-card qa-suggestion">
            <div class="qa-icon">💡</div>
            <div class="qa-title">建议</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <div v-if="userInfo.role === 'owner'" class="owner-sections">
      <div class="work-order-section">
        <div class="section-header">
          <h3>我的工单</h3>
          <span class="more-text" @click="showAllOrders">查看全部</span>
        </div>
        <div class="work-order-list">
          <div class="section-header"><h3>投诉</h3></div>
          <div
            v-for="order in myComplaints.slice(0, 3)"
            :key="order.id"
            class="work-order-item"
            @click="goToOrderDetail(order.id)"
          >
            <div class="order-info">
              <div class="order-type">{{ getOrderTypeText(order.type, order.subtype) }}</div>
              <div class="order-time">{{ order.submitTime }}</div>
            </div>
            <div class="order-status" :class="statusClass(order.status)">
              {{ getStatusText(order.status) }}
            </div>
          </div>
          <div v-if="myComplaints.length === 0" class="empty-orders">暂无投诉记录</div>

          <div class="section-header" style="margin-top:12px"><h3>报修</h3></div>
          <div
            v-for="order in myRepairs.slice(0, 3)"
            :key="order.id"
            class="work-order-item"
            @click="goToOrderDetail(order.id)"
          >
            <div class="order-info">
              <div class="order-type">{{ getOrderTypeText(order.type, order.subtype) }}</div>
              <div class="order-time">{{ order.submitTime }}</div>
            </div>
            <div class="order-status" :class="statusClass(order.status)">
              {{ getStatusText(order.status) }}
            </div>
          </div>
          <div v-if="myRepairs.length === 0" class="empty-orders">暂无报修记录</div>

          <div class="section-header" style="margin-top:12px"><h3>建议</h3></div>
          <div
            v-for="s in mySuggestions.slice(0, 3)"
            :key="s.id"
            class="work-order-item"
            @click="goToSuggestionDetail(s.id)"
          >
            <div class="order-info">
              <div class="order-type">建议 - {{ s.title }}</div>
              <div class="order-time">{{ s.submitTime }}</div>
            </div>
            <div class="order-status" :class="statusClass(s.status)">
              {{ getSuggestionStatusText(s.status) }}
            </div>
          </div>
          <div v-if="mySuggestions.length === 0" class="empty-orders">暂无建议记录</div>
        </div>
      </div>

      

      
    </div>

    <!-- <div v-if="userInfo.role === 'admin'" class="admin-sections">
      <div class="section-header">
        <h3>公告管理</h3>
      </div>
      <div class="announcement-form">
        <van-field
          v-model="newAnnouncement"
          type="textarea"
          rows="2"
          autosize
          maxlength="100"
          show-word-limit
          placeholder="输入公告内容"
        />
        <van-button type="primary" size="small" @click="addAnnouncement" :disabled="!canAdd">发布公告</van-button>
      </div>
      <div class="announcement-list">
        <div v-for="item in adminAnnouncements" :key="item.id" class="announcement-item">
          <div class="content">{{ item.content }}</div>
          <div class="time">{{ item.submitTime }}</div>
          <div class="actions">
            <van-button size="mini" @click="editAnnouncement(item)">编辑</van-button>
            <van-button size="mini" type="danger" @click="deleteAnnouncement(item.id)">删除</van-button>
          </div>
        </div>
        <div v-if="adminAnnouncements.length === 0" class="empty-ann">暂无公告</div>
      </div>
      <van-dialog v-model:show="showEditDialog" title="编辑公告" show-cancel-button @confirm="onConfirmEdit">
        <van-field v-model="editContent" type="textarea" rows="2" autosize maxlength="100" show-word-limit />
      </van-dialog>
    </div> -->

    <div class="logout-section">
      <van-button type="danger" size="large" @click="onLogout">
        退出登录
      </van-button>
    </div>

    <!-- 账号信息弹窗 -->
    <van-dialog
      v-model:show="showInfoDialog"
      title="账号信息"
      confirm-button-text="确定"
    >
      <div class="user-info-detail">
        <van-cell-group>
          <van-cell title="用户ID" :value="userInfo.id" />
          <van-cell title="姓名" :value="userInfo.name" />
          <van-cell title="角色" :value="userInfo.roleText" />
          <van-cell title="手机号" :value="userInfo.phone || '暂无'" />
        </van-cell-group>
      </div>
    </van-dialog>

    <!-- 修改密码弹窗 -->
    <van-dialog
      v-model:show="showPasswordDialog"
      title="修改密码"
      show-cancel-button
      @confirm="onChangePassword"
    >
      <div class="password-form">
        <van-field
          v-model="oldPassword"
          type="password"
          label="原密码"
          placeholder="请输入原密码"
        />
        <van-field
          v-model="newPassword"
          type="password"
          label="新密码"
          placeholder="请输入新密码"
        />
        <van-field
          v-model="confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入新密码"
        />
      </div>
    </van-dialog>

    <!-- 管理员重置密码弹窗 -->
    <van-dialog
      v-model:show="showAdminResetDialog"
      title="管理员重置密码"
      show-cancel-button
      @confirm="onAdminResetPassword"
    >
      <div class="password-form">
        <van-field
          v-model="adminResetAccount"
          label="用户名或手机号"
          placeholder="请输入用户名或手机号"
        />
        <van-field
          v-model="adminResetPwd1"
          type="password"
          label="新密码"
          placeholder="请输入新密码"
        />
        <van-field
          v-model="adminResetPwd2"
          type="password"
          label="确认密码"
          placeholder="请再次输入新密码"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { useUserStore } from '@/stores'
import { complaintMy } from '@/services/communityHome'
 
import { suggestMy } from '@/services/communityHome'
 
import { changePassword } from '@/services/communityHome'
import { adminResetPassword } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()

const showInfoDialog = ref(false)
const showPasswordDialog = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showAdminResetDialog = ref(false)
const adminResetAccount = ref('')
const adminResetPwd1 = ref('')
const adminResetPwd2 = ref('')

const userInfo = computed(() => {
  const user = userStore.user
  if (!user) return { id: '', name: '未登录', role: '', roleText: '未知角色' }
  
  const roleMap = {
    owner: '业主',
    admin: '管理员',
    property: '社区/物业'
  }
  
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    roleText: roleMap[user.role as keyof typeof roleMap] || '未知角色',
    phone: user.phone || ''
  }
})

 

const remoteMyComplaints = ref<any[]>([])
const remoteMyRepairs = ref<any[]>([])
onMounted(async () => {
  const token = userStore.user?.token || ''
  const [rc, rr] = await Promise.all([
    complaintMy(token, 'COMPLAINT'),
    complaintMy(token, 'REPAIR')
  ])
  const dc = (rc && (rc.data || rc)) as any
  const dr = (rr && (rr.data || rr)) as any
  remoteMyComplaints.value = Array.isArray(dc) ? dc : []
  remoteMyRepairs.value = Array.isArray(dr) ? dr : []
})

const mapItems = (arr: any[], defaultType: 'complaint' | 'repair') => {
  return arr.map((c: any) => ({
    id: c.Id || c.id || '',
    type: ((c.RequestType || '').toUpperCase() === 'REPAIR') ? 'repair' : ((c.RequestType || '').toUpperCase() === 'COMPLAINT') ? 'complaint' : defaultType,
    subtype: c.Type || c.SubType || '',
    building: c.Building || c.RoomNo || '',
    description: c.Description || c.Desc || '',
    submitTime: c.CreatedAt || c.SubmitTime || '',
    status: c.Status || ''
  }))
}

const myComplaints = computed(() => mapItems(remoteMyComplaints.value, 'complaint')
  .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime()))
const myRepairs = computed(() => mapItems(remoteMyRepairs.value, 'repair')
  .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime()))
 
const mySuggestionsRemote = ref<any[]>([])
onMounted(async () => {
  const token = userStore.user?.token || ''
  const r = await suggestMy(token)
  const d = (r && (r.data || r)) as any
  mySuggestionsRemote.value = Array.isArray(d) ? d : []
})

const mySuggestions = computed(() => mySuggestionsRemote.value
  .map(it => ({
    id: it.Id || it.id || '',
    title: it.Title || it.title || '',
    content: it.Content || it.content || '',
    submitTime: it.CreatedAt || '',
    status: it.Status || ''
  }))
  .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime()))

 

 

onMounted(() => {})

 

const showUserInfo = () => {
  showInfoDialog.value = true
}

const showChangePassword = () => {
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showPasswordDialog.value = true
}

const showAdminReset = () => {
  adminResetAccount.value = ''
  adminResetPwd1.value = ''
  adminResetPwd2.value = ''
  showAdminResetDialog.value = true
}

const showAbout = () => {
  showSuccessToast('小区家园通 v1.0.0\n社区工单管理系统')
}

const onChangePassword = () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    showFailToast('请填写完整密码信息')
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    showFailToast('新密码与确认密码不一致')
    return
  }
  
  if (newPassword.value.length < 6) {
    showFailToast('新密码长度不能少于6位')
    return
  }
  
  ;(async () => {
    const token = userStore.user?.token || ''
    const usernameOrPhone = userInfo.value.phone || ''
    const res = await changePassword(token, { usernameOrPhone, oldpassword: oldPassword.value, newpassword: newPassword.value })
    if (res && res.result !== false) {
      showSuccessToast((res.msg) || '密码修改成功')
      showPasswordDialog.value = false
      oldPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      showFailToast((res && res.msg) || '修改失败')
    }
  })()
}

const onAdminResetPassword = () => {
  if (!adminResetAccount.value || !adminResetPwd1.value || !adminResetPwd2.value) {
    showFailToast('请填写完整信息')
    return
  }
  if (adminResetPwd1.value !== adminResetPwd2.value) {
    showFailToast('两次输入的密码不一致')
    return
  }
  if (adminResetPwd1.value.length < 6) {
    showFailToast('新密码长度不能少于6位')
    return
  }
  ;(async () => {
    const token = userStore.user?.token || ''
    const res = await adminResetPassword(token, { usernameOrPhone: adminResetAccount.value.trim(), newpassword: adminResetPwd1.value })
    if (res && res.result !== false) {
      showSuccessToast((res.msg) || '重置成功')
      showAdminResetDialog.value = false
      adminResetAccount.value = ''
      adminResetPwd1.value = ''
      adminResetPwd2.value = ''
    } else {
      showFailToast((res && res.msg) || '重置失败')
    }
  })()
}

const onBack = () => {
  router.back()
}

const onLogout = () => {
  userStore.logout()
  showSuccessToast('已退出登录')
  setTimeout(() => {
    router.push('/login')
  }, 1000)
}

const showAllOrders = () => {
  router.push('/owner/my-orders')
}

const goToOrderDetail = (orderId: string) => {
  router.push(`/owner/order-detail/${orderId}`)
}

 

// const goToMessages = () => {
//   showDialog({ message: '消息通知功能开发中...' })
// }

const getOrderTypeText = (type: string, subtype: string) => {
  const typeMap = {
    repair: '报修',
    complaint: '投诉'
  }
  return `${typeMap[type as keyof typeof typeMap]} - ${subtype}`
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    PendingApproval: '待审核',
    Approved: '审核通过',
    Rejected: '已驳回',
    Handling: '处理中',
    Closed: '已办结'
  }
  return statusMap[status] || status
}

const statusClass = (status: string) => {
  const map: Record<string, string> = {
    PendingApproval: 'status-pending',
    Approved: 'status-approved',
    Rejected: 'status-rejected',
    Handling: 'status-processing',
    Closed: 'status-completed',
    Resolved: 'status-completed'
  }
  return map[status] || 'status-pending'
}

 

const getSuggestionStatusText = (s: string) => {
  const map: Record<string, string> = {
    PendingApproval: '待审核',
    Approved: '审核通过',
    Rejected: '已驳回',
    Resolved: '已处置'
  }
  return map[s] || s
}

 

const goToRepairPage = () => { router.push('/owner/repair') }
const goToComplaintPage = () => { router.push('/owner/complaint') }
const goToSuggestionPage = () => { router.push('/suggestion/new') }
const goToSuggestionDetail = (id: string) => { router.push(`/suggestion/detail/${id}`) }
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 50px;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  flex: 1;
  text-align: left;
}

.user-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 500;
}

.user-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.user-phone {
  font-size: 12px !important;
  opacity: 0.8 !important;
  margin-top: 4px !important;
}

.logout-section {
  margin: 20px;
}

.admin-sections {
  background: white;
  padding: 20px;
}

.announcement-form {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.announcement-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.announcement-item {
  padding: 10px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
}

.announcement-item .content {
  font-size: 14px;
  color: #333;
}

.announcement-item .time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.announcement-item .actions {
  margin-top: 8px;
  display: flex;
  gap: 6px;
}

.empty-ann {
  color: #999;
  text-align: center;
  padding: 20px 0;
}

.owner-sections {
  background: white;
}

.work-order-section {
  background: white;
  padding: 20px;
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.more-text {
  color: #666;
  font-size: 14px;
}

.work-order-list {
  background: white;
}

.work-order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.work-order-item:last-child {
  border-bottom: none;
}

.order-info {
  flex: 1;
}

.order-type {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.order-time {
  font-size: 14px;
  color: #999;
}

.order-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-approved {
  background: #d1ecf1;
  color: #0c5460;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.status-processing {
  background: #cce5ff;
  color: #004085;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.empty-orders {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}



.latest-order-content {
  padding: 20px;
}

.order-item {
  display: flex;
  margin-bottom: 15px;
  font-size: 14px;
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-item .label {
  color: #666;
  width: 80px;
  flex-shrink: 0;
}

.order-item .value {
  color: #333;
  flex: 1;
}

.user-info-detail {
  padding: 10px;
}

.password-form {
  padding: 10px;
}

.quick-actions {
  background: white;
  padding: 20px;
  margin-top: 10px;
}

:deep(.van-grid-item__content) {
  padding: 0;
}

.qa-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 90px;
  border-radius: 12px;
  color: white;
}

.qa-repair { background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%); }
.qa-complaint { background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%); }
.qa-suggestion { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.qa-icon { font-size: 28px; margin-bottom: 6px; }
.qa-title { font-size: 14px; }
</style>