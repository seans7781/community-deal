<template>
  <div class="announcement-page">
    <van-nav-bar title="社区公告" left-text="返回" left-arrow @click-left="onBack" />

    <div class="announcement-list">
      <van-list>
        <div v-for="msg in approvedAnnouncements" :key="msg.id" class="announcement-item">
          <div class="item-content">{{ msg.content }}</div>
          <div class="item-meta">发布时间：{{ msg.submitTime }} · 发布者：{{ msg.senderName }}</div>
        </div>
        <div v-if="approvedAnnouncements.length === 0" class="empty-state">
          <van-empty description="暂无公告 " />
        </div>
      </van-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores'

const router = useRouter()
const chatStore = useChatStore()

const approvedAnnouncements = computed(() => {
  return chatStore.getApprovedMessages()
    .filter(m => m.senderRole === 'admin')
    .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
})

const onBack = () => router.back()
</script>

<style scoped>
.announcement-page { min-height: 100vh; background: #f5f5f5; }
.announcement-list { background: white; margin-top: 0; }
.announcement-item { padding: 16px; border-bottom: 1px solid #f0f0f0; }
.item-content { font-size: 14px; color: #333; line-height: 1.7; }
.item-meta { margin-top: 6px; font-size: 12px; color: #999; }
.empty-state { padding: 20px; }
</style>