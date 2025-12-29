<template>
  <div class="carousel-container">
    <van-swipe :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="image in images" :key="image.id">
        <img :src="image.src" class="carousel-image" />
      </van-swipe-item>
    </van-swipe>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores'
import { bannersPublic } from '@/services/communityHome'

const userStore = useUserStore()
const images = ref<{ id: string; src: string }[]>([])
onMounted(async () => {
  const token = userStore.user?.token || ''
  const res = await bannersPublic(token)
  const data = (res && (res.data || res)) as any
  const items = Array.isArray(data) ? data : []
  images.value = items
    .filter((it: any) => it.Enabled !== false)
    .sort((a: any, b: any) => (a.SortOrder || 0) - (b.SortOrder || 0))
    .map((it: any) => ({ id: it.Id || it.id || String(Math.random()), src: it.ImageUrl || it.imageUrl || '' }))
})
</script>

<style scoped>
.carousel-container {
  margin: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
</style>