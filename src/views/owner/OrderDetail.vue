<template>
  <div class="order-detail-page">
    <van-nav-bar
      title="工单详情"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <div v-if="order" class="order-content">
      <div class="order-header">
        <div class="order-id">工单编号：{{ order.id }}</div>
        <div class="order-status" :class="'status-' + order.status">
          {{ getStatusText(order.status) }}
        </div>
      </div>

      <van-cell-group title="基本信息">
        <van-cell title="工单类型" :value="getOrderTypeText(order.type, order.subtype)" />
        <van-cell title="提交时间" :value="order.submitTime" />
        <van-cell title="所在楼栋" :value="order.building" />
      </van-cell-group>

      <van-cell-group title="问题描述">
        <div class="description-content">
          {{ order.description }}
        </div>
      </van-cell-group>

      <van-cell-group title="相关图片" v-if="order.images && order.images.length > 0">
        <div class="image-list">
          <van-image
            v-for="(image, index) in order.images"
            :key="index"
            :src="normalizeUrl(image)"
            width="80"
            height="80"
            fit="cover"
            @click="previewImage(order.images, index)"
          />
        </div>
      </van-cell-group>

      <!-- 审核信息 -->
      <van-cell-group title="审核信息" v-if="order.status !== 'PendingApproval'">
        <van-cell 
          title="审核结果" 
          :value="order.status === 'Rejected' ? '审核驳回' : '审核通过'"
          :class="order.status === 'Rejected' ? 'text-danger' : 'text-success'"
        />
        <van-cell title="审核时间" :value="order.reviewTime" v-if="order.reviewTime" />
        <van-cell title="审核人" :value="order.reviewer" v-if="order.reviewer" />
        <van-cell title="审核意见" :value="order.reviewComment" v-if="order.reviewComment" />
      </van-cell-group>

      <!-- 处理信息 -->
      <van-cell-group title="处理信息" v-if="order.status === 'Handling' || order.status === 'Closed'">
        <van-cell title="处理时间" :value="order.handleTime" v-if="order.handleTime" />
        <van-cell title="处理人员" :value="order.handler" v-if="order.handler" />
        <van-cell title="处理说明" :value="order.handleDescription" v-if="order.handleDescription" />
      </van-cell-group>

      <!-- 处理图片 -->
      <van-cell-group title="处理图片" v-if="order.handleImages && order.handleImages.length > 0">
        <div class="image-list">
          <van-image
            v-for="(image, index) in order.handleImages"
            :key="index"
            :src="normalizeUrl(image)"
            width="80"
            height="80"
            fit="cover"
            @click="previewImage(order.handleImages, index)"
          />
        </div>
      </van-cell-group>

      <div class="refresh-section">
        <van-button type="primary" size="small" @click="refreshOrder">
          刷新进度
        </van-button>
      </div>
    </div>

    <div v-else class="loading-container">
      <van-loading size="24px">加载中...</van-loading>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showImagePreview, showToast } from 'vant'
import { useUserStore } from '@/stores'
import { complaintDetail } from '@/services/communityHome'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const order = ref<any | null>(null)

onMounted(() => {
  loadOrder()
})

const loadOrder = async () => {
  const orderId = route.params.id as string
  const token = userStore.user?.token || ''
  const res = await complaintDetail(token, orderId)
  if (!res || res.result === false) {
    showToast((res && res.msg) || '工单不存在')
    router.back()
    return
  }
  const data = res.data || res
  const c = data.complaint
  const approvals = data.approvals || []
  const handling = data.handling || []
  const latestApproval = approvals[0]
  const latestHandling = handling[0]
  order.value = {
    id: c?.Id || orderId,
    type: 'complaint',
    subtype: c?.Type || '',
    building: c?.Building || '',
    description: c?.Description || '',
    phone: c?.ContactPhone || '',
    images: (c?.Images || '').split(',').filter((x: string) => !!x),
    status: c?.Status || '',
    submitTime: c?.CreatedAt || '',
    ownerName: c?.OwnerUserId || '',
    reviewTime: latestApproval?.ReviewedAt || '',
    reviewer: latestApproval?.AdminUserId || '',
    reviewComment: latestApproval?.Reason || '',
    handleTime: latestHandling?.HandledAt || '',
    handler: latestHandling?.PropertyUserId || '',
    handleDescription: latestHandling?.ResultDescription || '',
    handleImages: latestHandling?.PhotoList || []
  }
}

const onBack = () => {
  router.back()
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

const getOrderTypeText = (type: string, subtype: string) => {
  const typeMap = {
    repair: '报修',
    complaint: '投诉'
  }
  return `${typeMap[type as keyof typeof typeMap]} - ${subtype}`
}

const previewImage = (images: string[], startPosition: number) => {
  showImagePreview({
    images,
    startPosition,
    closeable: true
  })
}

const normalizeUrl = (u: string) => {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('/')) return 'https://ncys.nnkcy.com' + u
  return u
}

const refreshOrder = () => {
  loadOrder()
  showToast('已刷新')
}
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.order-content {
  padding-bottom: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  margin-bottom: 10px;
}

.order-id {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.order-status {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 14px;
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

.description-content {
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  background: white;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
  background: white;
}

.refresh-section {
  padding: 20px;
  text-align: center;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.text-success {
  color: #28a745;
}

.text-danger {
  color: #dc3545;
}
</style>