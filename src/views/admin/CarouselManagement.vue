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
 
import { useCarouselStore } from '@/stores/carouselStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const carouselStore = useCarouselStore();
const images = carouselStore.images;

const onAfterRead = (file: any) => {
  const files = Array.isArray(file) ? file : [file]
  files.forEach((f) => {
    const src = f.content || (f.file ? URL.createObjectURL(f.file) : '')
    if (src) carouselStore.addImage(src)
  })
};

const onRemoveImage = (id: string) => {
  carouselStore.removeImage(id);
};

const onClickLeft = () => {
  router.back();
};
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