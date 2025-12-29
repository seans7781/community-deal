<template>
  <div class="handle-list-page">
    <van-nav-bar
      title="待处理工单列表"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <div class="search-section">
      <van-search
        v-model="searchValue"
        placeholder="搜索工单编号、楼栋"
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
            @click="goToHandle(order.id)"
          >
            <div class="order-header">
              <div class="order-type">
                <van-icon :name="getOrderIcon(order.type)" />
                <span>{{ getOrderTypeText(order.type, order.subtype) }}</span>
              </div>
              <div class="order-status">待处理</div>
            </div>
            <div class="order-info">
              <div class="info-item">
                <span class="label">审核通过时间：</span>
                <span class="value">{{ order.reviewTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">所在楼栋：</span>
                <span class="value">{{ order.building }}</span>
              </div>
              <div class="info-item">
                <span class="label">问题描述：</span>
                <span class="value description">{{ order.description }}</span>
              </div>
            </div>
            <div class="order-action">
              <van-button type="primary" size="small">处理</van-button>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <div v-if="filteredOrders.length === 0 && !loading" class="empty-state">
      <van-empty description="暂无待处理工单" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { complaintAssigned } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()

const searchValue = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const remote = ref<any[]>([])
const approvedOrders = computed(() => {
  return remote.value
    .map((c: any) => ({
      id: c.Id || c.id || '',
      type: String(c.RequestType || c.requestType || '').toUpperCase() === 'REPAIR' ? 'repair' : 'complaint',
      subtype: c.Type || '',
      building: c.Building || '',
      description: c.Description || '',
      reviewTime: c.ReviewedAt || '',
    }))
    .sort((a: any, b: any) => new Date(b.reviewTime || '').getTime() - new Date(a.reviewTime || '').getTime())
})

const filteredOrders = computed(() => {
  if (!searchValue.value) {
    return approvedOrders.value
  }
  
  const keyword = searchValue.value.toLowerCase()
  return approvedOrders.value.filter(order => 
    order.id.toLowerCase().includes(keyword) ||
    order.building.toLowerCase().includes(keyword)
  )
})

onMounted(() => {
  // 初始化数据
  onRefresh()
})

const onBack = () => {
  router.push('/property/home')
}

const onSearch = () => {
  // 搜索功能已通过computed属性实现
}

const onClear = () => {
  searchValue.value = ''
}

const onRefresh = () => {
  refreshing.value = true
  ;(async () => {
    const token = userStore.user?.token || ''
    const res = await complaintAssigned(token)
    const data = (res && (res.data || res)) as any
    remote.value = Array.isArray(data) ? data : []
    refreshing.value = false
    finished.value = true
  })()
}

const onLoad = () => {
  // 模拟加载更多数据
  loading.value = false
  finished.value = true
}

const goToHandle = (orderId: string) => {
  router.push(`/property/handle/${orderId}`)
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
</script>

<style scoped>
.handle-list-page {
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
  color: #ff6b35;
  font-size: 14px;
  font-weight: 500;
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
  width: 100px;
  flex-shrink: 0;
}

.info-item .value {
  color: #333;
  flex: 1;
}

.info-item .value.description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.order-action {
  text-align: right;
}

.empty-state {
  padding: 50px 0;
}
</style>