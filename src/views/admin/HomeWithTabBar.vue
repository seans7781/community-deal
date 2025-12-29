<template>
  <div class="admin-home">
      <van-nav-bar
        title="管理员后台"
      />

      <div class="admin-home-content">
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
              title="工单审核记录查询"
              is-link
              @click="goToReviewHistory"
            />
            <van-cell
              title="待审核建议列表"
              is-link
              @click="goToSuggestionReviewList"
            />
            <van-cell
              title="建议审核记录查询"
              is-link
              @click="goToSuggestionReviewHistory"
            />
            <van-cell
              title="公告管理"
              is-link
              @click="goToAnnouncementManagement"
            />
            <!-- <van-cell
              title="账号管理"
              is-link
              @click="goToAccountManage"
            /> -->
            <van-cell
              title="轮播图片管理"
              is-link
              @click="goToCarouselManagement"
              :value="bannerCount > 0 ? bannerCount + '张已启用' : ''"
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
 
import { useUserStore } from '@/stores'
import { announcementsAdmin, bannersPublic, adminWorkorderStats } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()

const pendingCount = ref(0)
const approvedCount = ref(0)
const completedCount = ref(0)
const bannerCount = ref(0)

const announcementItems = ref<string[]>([])

const announcementItemsToShow = computed(() => {
  return announcementItems.value.length > 0 ? announcementItems.value : ['暂无公告']
})

onMounted(() => {
  ;(async () => {
    const token = userStore.user?.token || ''
    const annsRes = await announcementsAdmin(token)
    const annsData = (annsRes && (annsRes.data || annsRes)) as any
    const annsList = Array.isArray(annsData) ? annsData : []
    announcementItems.value = annsList
      .filter((it: any) => it.Enabled !== false)
      .sort((a: any, b: any) => new Date(b.UpdatedAt || b.CreatedAt || 0).getTime() - new Date(a.UpdatedAt || a.CreatedAt || 0).getTime())
      .map((it: any) => it.Content || '')

    const statsRes = await adminWorkorderStats(token)
    const stats = (statsRes && (statsRes.data || statsRes)) as any
    const complaint = stats?.complaint || {}
    const repair = stats?.repair || {}
    pendingCount.value = (complaint?.pendingApproval || 0) + (repair?.pendingApproval || 0)
    approvedCount.value = (complaint?.approved || 0) + (repair?.approved || 0)
    completedCount.value = (complaint?.propertyProcessed || 0) + (repair?.propertyProcessed || 0)

    const bannersRes = await bannersPublic(token)
    const bannersData = (bannersRes && (bannersRes.data || bannersRes)) as any
    const bannersList = Array.isArray(bannersData) ? bannersData : []
    bannerCount.value = bannersList.filter((it: any) => it.Enabled !== false).length
  })()
})

const goToReviewList = () => {
  router.push('/admin/review-list')
}

const goToReviewHistory = () => {
  router.push('/admin/review-history')
}

// const goToAccountManage = () => {
//   showDialog({ message: '账号管理功能开发中...' })
// }

const goToCarouselManagement = () => {
  router.push('/admin/carousel-management')
}

const goToSuggestionReviewList = () => {
  router.push('/admin/suggestion-review-list')
}

const goToSuggestionReviewHistory = () => {
  router.push('/admin/suggestion-review-history')
}

const goToAnnouncementManagement = () => {
  router.push('/admin/announcement-management')
}

const goToAnnouncements = () => {
  router.push('/announcements')
}
</script>

<style scoped>
.admin-home {
  min-height: 100vh;
  background: #f5f5f5;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.admin-home::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.admin-home-content {
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

.stat-card { 
  text-align: center; 
  padding: 12px; 
  border-radius: 8px; 
  color: white; 
  width: 100%; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  height: 72px;
}

:deep(.van-grid-item__content) { padding: 8px; background: transparent; border: none; box-shadow: none; border-radius: 0; }
:deep(.van-grid-item__content.van-hairline)::after { display: none; }

.pending-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
}

.approved-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.completed-card {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-number { font-size: 24px; font-weight: bold; margin-bottom: 4px; }

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