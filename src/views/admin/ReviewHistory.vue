<template>
  <div class="review-history-page">
    <van-nav-bar
      title="审核记录查询"
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
            @click="goToReviewDetail(order.id)"
          >
            <div class="order-header">
              <div class="order-type">
                <van-icon :name="getOrderIcon(order.type)" />
                <span>{{ getOrderTypeText(order.type, order.subtype) }}</span>
              </div>
              <div class="order-status" :class="order.status === 'approved' ? 'text-success' : 'text-danger'">
                {{ order.status === 'approved' ? '审核通过' : '已驳回' }}
              </div>
            </div>
            <div class="order-info">
              <div class="info-item">
                <span class="label">审核时间：</span>
                <span class="value">{{ order.reviewTime }}</span>
              </div>
              <div class="info-item" v-if="order.reviewer">
                <span class="label">审核人：</span>
                <span class="value">{{ order.reviewer }}</span>
              </div>
              <div class="info-item" v-if="order.reviewComment">
                <span class="label">审核意见：</span>
                <span class="value description">{{ order.reviewComment }}</span>
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
      <van-empty description="暂无审核记录" />
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

const reviewedOrders = computed(() => {
  return workOrderStore.workOrders
    .filter(o => o.status === 'approved' || o.status === 'rejected')
    .sort((a, b) => new Date(b.reviewTime || '').getTime() - new Date(a.reviewTime || '').getTime())
})

const filteredOrders = computed(() => {
  if (!searchValue.value) return reviewedOrders.value
  const k = searchValue.value.toLowerCase()
  return reviewedOrders.value.filter(o =>
    o.id.toLowerCase().includes(k) ||
    o.building.toLowerCase().includes(k)
  )
})

onMounted(() => { onRefresh() })

const onBack = () => { router.push('/admin/home') }
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

const goToReviewDetail = (id: string) => {
  router.push(`/admin/review/${id}`)
}

const getOrderIcon = (type: string) => {
  return type === 'repair' ? 'setting-o' : 'warning-o'
}

const getOrderTypeText = (type: string, subtype: string) => {
  const typeMap = { repair: '报修', complaint: '投诉' }
  return `${typeMap[type as keyof typeof typeMap]} - ${subtype}`
}
</script>

<style scoped>
.review-history-page { min-height: 100vh; background: #f5f5f5; }
.search-section { background: white; padding: 10px; }
.order-list { background: white; }
.order-item { padding: 15px; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
.order-item:last-child { border-bottom: none; }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.order-type { display: flex; align-items: center; font-size: 16px; font-weight: 500; color: #333; }
.order-type .van-icon { margin-right: 8px; font-size: 18px; }
.order-status { font-size: 14px; font-weight: 500; }
.text-success { color: #07c160; }
.text-danger { color: #ee0a24; }
.order-info { margin-bottom: 10px; }
.info-item { display: flex; margin-bottom: 5px; font-size: 14px; }
.info-item:last-child { margin-bottom: 0; }
.info-item .label { color: #666; width: 90px; flex-shrink: 0; }
.info-item .value { color: #333; flex: 1; }
.info-item .value.description { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.order-action { text-align: right; }
.empty-state { padding: 50px 0; }
</style>