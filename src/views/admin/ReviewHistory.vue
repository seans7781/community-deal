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
              <div class="order-status" :class="order.status === 'approved' ? 'text-success' : order.status === 'closed' ? 'text-success' : 'text-danger'">
                {{ order.status === 'approved' ? '审核通过' : order.status === 'closed' ? '已办结' : '已驳回' }}
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
import { useUserStore } from '@/stores'
import { adminHandledWorkorders, complaintDetail } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()

const searchValue = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const remote = ref<any[]>([])

const reviewedOrders = computed(() => {
  return remote.value
    .map((c: any) => {
      const s = String(c.Status || '').toLowerCase()
      const status = s === 'approved' ? 'approved' : s === 'closed' ? 'closed' : 'rejected'
      return {
        id: c.Id || c.id || '',
        type: String(c.RequestType || c.requestType || '').toUpperCase() === 'REPAIR' ? 'repair' : 'complaint',
        subtype: c.Type || '',
        building: c.Building || '',
        description: c.Description || '',
        reviewTime: c.ReviewedAt || c.ApprovedAt || c.UpdatedAt || c.CreatedAt || '',
        reviewer: c.Reviewer || '',
        reviewComment: c.Reason || '',
        status
      }
    })
    .sort((a: any, b: any) => new Date(b.reviewTime || '').getTime() - new Date(a.reviewTime || '').getTime())
})

const filteredOrders = computed(() => {
  if (!searchValue.value) return reviewedOrders.value
  const k = searchValue.value.toLowerCase()
  return reviewedOrders.value.filter((o: any) =>
    o.id.toLowerCase().includes(k) ||
    o.building.toLowerCase().includes(k)
  )
})

onMounted(() => { onRefresh() })

const onBack = () => { router.push('/admin/home') }
const onSearch = () => {}
const onClear = () => { searchValue.value = '' }

const onRefresh = async () => {
  refreshing.value = true
  const token = userStore.user?.token || ''
  const res = await adminHandledWorkorders(token)
  const data = (res && (res.data || res)) as any
  const list = Array.isArray(data) ? data : []
  const enriched = await Promise.all(list.map(async (c: any) => {
    const id = c.Id || c.id || ''
    try {
      const d = await complaintDetail(token, id)
      const payload = (d && (d.data || d)) as any
      const approvals = Array.isArray(payload?.approvals) ? payload.approvals : []
      const latest = approvals[0]
      const reviewedAt = latest?.ReviewedAt || c.ApprovedAt || c.UpdatedAt || c.CreatedAt || ''
      return { ...c, ReviewedAt: reviewedAt }
    } catch {
      return { ...c }
    }
  }))
  remote.value = enriched
  refreshing.value = false
  finished.value = true
}

const onLoad = () => {
  loading.value = false
  finished.value = true
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
