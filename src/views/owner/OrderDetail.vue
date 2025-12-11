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
            :src="image"
            width="80"
            height="80"
            fit="cover"
            @click="previewImage(order.images, index)"
          />
        </div>
      </van-cell-group>

      <!-- 审核信息 -->
      <van-cell-group title="审核信息" v-if="order.status !== 'pending'">
        <van-cell 
          title="审核结果" 
          :value="order.status === 'approved' ? '审核通过' : '审核驳回'"
          :class="order.status === 'approved' ? 'text-success' : 'text-danger'"
        />
        <van-cell title="审核时间" :value="order.reviewTime" v-if="order.reviewTime" />
        <van-cell title="审核人" :value="order.reviewer" v-if="order.reviewer" />
        <van-cell title="审核意见" :value="order.reviewComment" v-if="order.reviewComment" />
      </van-cell-group>

      <!-- 处理信息 -->
      <van-cell-group title="处理信息" v-if="order.status === 'processing' || order.status === 'completed'">
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
            :src="image"
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
import { useWorkOrderStore } from '@/stores'
import type { WorkOrder } from '@/stores'

const route = useRoute()
const router = useRouter()
const workOrderStore = useWorkOrderStore()

const order = ref<WorkOrder | null>(null)

onMounted(() => {
  loadOrder()
})

const loadOrder = () => {
  const orderId = route.params.id as string
  const foundOrder = workOrderStore.getWorkOrderById(orderId)
  if (foundOrder) {
    order.value = foundOrder
  } else {
    showToast('工单不存在')
    router.back()
  }
}

const onBack = () => {
  router.back()
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