<template>
  <div class="global-tabbar">
    <van-tabbar v-model="activeTab" @change="onTabChange" active-color="#1989fa" inactive-color="#646566">
      <van-tabbar-item name="home" icon="home-o">首页大厅</van-tabbar-item>
      <van-tabbar-item name="profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('home')

// 根据当前路由确定激活的标签
const updateActiveTab = () => {
  const path = route.path
  if (path.includes('/profile')) {
    activeTab.value = 'profile'
  } else {
    activeTab.value = 'home'
  }
}

// 监听路由变化
watch(() => route.path, updateActiveTab, { immediate: true })

const onTabChange = (tabName: string) => {
  if (!userStore.user) {
    // 如果未登录，跳转到登录页
    router.push('/login')
    return
  }
  
  if (tabName === 'home') {
    // 跳转到对应角色的首页
    const role = userStore.user.role
    switch (role) {
      case 'owner':
        router.push('/owner/home')
        break
      case 'admin':
        router.push('/admin/home')
        break
      case 'property':
        router.push('/property/home')
        break
      default:
        router.push('/login')
    }
  } else if (tabName === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped>
.global-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-top: 1px solid #ebedf0;
}
</style>