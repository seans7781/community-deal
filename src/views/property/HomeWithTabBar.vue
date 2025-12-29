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
              title="待处置建议列表"
              :value="pendingSuggestCount > 0 ? pendingSuggestCount + '条待处置' : ''"
              is-link
              @click="goToSuggestAssigned"
            />
            <van-cell
              title="已处置建议列表"
              :value="handledSuggestCount > 0 ? handledSuggestCount + '条已处置' : ''"
              is-link
              @click="goToSuggestHandled"
            />
            <van-cell
              title="处理记录查询"
              is-link
              @click="goToHandleHistory"
            />
          </van-cell-group>
        </div>
        
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ImageCarousel from '@/components/ImageCarousel.vue'
import { useRouter } from 'vue-router'
import { useUserStore, useChatStore } from '@/stores'
import { adminWorkorderStats, suggestAssignedProperty } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()

const pendingCount = ref(0)
const completedCount = ref(0)
const pendingSuggestCount = ref(0)
const handledSuggestCount = ref(0)

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

onMounted(() => {
  ;(async () => {
    const token = userStore.user?.token || ''
    const statsRes = await adminWorkorderStats(token)
    const stats = (statsRes && (statsRes.data || statsRes)) as any
    const complaint = stats?.complaint || {}
    const repair = stats?.repair || {}
    pendingCount.value = (complaint?.propertyPending || 0) + (repair?.propertyPending || 0)
    completedCount.value = (complaint?.propertyProcessed || 0) + (repair?.propertyProcessed || 0)

    const sRes = await suggestAssignedProperty(token)
    const sData = (sRes && (sRes.data || sRes)) as any
    const sList = Array.isArray(sData) ? sData : []
    pendingSuggestCount.value = sList.filter((x: any) => String(x.Status || '').toLowerCase() === 'approved').length
    handledSuggestCount.value = sList.filter((x: any) => String(x.Status || '').toLowerCase() === 'resolved').length
  })()
})

// 移除退出按钮

const goToHandleList = () => {
  router.push('/property/handle-list')
}

const goToSuggestAssigned = () => {
  router.push('/property/suggest-assigned')
}

const goToSuggestHandled = () => {
  router.push('/property/suggest-handled')
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