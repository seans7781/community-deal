<template>
  <div class="suggestion-handle-page">
    <van-nav-bar title="建议处置" left-text="返回" left-arrow @click-left="onBack" />
    <div v-if="detail" class="handle-content">
      <van-cell-group title="建议基本信息">
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
      <van-form @submit="onSubmit" class="handle-form">
        <van-field v-model="resultDescription" rows="4" autosize label="处置说明" type="textarea" maxlength="500" placeholder="请填写处置说明" show-word-limit required :rules="[{ required: true, message: '请填写处置说明' }]" />
        <div class="submit-section">
          <van-button type="primary" size="large" native-type="submit" :disabled="!canSubmit" :loading="submitting">提交处置结果</van-button>
        </div>
      </van-form>
    </div>
    <div v-else class="loading-container"><van-loading size="24px">加载中...</van-loading></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { useUserStore } from '@/stores'
import { suggestDetail, suggestHandle } from '@/services/communityHome'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const detail = ref<any | null>(null)
const approval = ref<{ time: string; reason: string; userId: string } | null>(null)
const resultDescription = ref('')
const submitting = ref(false)

const loadDetail = async () => {
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
  approval.value = approvalOp ? { time: approvalOp.time || approvalOp.Time || s.ApprovedAt || '', reason: approvalOp.reason || approvalOp.Reason || s.ApprovalReason || '', userId: approvalOp.userId || approvalOp.UserId || s.ApprovedByUserId || '' } : null
}

onMounted(loadDetail)

const canSubmit = computed(() => resultDescription.value.trim().length >= 10 && detail.value && detail.value.status === 'Approved')
const onBack = () => { router.back() }

const onSubmit = async () => {
  if (!detail.value) return
  submitting.value = true
  const token = userStore.user?.token || ''
  if (!detail.value || detail.value.status !== 'Approved') {
    showFailToast('当前状态不可处置')
    submitting.value = false
    return
  }
  const res = await suggestHandle(token, { suggestId: detail.value.id, resultDescription: resultDescription.value })
  if (res && res.result === true) {
    showSuccessToast('处置完成')
    setTimeout(() => { router.back() }, 1000)
  } else {
    showFailToast((res && res.msg) || '提交失败')
  }
  submitting.value = false
}

const statusText = (s: string) => {
  const map: Record<string, string> = { PendingApproval: '待审核', Approved: '审核通过', Rejected: '已驳回', Resolved: '已处置' }
  return map[s] || s
}
</script>

<style scoped>
.suggestion-handle-page { min-height: 100vh; background: #f5f5f5; }
.handle-content { padding-bottom: 20px; }
.description-content { padding: 16px; font-size: 14px; line-height: 1.6; color: #333; background: white; }
.handle-form { margin-top: 10px; }
.submit-section { padding: 20px; }
.loading-container { display: flex; justify-content: center; align-items: center; height: 200px; }
</style>