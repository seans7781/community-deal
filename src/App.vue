<template>
  <div class="app-container">
    <!-- 页面内容：登录页不包裹 main-content -->
    <div v-if="!isLogin" class="main-content">
      <router-view />
    </div>
    <router-view v-else />

    <!-- 全局底部TabBar -->
    <GlobalTabBar v-if="showTabBar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GlobalTabBar from '@/components/GlobalTabBar.vue'

const route = useRoute()

const showTabBar = computed(() => {
  return !['/login', '/', '/register'].includes(route.path)
})

const isLogin = computed(() => route.path === '/login' || route.path === '/')
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 50px;
}
</style>
<style>
.van-nav-bar {
  position: sticky !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
}
</style>