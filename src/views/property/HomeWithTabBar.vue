<template>
  <div class="property-home">
      <van-nav-bar
        title="物业工单处理平台"
      />

      <div class="property-home-content">
        <div class="announcement-bar" @click="goToAnnouncements">
          <div class="announcement-content">
            <van-icon name="volume-o" class="ann-icon" />
            <div class="ann-swipe-wrap">
              <van-swipe vertical :autoplay="3000" :show-indicators="false" class="announcement-swipe">
                <van-swipe-item v-for="(item, idx) in announcementItemsToShow" :key="idx" class="announcement-item">
                  {{ item }}
                </van-swipe-item>
              </van-swipe>
            </div>
          </div>
        </div>

        <image-carousel />

        <div class="stats-section">
          <van-grid :column-num="2" :gutter="16">
            <van-grid-item>
              <div class="stat-card pending-card">
                <div class="stat-number">{{ pendingCount }}</div>
                <div class="stat-label">待处理工单</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="stat-card completed-card">
                <div class="stat-number">{{ completedCount }}</div>
                <div class="stat-label">已处理工单</div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>

        <div class="function-section">
          <van-cell-group>
            <van-cell
              title="待处理工单列表"
              :value="pendingCount > 0 ? pendingCount + '条待处理' : ''"
              is-link
              @click="goToHandleList"
            >
              <template #icon>
                <div v-if="pendingCount > 0" class="unread-dot orange"></div>
              </template>
            </van-cell>
            <van-cell
              title="处理记录查询"
              is-link
              @click="goToHandleHistory"
            />
          </van-cell-group>
        </div>
        <div class="suggestions-section">
          <div class="section-header">
            <h3>建议动态</h3>
          </div>
          <div class="suggestion-list">
            <div v-for="s in suggestionsApproved" :key="s.id" class="suggestion-card">
              <div class="suggestion-header">
                <div class="suggestion-title">{{ s.title }}</div>
                <div class="suggestion-time">{{ s.submitTime }}</div>
              </div>
              <div class="suggestion-content">{{ s.content }}</div>
              <div class="suggestion-meta">来自：业主</div>
            </div>
            <div v-if="suggestionsApproved.length === 0" class="empty-state">
              <van-empty description="暂无建议内容" />
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ImageCarousel from '@/components/ImageCarousel.vue'
import { useRouter } from 'vue-router'
import { useWorkOrderStore, useChatStore, useSuggestionStore } from '@/stores'

const router = useRouter()
const workOrderStore = useWorkOrderStore()
const chatStore = useChatStore()
const suggestionStore = useSuggestionStore()

const pendingCount = computed(() => {
  return workOrderStore.getWorkOrdersByStatus('approved').length
})

const completedCount = computed(() => {
  return workOrderStore.getWorkOrdersByStatus('completed').length
})

const adminNotices = computed(() => {
  return chatStore.getApprovedMessages()
    .filter(m => m.senderRole === 'admin')
    .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
})

const announcementItems = computed(() => {
  return adminNotices.value.map(n => n.content)
})

const announcementItemsToShow = computed(() => {
  return announcementItems.value.length > 0 ? announcementItems.value : ['暂无公告']
})

const suggestionsApproved = computed(() => {
  return suggestionStore.getApprovedSuggestionsForRole('property')
})

// 移除退出按钮

const goToHandleList = () => {
  router.push('/property/handle-list')
}

const goToHandleHistory = () => {
  router.push('/property/handle-history')
}

const goToAnnouncements = () => {
  router.push('/announcements')
}
</script>

<style scoped>
.property-home {
  min-height: 100vh;
  background: #f5f5f5;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.property-home::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.property-home-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-bar {
  background: white;
  padding: 8px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid #ebedf0;
  min-height: 40px;
  position: relative;
  z-index: 1;
  cursor: pointer;
}

.announcement-bar .announcement-content {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ann-icon {
  font-size: 16px;
  color: #ff6b35;
}

.ann-swipe-wrap {
  flex: 1;
  overflow: hidden;
}

.announcement-swipe { height: 20px; }

.announcement-item { line-height: 20px; color: #333; font-size: 12px; white-space: nowrap; }

.stats-section {
  padding: 20px;
  background: white;
  margin-bottom: 10px;
}

.stat-card { text-align: center; padding: 16px; border-radius: 8px; color: white; }

.pending-card {
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
}

.completed-card {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-number { font-size: 28px; font-weight: bold; margin-bottom: 6px; }

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.function-section {
  background: white;
}

.suggestions-section {
  background: white;
  padding: 20px;
}

.suggestion-list { display: flex; flex-direction: column; gap: 12px; max-height: clamp(160px, 30vh, 360px); overflow-y: auto; }
.suggestion-card { background: #fff; border: 1px solid #cfe8ff; border-radius: 12px; padding: 12px 14px; box-shadow: 0 4px 12px rgba(25, 137, 250, 0.16); }
.suggestion-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.suggestion-title { font-size: 14px; color: #333; }
.suggestion-time { font-size: 11px; color: #999; }
.suggestion-content { font-size: 13px; color: #555; line-height: 1.5; margin-top: 4px; }
.suggestion-meta { font-size: 12px; color: #666; margin-top: 6px; }

.unread-dot {
  width: 8px;
  height: 8px;
  background: #ff6b35;
  border-radius: 50%;
  margin-right: 8px;
}

.unread-dot.orange {
  background: #ff6b35;
}
</style>