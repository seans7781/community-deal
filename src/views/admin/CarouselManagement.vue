<template>
  <div class="carousel-management">
    <van-nav-bar title="轮播图片管理" left-arrow @click-left="onClickLeft" />
    <div class="management-content">
      <van-uploader
        :after-read="onAfterRead"
        multiple
        result-type="dataUrl"
        accept="image/*"
      />

      <div class="image-list">
        <div v-for="image in images" :key="image.id" class="image-item">
          <van-image :src="image.src" width="100%" height="120" fit="cover" />
          <div class="image-actions">
            <van-button type="danger" size="small" @click="onRemoveImage(image.id)">删除</van-button>
          </div>
        </div>
        <div v-if="images.length === 0" class="empty-state">
          <van-empty description="暂无轮播图片" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { useUserStore } from '@/stores'
import { bannersPublic, uploadImage, bannerCreate, bannerDelete } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()
const images = ref<{ id: string; src: string }[]>([])

const refresh = async () => {
  const token = userStore.user?.token || ''
  const res = await bannersPublic(token)
  const data = (res && (res.data || res)) as any
  const items = Array.isArray(data) ? data : []
  images.value = items
    .filter((it: any) => it.Enabled !== false)
    .sort((a: any, b: any) => (a.SortOrder || 0) - (b.SortOrder || 0))
    .map((it: any) => ({ id: it.Id || it.id || String(Math.random()), src: it.ImageUrl || it.imageUrl || '' }))
}

onMounted(refresh)

const onAfterRead = async (file: any) => {
  const token = userStore.user?.token || ''
  const files = Array.isArray(file) ? file : [file]
  for (const f of files) {
    try {
      const up = await uploadImage('BANNER', f.file)
      const list = Array.isArray((up as any)?.data) ? (up as any).data : []
      const first = list[0] || {}
      const url = first.url || ''
      const title = first.filename || '轮播图'
      if (!url) {
        showFailToast('上传失败：未返回图片地址')
        continue
      }
      const created = await bannerCreate(token, { title, imageUrl: url, linkUrl: '', enabled: true, sortOrder: images.value.length })
      if (created && created.result !== false) {
        showSuccessToast('新增成功')
        await refresh()
      } else {
        showFailToast((created && created.msg) || '新增失败')
      }
    } catch (e) {
      showFailToast('上传或新增失败')
    }
  }
}

const onRemoveImage = async (id: string) => {
  const token = userStore.user?.token || ''
  try {
    const res = await bannerDelete(token, { id })
    if (res && res.result !== false) {
      showSuccessToast('删除成功')
      await refresh()
    } else {
      showFailToast((res && res.msg) || '删除失败')
    }
  } catch (e) {
    showFailToast('删除失败')
  }
}

const onClickLeft = () => {
  router.back()
}
</script>

<style scoped>
.carousel-management {
  min-height: 100vh;
  background: #f5f5f5;
}

.management-content {
  padding: 16px;
}

.image-list { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 16px; }
.image-item { background: #fff; border: 1px solid #ebedf0; border-radius: 8px; overflow: hidden; }
.image-actions { padding: 8px; display: flex; justify-content: flex-end; }
</style>