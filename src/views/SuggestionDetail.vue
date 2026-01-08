<template>
  <div class="suggestion-detail-page">
    <van-nav-bar title="建议详情" left-text="返回" left-arrow @click-left="onBack" />
    <div v-if="detail" class="detail-content">
      <van-cell-group title="基本信息">
        <van-cell title="建议标题" :value="detail.title" />
        <van-cell title="状态" :value="statusText(detail.status)" />
        <van-cell title="提交时间" :value="detail.submitTime" />
      </van-cell-group>
      <van-cell-group title="建议内容">
        <div class="description-content">{{ detail.content }}</div>
      </van-cell-group>
      <van-cell-group v-if="approval" title="管理员审核">
        <van-cell title="审核时间" :value="approval.time" />
        <van-cell title="审核意见" :value="approval.reason" />
        
      </van-cell-group>
      <van-cell-group v-if="handling" title="物业处置">
        <van-cell title="处置时间" :value="handling.time" />
        <van-cell title="处置说明" :value="handling.note" />
       
      </van-cell-group>
    </div>
    <div v-else class="loading-container"><van-loading size="24px">加载中...</van-loading></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { suggestDetail } from '@/services/communityHome'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const detail = ref<any | null>(null)
const approval = ref<{ time: string; reason: string; userId: string } | null>(null)
const handling = ref<{ time: string; note: string; userId: string } | null>(null)

onMounted(async () => {
  const id = route.params.id as string
  const token = userStore.user?.token || ''
  const res = await suggestDetail(token, id)
  const data = (res && (res.data || res)) as any
  const s = (data && data.suggestion) || {}
  const ops: any[] = (data && data.opinions) || []
  detail.value = {
    id: s.Id || id,
    title: s.Title || '',
    content: s.Content || '',
    submitTime: s.CreatedAt || '',
    status: s.Status || ''
  }
  const approvalOp = ops.find((o: any) => (o.type || o.Type) === 'Approval') || null
  const handlingOp = ops.find((o: any) => (o.type || o.Type) === 'Handling') || null
  approval.value = approvalOp ? { time: approvalOp.time || approvalOp.Time || s.ApprovedAt || '', reason: approvalOp.reason || approvalOp.Reason || s.ApprovalReason || '', userId: approvalOp.userId || approvalOp.UserId || s.ApprovedByUserId || '' } : null
  handling.value = handlingOp ? { time: handlingOp.time || handlingOp.Time || s.ResolvedAt || '', note: handlingOp.note || handlingOp.Note || '', userId: handlingOp.userId || handlingOp.UserId || '' } : null
})

const onBack = () => { router.back() }

const statusText = (s: string) => {
  const map: Record<string, string> = { PendingApproval: '待审核', Approved: '审核通过', Rejected: '已驳回', Resolved: '已处置' }
  return map[s] || s
}
</script>

<style scoped>
.suggestion-detail-page { min-height: 100vh; background: #f5f5f5; }
.detail-content { padding-bottom: 20px; }
.description-content { padding: 16px; font-size: 14px; line-height: 1.6; color: #333; background: white; }
.loading-container { display: flex; justify-content: center; align-items: center; height: 200px; }
</style>
