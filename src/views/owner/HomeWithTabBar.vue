<template>
  <div class="owner-home">
      <van-nav-bar
        title="小区家园通"
        left-text="退出"
        @click-left="onLogout"
      />

      <div class="owner-home-content">
        <div class="announcement-bar">
          <van-notice-bar
            left-icon="volume-o"
            :text="announcementText || '暂无公告'"
            scrollable
          />
        </div>

        <div class="welcome-section">
          <h2>欢迎回来，{{ userStore.user?.name }}</h2>
        </div>

        <div class="function-cards">
          <van-grid :column-num="2" :gutter="12">
          <van-grid-item @click="goToRepair">
            <div class="function-card repair-card">
              <div class="card-icon">🔧</div>
              <div class="card-title">我要报修</div>
            </div>
          </van-grid-item>
          <van-grid-item @click="goToComplaint">
            <div class="function-card complaint-card">
              <div class="card-icon">⚠️</div>
              <div class="card-title">我要投诉</div>
            </div>
          </van-grid-item>
        </van-grid>
        </div>

        <div class="complaints-section">
        <div class="section-header">
          <h3>业主投诉动态</h3>
        </div>
        <div class="filter-section">
          <van-button
            size="small"
            :type="complaintFilter === 'all' ? 'primary' : 'default'"
            @click="complaintFilter = 'all'"
          >全部</van-button>
          <van-button
            size="small"
            :type="complaintFilter === 'unprocessed' ? 'primary' : 'default'"
            @click="complaintFilter = 'unprocessed'"
          >未处理</van-button>
          <van-button
            size="small"
            :type="complaintFilter === 'processed' ? 'primary' : 'default'"
            @click="complaintFilter = 'processed'"
          >已处理</van-button>
        </div>
        <div class="complaint-list" ref="complaintListRef">
          <div
            v-for="order in complaintOrdersFiltered"
            :key="order.id"
            class="complaint-card"
            @click="goToOrderDetail(order.id)"
          >
            <div class="complaint-header">
              <div class="complaint-type">{{ getOrderTypeText(order.type, order.subtype) }}</div>
            </div>
            <div class="complaint-info">
              <div class="info-item">
                <span class="label">楼栋：</span>
                <span class="value">{{ order.building }}</span>
              </div>
              <div class="info-item">
                <span class="label">时间：</span>
                <span class="value">{{ order.submitTime }}</span>
              </div>
            </div>
            <div class="complaint-desc">{{ order.description }}</div>
            <div v-if="order.images && order.images.length" class="complaint-images">
              <van-image
                v-for="(img, idx) in order.images.slice(0, 3)"
                :key="idx"
                :src="img"
                width="72"
                height="72"
                fit="cover"
              />
            </div>
          </div>
          <div v-if="complaintOrdersFiltered.length === 0" class="empty-orders">
            暂无投诉内容
          </div>
        </div>
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

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useWorkOrderStore, useChatStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
const workOrderStore = useWorkOrderStore()

const chatStore = useChatStore()
const complaintListRef = ref<HTMLElement | null>(null)
const scrollTimer = ref<number | null>(null)

const adminNotices = computed(() => {
  return chatStore.getApprovedMessages()
    .filter(m => m.senderRole === 'admin')
    .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
})

const announcementText = computed(() => {
  if (adminNotices.value.length === 0) return ''
  return adminNotices.value.map(n => n.content).join(' ｜ ')
})

const complaintOrders = computed(() => {
  return workOrderStore.workOrders
    .filter(order => order.type === 'complaint')
    .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
})

const complaintFilter = ref<'all' | 'unprocessed' | 'processed'>('all')

const complaintOrdersFiltered = computed(() => {
  if (complaintFilter.value === 'processed') {
    return complaintOrders.value.filter(o => o.status === 'completed')
  } else if (complaintFilter.value === 'unprocessed') {
    return complaintOrders.value.filter(o => o.status !== 'completed')
  }
  return complaintOrders.value
})

const myWorkOrders = computed(() => {
  return workOrderStore.getOwnerWorkOrders(userStore.user?.name || '')
    .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
})

const latestOrder = computed(() => {
  return myWorkOrders.value[0]
})

const showLatestOrderDialog = ref(false)

const onLogout = () => {
  userStore.logout()
  router.push('/')
}

const goToRepair = () => {
  router.push('/owner/repair')
}

const goToComplaint = () => {
  router.push('/owner/complaint')
}

const goToOrderDetail = (orderId: string) => {
  router.push(`/owner/order-detail/${orderId}`)
}

const goToLatestOrder = () => {
  if (latestOrder.value) {
    router.push(`/owner/order-detail/${latestOrder.value.id}`)
  }
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

onMounted(() => {
  if (latestOrder.value && latestOrder.value.status !== 'pending') {
    setTimeout(() => {
      showLatestOrderDialog.value = true
    }, 1000)
  }
  scrollTimer.value = window.setInterval(() => {
    const el = complaintListRef.value as HTMLElement
    if (!el) return
    el.scrollTop += 1
    if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
      el.scrollTop = 0
    }
  }, 30)
})

onUnmounted(() => {
  if (scrollTimer.value) {
    clearInterval(scrollTimer.value)
    scrollTimer.value = null
  }
})

</script>

<style scoped>
.owner-home {
  height: calc(100vh - 50px);
  background: #f5f5f5;
  overflow: hidden;
}

.owner-home-content {
  height: 100%;
  display: grid;
  grid-template-rows: 8% 10% 18% 64%;
}

.announcement-bar {
  background: white;
  padding: 8px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid #ebedf0;
  min-height: 40px;
  position: relative;
  z-index: 1;
}

.announcement-bar .van-notice-bar {
  width: 100%;
  display: flex;
  align-items: center;
}

.welcome-section {
  padding: 20px;
  background: white;
  margin-bottom: 10px;
}

.welcome-section h2 {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.function-cards {
  padding: 20px;
  background: white;
  margin-bottom: 10px;
  height: 100%;
  box-sizing: border-box;
}

.function-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;
}

.function-cards .van-grid {
  height: 100%;
}

.function-cards .van-grid-item__content {
  height: 100%;
}

.repair-card {
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
}

.complaint-card {
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
}

.complaints-section {
  background: white;
  padding: 20px;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}

.filter-section {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.complaint-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
}

.complaints-section .complaint-card {
  background: transparent;
  border-radius: 12px;
  padding: 12px;
}

.complaint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.complaint-type {
  font-size: 16px;
  color: #333;
}

.complaint-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.complaint-info {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.complaint-info .label {
  color: #666;
}

.complaint-desc {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.complaint-images {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.card-icon {
  font-size: 40px;
  color: #fff;
  margin-right: 10px;
}

.card-title {
  font-size: 16px;
  color: #fff;
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

.message-entry {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: white;
  position: relative;
}

.message-entry .van-icon {
  font-size: 20px;
  margin-right: 10px;
  color: #666;
}

.unread-badge {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: #ee0a24;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
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
</style>