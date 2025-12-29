<template>
  <div class="suggestion-list-page">
    <van-nav-bar title="已处置建议列表" left-text="返回" left-arrow @click-left="onBack" />
    <div class="search-section">
      <van-search v-model="searchValue" placeholder="搜索标题" @search="onSearch" @clear="onClear" />
    </div>
    <div class="list-section">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <div v-for="item in filtered" :key="item.id" class="list-item" @click="goDetail(item.id)">
            <div class="item-header">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-status">已处置</div>
            </div>
            <div class="item-meta">
              <span class="label">审核时间：</span><span class="value">{{ item.reviewTime }}</span>
            </div>
            <div class="item-content">{{ item.content }}</div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
    <div v-if="filtered.length === 0 && !loading" class="empty-state">
      <van-empty description="暂无已处置建议" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { suggestAssignedProperty } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()

const searchValue = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const remote = ref<any[]>([])

const mapped = computed(() => remote.value
  .filter((it: any) => String(it.Status || '').toLowerCase() === 'resolved')
  .map((it: any) => ({
    id: it.Id || it.id || '',
    title: it.Title || it.title || '',
    content: it.Content || it.content || '',
    reviewTime: it.UpdatedAt || it.ApprovedAt || it.CreatedAt || ''
  }))
  .sort((a: any, b: any) => new Date(b.reviewTime || '').getTime() - new Date(a.reviewTime || '').getTime())
)

const filtered = computed(() => {
  if (!searchValue.value) return mapped.value
  const k = searchValue.value.toLowerCase()
  return mapped.value.filter((x: any) => (x.title || '').toLowerCase().includes(k))
})

const onBack = () => { router.push('/property/home') }
const onSearch = () => {}
const onClear = () => { searchValue.value = '' }

const refresh = async () => {
  const token = userStore.user?.token || ''
  const res = await suggestAssignedProperty(token)
  const data = (res && (res.data || res)) as any
  remote.value = Array.isArray(data) ? data : []
}

const onRefresh = async () => {
  refreshing.value = true
  await refresh()
  refreshing.value = false
  finished.value = true
}

const onLoad = () => { loading.value = false; finished.value = true }
const goDetail = (id: string) => { router.push(`/suggestion/detail/${id}`) }

onMounted(refresh)
</script>

<style scoped>
.suggestion-list-page { min-height: 100vh; background: #f5f5f5; }
.search-section { background: white; padding: 10px; }
.list-section { background: white; }
.list-item { padding: 15px; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.item-title { font-size: 16px; color: #333; font-weight: 500; }
.item-status { color: #43e97b; font-size: 14px; font-weight: 500; }
.item-meta { font-size: 12px; color: #999; margin-bottom: 6px; }
.item-content { font-size: 14px; color: #555; }
.empty-state { padding: 20px; }
</style>