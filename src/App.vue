<template>
  <div class="app-container">
    <!-- 页面内容 -->
    <div class="main-content">
      <router-view />
    </div>
    
    <!-- 全局底部TabBar -->
    <GlobalTabBar v-if="showTabBar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores'
import GlobalTabBar from '@/components/GlobalTabBar.vue'

const route = useRoute()
const userStore = useUserStore()

// 计算是否显示TabBar（登录页不显示）
const showTabBar = computed(() => {
  return route.path !== '/login' && route.path !== '/'
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 50px; /* 为TabBar留出空间 */
}
</style>