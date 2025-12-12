<template>
  <div class="handle-history-page">
    <van-nav-bar
      title="已处理工单列表"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <div class="search-section">
      <van-search
        v-model="searchValue"
        placeholder="搜索工单编号、楼栋、处理人员"
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
            @click="goToDetail(order.id)"
          >
            <div class="order-header">
              <div class="order-type">
                <van-icon :name="getOrderIcon(order.type)" />
                <span>{{ getOrderTypeText(order.type, order.subtype) }}</span>
              </div>
              <div class="order-status">已处理</div>
            </div>
            <div class="order-info">
              <div class="info-item">
                <span class="label">处理时间：</span>
                <span class="value">{{ order.handleTime }}</span>
              </div>
              <div class="info-item" v-if="order.handler">
                <span class="label">处理人员：</span>
                <span class="value">{{ order.handler }}</span>
              </div>
              <div class="info-item" v-if="order.handleDescription">
                <span class="label">处理说明：</span>
                <span class="value description">{{ order.handleDescription }}</span>
              </div>
            </div>
            <div class="order-action">
              <van-button type="primary" size="small">查看详情</van-button>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <div v-if="filteredOrders.length === 0 && !loading" class="empty-state">
      <van-empty description="暂无已处理工单" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkOrderStore } from '@/stores'

const router = useRouter()
const workOrderStore = useWorkOrderStore()

const searchValue = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const completedOrders = computed(() => {
  return workOrderStore.getWorkOrdersByStatus('completed')
    .sort((a, b) => new Date(b.handleTime || '').getTime() - new Date(a.handleTime || '').getTime())
})

const filteredOrders = computed(() => {
  if (!searchValue.value) {
    return completedOrders.value
  }
  const keyword = searchValue.value.toLowerCase()
  return completedOrders.value.filter(order => 
    order.id.toLowerCase().includes(keyword) ||
    order.building.toLowerCase().includes(keyword) ||
    (order.handler || '').toLowerCase().includes(keyword)
  )
})

onMounted(() => {
  onRefresh()
})

const onBack = () => {
  router.push('/property/home')
}

const onSearch = () => {}
const onClear = () => { searchValue.value = '' }

const onRefresh = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    finished.value = false
  }, 800)
}

const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 800)
}

const goToDetail = (orderId: string) => {
  router.push(`/owner/order-detail/${orderId}`)
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
.handle-history-page {
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
  color: #43e97b;
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