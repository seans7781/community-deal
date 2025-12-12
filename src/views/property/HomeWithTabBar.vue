<template>
  <div class="property-home">
      <van-nav-bar
        title="物业工单处理平台"
        left-text="退出"
        @click-left="onLogout"
      />

      <div class="property-home-content">
        <div class="announcement-bar">
          <van-notice-bar
            left-icon="volume-o"
            :text="announcementText || '暂无公告'"
            scrollable
          />
        </div>

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
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useWorkOrderStore, useChatStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
const workOrderStore = useWorkOrderStore()
const chatStore = useChatStore()

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

const announcementText = computed(() => {
  if (adminNotices.value.length === 0) return ''
  return adminNotices.value.map(n => n.content).join(' ｜ ')
})

const onLogout = () => {
  userStore.logout()
  router.push('/')
}

const goToHandleList = () => {
  router.push('/property/handle-list')
}

const goToHandleHistory = () => {
  router.push('/property/handle-history')
}
</script>

<style scoped>
.property-home {
  min-height: 100vh;
  background: #f5f5f5;
}

.property-home-content {
  height: calc(100vh - 50px);
  display: grid;
  grid-template-rows: 8% 32% 60%;
}

.announcement-bar {
  background: white;
  padding: 8px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid #ebedf0;
  min-height: 40px;
  position: relative;
  z-index: 1;
}

.announcement-bar .van-notice-bar {
  width: 100%;
  display: flex;
  align-items: center;
}

.stats-section {
  padding: 20px;
  background: white;
  margin-bottom: 10px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  color: white;
}

.pending-card {
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
}

.completed-card {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.function-section {
  background: white;
}

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