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
      <van-cell title="关于我们" icon="info-o" is-link @click="showAbout" />
      <van-cell title="消息通知" icon="bell" is-link @click="goToMessages" :value="unreadCount > 0 ? unreadCount + '条未读' : ''" />
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
          <div
            v-for="order in myWorkOrders.slice(0, 3)"
            :key="order.id"
            class="work-order-item"
            @click="goToOrderDetail(order.id)"
          >
            <div class="order-info">
              <div class="order-type">{{ getOrderTypeText(order.type, order.subtype) }}</div>
              <div class="order-time">{{ order.submitTime }}</div>
            </div>
            <div class="order-status" :class="'status-' + order.status">
              {{ getStatusText(order.status) }}
            </div>
          </div>
          <div v-if="myWorkOrders.length === 0" class="empty-orders">
            暂无工单记录
          </div>
        </div>
      </div>

      

      <van-dialog
        v-model:show="showLatestOrderDialog"
        title="最新工单处理情况"
        confirm-button-text="查看详情"
        @confirm="goToLatestOrder"
      >
        <div class="latest-order-content" v-if="latestOrder">
          <div class="order-item">
            <span class="label">工单编号：</span>
            <span class="value">{{ latestOrder.id }}</span>
          </div>
          <div class="order-item">
            <span class="label">处理阶段：</span>
            <span class="value">{{ getStatusText(latestOrder.status) }}</span>
          </div>
          <div class="order-item">
            <span class="label">处理备注：</span>
            <span class="value">{{ getLatestOrderRemark() }}</span>
          </div>
        </div>
      </van-dialog>
    </div>

    <div v-if="userInfo.role === 'admin'" class="admin-sections">
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
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showDialog } from 'vant'
import { useUserStore, useWorkOrderStore, useChatStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
const workOrderStore = useWorkOrderStore()
const chatStore = useChatStore()

const showInfoDialog = ref(false)
const showPasswordDialog = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

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

const unreadCount = ref(1)

const myWorkOrders = computed(() => {
  return workOrderStore.getOwnerWorkOrders(userStore.user?.name || '')
    .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
})

const latestOrder = computed(() => {
  return myWorkOrders.value[0]
})

const showLatestOrderDialog = ref(false)

onMounted(() => {
  if (latestOrder.value && latestOrder.value.status !== 'pending') {
    setTimeout(() => {
      showLatestOrderDialog.value = true
    }, 1000)
  }
})

const newAnnouncement = ref('')
const showEditDialog = ref(false)
const editTargetId = ref('')
const editContent = ref('')

const adminAnnouncements = computed(() => {
  return chatStore.getApprovedMessages()
    .filter(m => m.senderRole === 'admin')
    .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
})

const canAdd = computed(() => newAnnouncement.value.trim().length > 0)

const addAnnouncement = () => {
  if (!canAdd.value || !userStore.user) return
  const id = 'ANN' + Date.now().toString()
  chatStore.addMessage({
    id,
    content: newAnnouncement.value.trim(),
    senderName: userStore.user.name,
    senderId: userStore.user.id,
    senderRole: 'admin',
    submitTime: new Date().toLocaleString('zh-CN'),
    status: 'approved'
  })
  newAnnouncement.value = ''
}

const editAnnouncement = (item: any) => {
  editTargetId.value = item.id
  editContent.value = item.content
  showEditDialog.value = true
}

const onConfirmEdit = () => {
  if (editTargetId.value) {
    chatStore.updateMessage(editTargetId.value, { content: editContent.value })
  }
  showEditDialog.value = false
}

const deleteAnnouncement = (id: string) => {
  chatStore.deleteMessage(id)
}

const showUserInfo = () => {
  showInfoDialog.value = true
}

const showChangePassword = () => {
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showPasswordDialog.value = true
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
  
  // 模拟修改密码成功
  showSuccessToast('密码修改成功')
  showPasswordDialog.value = false
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
  showDialog({ message: '查看全部工单功能开发中...' })
}

const goToOrderDetail = (orderId: string) => {
  router.push(`/owner/order-detail/${orderId}`)
}

const goToLatestOrder = () => {
  if (latestOrder.value) {
    router.push(`/owner/order-detail/${latestOrder.value.id}`)
  }
}

const goToMessages = () => {
  showDialog({ message: '消息通知功能开发中...' })
}

const getOrderTypeText = (type: string, subtype: string) => {
  const typeMap = {
    repair: '报修',
    complaint: '投诉'
  }
  return `${typeMap[type as keyof typeof typeMap]} - ${subtype}`
}

const getStatusText = (status: string) => {
  const statusMap = {
    pending: '待审核',
    approved: '审核通过',
    rejected: '已驳回',
    processing: '处理中',
    completed: '已完成'
  }
  return statusMap[status as keyof typeof statusMap]
}

const getLatestOrderRemark = () => {
  if (!latestOrder.value) return ''
  
  switch (latestOrder.value.status) {
    case 'approved':
      return '您的工单已通过审核，正在安排处理'
    case 'rejected':
      return latestOrder.value.reviewComment || '工单被驳回，请查看详情'
    case 'processing':
      return '您的工单正在处理中'
    case 'completed':
      return '您的工单已处理完成'
    default:
      return '工单状态更新'
  }
}

const goToRepairPage = () => { router.push('/owner/repair') }
const goToComplaintPage = () => { router.push('/owner/complaint') }
const goToSuggestionPage = () => { router.push('/suggestion/new') }
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