<template>
  <div class="review-list-page">
    <van-nav-bar
      title="建议审核列表"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <div class="suggestion-list">
      <div v-for="item in pendingSuggestions" :key="item.id" class="suggestion-item">
        <div class="item-header">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-meta">来自：{{ roleText(item.senderRole) }} · {{ item.submitTime }}</div>
        </div>
        <div class="item-content">{{ item.content }}</div>
        <div class="item-actions">
          <van-button type="primary" size="small" @click="approve(item.id)">通过</van-button>
          <van-button type="danger" size="small" @click="reject(item.id)">驳回</van-button>
        </div>
      </div>
      <div v-if="pendingSuggestions.length === 0" class="empty-state">
        <van-empty description="暂无待审核建议" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { suggestPendingAdmin, suggestApprove } from '@/services/communityHome'
import { showSuccessToast, showFailToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const remote = ref<any[]>([])

const pendingSuggestions = computed(() => remote.value
  .map(it => ({
    id: it.Id || it.id || '',
    title: it.Title || it.title || '',
    content: it.Content || it.content || '',
    senderRole: ((it.SenderRole || '').toLowerCase() === 'owner' ? 'owner' : 'property') as 'owner' | 'property',
    submitTime: it.CreatedAt || it.submitTime || ''
  }))
  .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
)

const roleText = (r: 'owner' | 'property') => r === 'owner' ? '业主' : '物业'

const approve = async (id: string) => {
  const token = userStore.user?.token || ''
  const res = await suggestApprove(token, { suggestionId: id, approved: true })
  if (res && res.result === true) {
    showSuccessToast(res.msg || '审批完成')
    await refresh()
  } else {
    showFailToast((res && res.msg) || '审批失败')
  }
}

const reject = async (id: string) => {
  const token = userStore.user?.token || ''
  const res = await suggestApprove(token, { suggestionId: id, approved: false })
  if (res && res.result === true) {
    showSuccessToast(res.msg || '已驳回')
    await refresh()
  } else {
    showFailToast((res && res.msg) || '驳回失败')
  }
}

const onBack = () => { router.push('/admin/home') }

const refresh = async () => {
  const token = userStore.user?.token || ''
  const res = await suggestPendingAdmin(token)
  const data = (res && (res.data || res)) as any
  remote.value = Array.isArray(data) ? data : []
}

onMounted(refresh)
</script>

<style scoped>
.review-list-page { min-height: 100vh; background: #f5f5f5; }
.suggestion-list { background: white; }
.suggestion-item { padding: 15px; border-bottom: 1px solid #f0f0f0; }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.item-title { font-size: 16px; color: #333; font-weight: 500; }
.item-meta { font-size: 12px; color: #999; }
.item-content { font-size: 14px; color: #555; margin-bottom: 10px; }
.item-actions { display: flex; gap: 10px; }
.empty-state { padding: 20px; }
</style>