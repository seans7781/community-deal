<template>
  <div class="review-list-page">
    <van-nav-bar
      title="待审核工单列表"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <div class="search-section">
      <van-search
        v-model="searchValue"
        placeholder="搜索工单编号、楼栋、业主电话"
        @search="onSearch"
        @clear="onClear"
      />
    </div>

    <div class="order-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-item"
            @click="goToReview(order.id)"
          >
            <div class="order-header">
              <div class="order-type">
                <van-icon :name="getOrderIcon(order.type)" />
                <span>{{ getOrderTypeText(order.type, order.subtype) }}</span>
              </div>
              <div class="order-status">待审核</div>
            </div>
            <div class="order-info">
              <div class="info-item">
                <span class="label">提交时间：</span>
                <span class="value">{{ order.submitTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">所在楼栋：</span>
                <span class="value">{{ order.building }}</span>
              </div>
              <div class="info-item">
                <span class="label">提交人：</span>
                <span class="value">{{ getOwnerName(order.ownerName) }}</span>
              </div>
            </div>
            <div class="order-action">
              <van-button type="primary" size="small">审核</van-button>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <div v-if="filteredOrders.length === 0 && !loading" class="empty-state">
      <van-empty description="暂无待审核工单" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkOrderStore } from '@/stores'
import type { WorkOrder } from '@/stores'

const router = useRouter()
const workOrderStore = useWorkOrderStore()

const searchValue = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const pendingOrders = computed(() => {
  return workOrderStore.getWorkOrdersByStatus('pending')
    .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
})

const filteredOrders = computed(() => {
  if (!searchValue.value) {
    return pendingOrders.value
  }
  
  const keyword = searchValue.value.toLowerCase()
  return pendingOrders.value.filter(order => 
    order.id.toLowerCase().includes(keyword) ||
    order.building.toLowerCase().includes(keyword) ||
    order.phone.includes(keyword)
  )
})

onMounted(() => {
  // 初始化数据
  onRefresh()
})

const onBack = () => {
  router.push('/admin/home')
}

const onSearch = () => {
  // 搜索功能已通过computed属性实现
}

const onClear = () => {
  searchValue.value = ''
}

const onRefresh = () => {
  refreshing.value = true
  // 模拟刷新数据
  setTimeout(() => {
    refreshing.value = false
    finished.value = false
  }, 1000)
}

const onLoad = () => {
  // 模拟加载更多数据
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

const goToReview = (orderId: string) => {
  router.push(`/admin/review/${orderId}`)
}

const getOrderIcon = (type: string) => {
  return type === 'repair' ? 'setting-o' : 'warning-o'
}

const getOrderTypeText = (type: string, subtype: string) => {
  const typeMap = {
    repair: '报修',
    complaint: '投诉'
  }
  return `${typeMap[type as keyof typeof typeMap]} - ${subtype}`
}

const getOwnerName = (ownerName: string) => {
  // 匿名化处理，只显示楼栋信息
  const buildingMatch = ownerName.match(/(\d+栋)/)
  return buildingMatch ? buildingMatch[1] + '业主' : '匿名业主'
}
</script>

<style scoped>
.review-list-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-section {
  background: white;
  padding: 10px;
}

.order-list {
  background: white;
}

.order-item {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.order-item:last-child {
  border-bottom: none;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-type {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.order-type .van-icon {
  margin-right: 8px;
  font-size: 18px;
}

.order-status {
  color: #999;
  font-size: 14px;
}

.order-info {
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  margin-bottom: 5px;
  font-size: 14px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #666;
  width: 80px;
  flex-shrink: 0;
}

.info-item .value {
  color: #333;
  flex: 1;
}

.order-action {
  text-align: right;
}

.empty-state {
  padding: 50px 0;
}
</style>