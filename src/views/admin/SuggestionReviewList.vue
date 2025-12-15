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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSuggestionStore } from '@/stores'

const router = useRouter()
const suggestionStore = useSuggestionStore()

const pendingSuggestions = computed(() => suggestionStore.getPendingSuggestions())

const roleText = (r: 'owner' | 'property') => r === 'owner' ? '业主' : '物业'

const approve = (id: string) => {
  suggestionStore.updateSuggestion(id, {
    status: 'approved',
    reviewTime: new Date().toLocaleString('zh-CN'),
    reviewer: '管理员'
  })
}

const reject = (id: string) => {
  suggestionStore.updateSuggestion(id, {
    status: 'rejected',
    reviewTime: new Date().toLocaleString('zh-CN'),
    reviewer: '管理员'
  })
}

const onBack = () => { router.push('/admin/home') }
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