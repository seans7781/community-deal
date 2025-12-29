<template>
  <div class="my-orders-page">
    <van-nav-bar title="我的工单" left-text="返回" left-arrow @click-left="onBack" />
    <van-tabs v-model:active="active">
      <van-tab title="投诉" name="complaint">
        <div class="order-list">
          <div v-for="o in complaints" :key="o.id" class="order-item" @click="goDetail(o.id)">
            <div class="order-info">
              <div class="order-type">投诉 - {{ o.subtype }}</div>
              <div class="order-time">{{ o.submitTime }}</div>
            </div>
            <div class="order-status" :class="statusClass(o.status)">{{ statusText(o.status) }}</div>
          </div>
          <div v-if="complaints.length === 0" class="empty-orders">暂无投诉</div>
        </div>
      </van-tab>
      <van-tab title="报修" name="repair">
        <div class="order-list">
          <div v-for="o in repairs" :key="o.id" class="order-item" @click="goDetail(o.id)">
            <div class="order-info">
              <div class="order-type">报修 - {{ o.subtype }}</div>
              <div class="order-time">{{ o.submitTime }}</div>
            </div>
            <div class="order-status" :class="statusClass(o.status)">{{ statusText(o.status) }}</div>
          </div>
          <div v-if="repairs.length === 0" class="empty-orders">暂无报修</div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { complaintMy } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()
const active = ref('complaint')
const rc = ref<any[]>([])
const rr = ref<any[]>([])

onMounted(async () => {
  const token = userStore.user?.token || ''
  const [compl, rep] = await Promise.all([
    complaintMy(token, 'COMPLAINT'),
    complaintMy(token, 'REPAIR')
  ])
  rc.value = Array.isArray((compl && (compl.data || compl))) ? (compl && (compl.data || compl)) : []
  rr.value = Array.isArray((rep && (rep.data || rep))) ? (rep && (rep.data || rep)) : []
})

const mapItems = (arr: any[]) => arr.map(c => ({
  id: c.Id || c.id || '',
  subtype: c.Type || c.SubType || '',
  submitTime: c.CreatedAt || c.SubmitTime || '',
  status: c.Status || ''
})).sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())

const complaints = computed(() => mapItems(rc.value))
const repairs = computed(() => mapItems(rr.value))

const statusText = (s: string) => {
  const map: Record<string, string> = { PendingApproval: '待审核', Approved: '审核通过', Rejected: '已驳回', Handling: '处理中', Closed: '已结案' }
  return map[s] || s
}
const statusClass = (s: string) => {
  const map: Record<string, string> = { PendingApproval: 'status-pending', Approved: 'status-approved', Rejected: 'status-rejected', Handling: 'status-processing', Closed: 'status-completed' }
  return map[s] || 'status-pending'
}
const onBack = () => { router.back() }
const goDetail = (id: string) => { router.push(`/owner/order-detail/${id}`) }
</script>

<style scoped>
.my-orders-page { min-height: 100vh; background: #f5f5f5; }
.order-list { background: white; }
.order-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #f0f0f0; }
.order-info { flex: 1; }
.order-type { font-size: 16px; color: #333; margin-bottom: 5px; }
.order-time { font-size: 14px; color: #999; }
.order-status { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.empty-orders { text-align: center; padding: 40px; color: #999; font-size: 14px; }
.status-pending { background: #fff3cd; color: #856404; }
.status-approved { background: #d1ecf1; color: #0c5460; }
.status-rejected { background: #f8d7da; color: #721c24; }
.status-processing { background: #cce5ff; color: #004085; }
.status-completed { background: #d4edda; color: #155724; }
</style>