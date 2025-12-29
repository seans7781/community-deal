<template>
  <div class="admin-home">
    <van-nav-bar
      title="管理员后台"
      left-text="退出"
      @click-left="onLogout"
    />

    <div class="stats-section">
      <van-grid :column-num="3" :gutter="16">
        <van-grid-item>
          <div class="stat-card pending-card">
            <div class="stat-number">{{ pendingCount }}</div>
            <div class="stat-label">待审核工单</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-card approved-card">
            <div class="stat-number">{{ approvedCount }}</div>
            <div class="stat-label">已审核工单</div>
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
          title="待审核工单列表"
          :value="pendingCount > 0 ? pendingCount + '条待审核' : ''"
          is-link
          @click="goToReviewList"
        >
          <template #icon>
            <div v-if="pendingCount > 0" class="unread-dot"></div>
          </template>
        </van-cell>
        <van-cell
          title="审核记录查询"
          is-link
          @click="goToReviewHistory"
        />
        <!-- <van-cell
          title="账号管理"
          is-link
          @click="goToAccountManage"
        />
      </van-cell-group> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog } from 'vant'
import { useUserStore, useWorkOrderStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
const workOrderStore = useWorkOrderStore()

const pendingCount = computed(() => {
  return workOrderStore.getWorkOrdersByStatus('pending').length
})

const approvedCount = computed(() => {
  return workOrderStore.getWorkOrdersByStatus('approved').length
})

const completedCount = computed(() => {
  return workOrderStore.getWorkOrdersByStatus('completed').length
})

const onLogout = () => {
  userStore.logout()
  router.push('/')
}

const goToReviewList = () => {
  router.push('/admin/review-list')
}

const goToReviewHistory = () => {
  showDialog({ message: '审核记录查询功能开发中...' })
}

// const goToAccountManage = () => {
//   showDialog({ message: '账号管理功能开发中...' })
// }
</script>

<style scoped>
.admin-home {
  min-height: 100vh;
  background: #f5f5f5;
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
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
}

.approved-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
  background: #ee0a24;
  border-radius: 50%;
  margin-right: 8px;
}
</style>