<template>
  <div class="announcement-management">
    <van-nav-bar title="公告管理" left-arrow @click-left="onBack" />
    <div class="management-content">
      <div class="create-section">
        <van-field v-model="newContent" label="新增公告" placeholder="请输入公告内容" />
        <div class="create-actions">
          <van-switch v-model="newEnabled" size="20px" />
          <van-button type="primary" size="small" @click="onCreate">新增</van-button>
        </div>
      </div>
      <div class="search-section">
        <van-search v-model="searchValue" placeholder="搜索公告内容" @search="onSearch" @clear="onClear" />
      </div>
      <div class="list-section">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
            <div v-for="item in filtered" :key="item.id" class="list-item">
              <div class="item-header">
                <div class="item-time">{{ item.updatedAt || item.createdAt }}</div>
                <van-switch v-model="item.enabled" size="20px" @change="val => onToggle(item, val)" />
              </div>
              <div class="item-content">
                <van-field v-model="item.content" rows="2" autosize type="textarea" />
              </div>
            <div class="item-actions">
                <van-button type="primary" size="small" @click="onSave(item)">保存</van-button>
                <van-button :type="item.enabled ? 'danger' : 'success'" size="small" @click="onToggleButton(item)">{{ item.enabled ? '隐藏' : '启用' }}</van-button>
            </div>
            </div>
            <div v-if="filtered.length === 0 && !loading" class="empty-state">
              <van-empty description="暂无公告" />
            </div>
          </van-list>
        </van-pull-refresh>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { useUserStore } from '@/stores'
import { announcementsAdmin, announcementCreate, announcementUpdate } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()

const searchValue = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const newContent = ref('')
const newEnabled = ref(true)
const items = ref<any[]>([])

const filtered = computed(() => {
  const list = items.value
    .slice()
    .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime())
  if (!searchValue.value) return list
  const k = searchValue.value.toLowerCase()
  return list.filter((x: any) => (x.content || '').toLowerCase().includes(k))
})

const refresh = async () => {
  const token = userStore.user?.token || ''
  const res = await announcementsAdmin(token)
  const data = (res && (res.data || res)) as any
  const arr = Array.isArray(data) ? data : []
  items.value = arr.map((it: any) => ({
    id: it.Id || it.id || '',
    content: it.Content || it.content || '',
    enabled: it.Enabled !== false,
    createdAt: it.CreatedAt || '',
    updatedAt: it.UpdatedAt || ''
  }))
}

onMounted(refresh)

const onBack = () => { router.back() }
const onSearch = () => {}
const onClear = () => { searchValue.value = '' }

const onRefresh = async () => {
  refreshing.value = true
  await refresh()
  refreshing.value = false
  finished.value = true
}

const onLoad = () => { loading.value = false; finished.value = true }

const onCreate = async () => {
  const token = userStore.user?.token || ''
  if (!newContent.value.trim()) {
    showFailToast('请输入公告内容')
    return
  }
  const res = await announcementCreate(token, { content: newContent.value.trim(), enabled: newEnabled.value })
  if (res && res.result !== false) {
    showSuccessToast('新增成功')
    newContent.value = ''
    newEnabled.value = true
    await refresh()
  } else {
    showFailToast((res && res.msg) || '新增失败')
  }
}

const onSave = async (item: any) => {
  const token = userStore.user?.token || ''
  const res = await announcementUpdate(token, { id: item.id, content: item.content, enabled: item.enabled })
  if (res && res.result !== false) {
    showSuccessToast('保存成功')
    await refresh()
  } else {
    showFailToast((res && res.msg) || '保存失败')
  }
}

const onToggle = async (item: any, val?: boolean) => {
  const token = userStore.user?.token || ''
  const newEnabled = val !== undefined ? val : item.enabled
  const prevEnabled = !newEnabled
  const res = await announcementUpdate(token, { id: item.id, content: item.content, enabled: newEnabled })
  if (res && res.result !== false) {
    item.enabled = newEnabled
    showSuccessToast(newEnabled ? '已启用' : '已隐藏')
  } else {
    item.enabled = prevEnabled
    showFailToast((res && res.msg) || '操作失败')
  }
}

const onToggleButton = async (item: any) => {
  const next = !item.enabled
  item.enabled = next
  await onToggle(item, next)
}
</script>

<style scoped>
.announcement-management { min-height: 100vh; background: #f5f5f5; }
.management-content { padding: 16px; }
.create-section { background: white; padding: 12px; margin-bottom: 12px; }
.create-actions { display: flex; gap: 10px; align-items: center; justify-content: flex-end; margin-top: 8px; }
.search-section { background: white; padding: 10px; margin-bottom: 10px; }
.list-section { background: white; }
.list-item { padding: 12px; border-bottom: 1px solid #f0f0f0; }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.item-time { font-size: 12px; color: #999; }
.item-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
.empty-state { padding: 20px; }
</style>