<template>
  <div class="review-history-page">
    <van-nav-bar
      title="建议审核记录查询"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <div class="suggestion-list">
      <div v-for="item in reviewedSuggestions" :key="item.id" class="suggestion-item">
        <div class="item-header">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-meta">提交：{{ item.submitTime }} · 目标：{{ roleText(item.targetRole) }}</div>
        </div>
        <div class="item-content">{{ item.content }}</div>
        <div class="item-review">
          <div class="info-row"><span class="label">审核时间：</span><span class="value">{{ item.reviewTime }}</span></div>
          <div class="info-row" v-if="item.reviewer"><span class="label">审核人：</span><span class="value">{{ item.reviewer }}</span></div>
          <div class="info-row" v-if="item.reviewComment"><span class="label">审核意见：</span><span class="value description">{{ item.reviewComment }}</span></div>
        </div>
        <div class="item-actions">
          <span class="status-tag" :class="item.status === 'approved' ? 'tag-approved' : 'tag-rejected'">
            {{ item.status === 'approved' ? '审核通过' : '已驳回' }}
          </span>
        </div>
      </div>
      <div v-if="reviewedSuggestions.length === 0" class="empty-state">
        <van-empty description="暂无建议审核记录" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { adminHandledSuggestions } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()
const remote = ref<any[]>([])

const reviewedSuggestions = computed(() => {
  return remote.value
    .filter((it: any) => it.Status === 'Approved' || it.Status === 'Rejected')
    .map((it: any) => ({
      id: it.Id || it.id || '',
      title: it.Title || it.title || '',
      content: it.Content || it.content || '',
      submitTime: it.CreatedAt || '',
      targetRole: ((it.Target || '').toLowerCase() === 'property' ? 'property' : 'owner') as 'owner' | 'property',
      reviewTime: it.ApprovedAt || it.UpdatedAt || '',
      reviewer: it.ApprovedByUserId || '',
      reviewComment: it.ApprovalReason || '',
      status: (it.Status === 'Approved' ? 'approved' : 'rejected')
    }))
    .sort((a: any, b: any) => new Date(b.reviewTime || '').getTime() - new Date(a.reviewTime || '').getTime())
})

const roleText = (r: 'owner' | 'property') => r === 'owner' ? '业主' : '物业'

const onBack = () => { router.push('/admin/home') }

const refresh = async () => {
  const token = userStore.user?.token || ''
  const res = await adminHandledSuggestions(token)
  const data = (res && (res.data || res)) as any
  remote.value = Array.isArray(data) ? data : []
}

onMounted(refresh)
</script>

<style scoped>
.review-history-page { min-height: 100vh; background: #f5f5f5; }
.suggestion-list { background: white; }
.suggestion-item { padding: 15px; border-bottom: 1px solid #f0f0f0; }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.item-title { font-size: 16px; color: #333; font-weight: 500; }
.item-meta { font-size: 12px; color: #999; }
.item-content { font-size: 14px; color: #555; margin-bottom: 10px; }
.item-review { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.info-row { display: flex; font-size: 14px; }
.label { color: #666; width: 80px; flex-shrink: 0; }
.value { color: #333; flex: 1; }
.description { color: #555; }
.item-actions { display: flex; justify-content: flex-end; }
.status-tag { font-size: 12px; padding: 3px 8px; border-radius: 12px; }
.tag-approved { background: #d1ecf1; color: #0c5460; }
.tag-rejected { background: #f8d7da; color: #721c24; }
.empty-state { padding: 20px; }
</style>