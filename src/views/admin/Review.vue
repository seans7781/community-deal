<template>
  <div class="review-page">
    <van-nav-bar
      title="工单审核"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <div v-if="order" class="review-content">
      <van-cell-group title="工单基本信息">
        <van-cell title="工单编号" :value="order.id" />
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

      <div class="review-section">
        <van-field
          v-model="reviewComment"
          rows="3"
          autosize
          label="审核意见"
          type="textarea"
          maxlength="200"
          placeholder="请输入审核意见（驳回时必须填写）"
          show-word-limit
        />
      </div>

      <div class="action-buttons" v-if="order && order.status === 'pending'">
        <van-button 
          type="success" 
          size="large" 
          @click="approveOrder"
          :loading="approving"
        >
          批准
        </van-button>
        <van-button 
          type="danger" 
          size="large" 
          @click="rejectOrder"
          :loading="rejecting"
        >
          驳回
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
import { showImagePreview, showSuccessToast, showFailToast } from 'vant'
import { useWorkOrderStore } from '@/stores'
import type { WorkOrder } from '@/stores'

const route = useRoute()
const router = useRouter()
const workOrderStore = useWorkOrderStore()

const order = ref<WorkOrder | null>(null)
const reviewComment = ref('')
const approving = ref(false)
const rejecting = ref(false)

onMounted(() => {
  loadOrder()
})

const loadOrder = () => {
  const orderId = route.params.id as string
  const foundOrder = workOrderStore.getWorkOrderById(orderId)
  if (foundOrder) {
    order.value = foundOrder
  } else {
    showFailToast('工单不存在')
    router.back()
  }
}

const onBack = () => {
  router.back()
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

const approveOrder = async () => {
  if (!order.value) return
  
  approving.value = true
  
  try {
    // 模拟审核通过
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    workOrderStore.updateWorkOrder(order.value.id, {
      status: 'approved',
      reviewTime: new Date().toLocaleString('zh-CN'),
      reviewer: '管理员',
      reviewComment: reviewComment.value || '审核通过'
    })
    
    showSuccessToast('审核通过，已同步至物业端')
    
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    showFailToast('审核失败，请重试')
  } finally {
    approving.value = false
  }
}

const rejectOrder = async () => {
  if (!order.value) return
  
  if (!reviewComment.value.trim()) {
    showFailToast('驳回时必须填写审核意见')
    return
  }
  
  rejecting.value = true
  
  try {
    // 模拟审核驳回
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    workOrderStore.updateWorkOrder(order.value.id, {
      status: 'rejected',
      reviewTime: new Date().toLocaleString('zh-CN'),
      reviewer: '管理员',
      reviewComment: reviewComment.value
    })
    
    showSuccessToast('驳回成功，已通知业主')
    
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    showFailToast('驳回失败，请重试')
  } finally {
    rejecting.value = false
  }
}
</script>

<style scoped>
.review-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.review-content {
  padding-bottom: 20px;
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

.review-section {
  background: white;
  margin: 10px 0;
}

.action-buttons {
  padding: 20px;
  display: flex;
  gap: 15px;
}

.action-buttons .van-button {
  flex: 1;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>