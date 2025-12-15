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
import { useCarouselStore } from '@/stores/carouselStore';

const carouselStore = useCarouselStore();
const images = carouselStore.images;
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