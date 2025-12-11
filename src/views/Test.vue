<template>
  <div class="test-page">
    <van-nav-bar title="功能测试页面" />
    
    <div class="test-section">
      <h3>🎯 快速功能测试</h3>
      
      <van-cell-group>
        <van-cell title="测试登录页面" is-link @click="testLogin" />
        <van-cell title="测试业主首页" is-link @click="testOwnerHome" />
        <van-cell title="测试报修页面" is-link @click="testRepair" />
        <van-cell title="测试投诉页面" is-link @click="testComplaint" />
        <van-cell title="测试管理员首页" is-link @click="testAdminHome" />
        <van-cell title="测试物业首页" is-link @click="testPropertyHome" />
      </van-cell-group>
      
      <div class="login-info">
        <h4>🔑 测试账号</h4>
        <van-divider />
        <div class="account-item">
          <strong>业主登录：</strong>
          <p>角色：业主，口令：123456</p>
        </div>
        <van-divider />
        <div class="account-item">
          <strong>管理员登录：</strong>
          <p>账号：admin，密码：admin123</p>
        </div>
        <van-divider />
        <div class="account-item">
          <strong>物业登录：</strong>
          <p>账号：property，密码：prop123</p>
        </div>
      </div>
      
      <div class="quick-actions">
        <van-button type="primary" block @click="goToLogin">前往登录页面</van-button>
        <van-button type="success" block @click="simulateOwnerLogin">模拟业主登录</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()

const testLogin = () => {
  router.push('/')
}

const testOwnerHome = () => {
  router.push('/owner/home')
}

const testRepair = () => {
  router.push('/owner/repair')
}

const testComplaint = () => {
  router.push('/owner/complaint')
}

const testAdminHome = () => {
  router.push('/admin/home')
}

const testPropertyHome = () => {
  router.push('/property/home')
}

const goToLogin = () => {
  router.push('/')
}

const simulateOwnerLogin = () => {
  userStore.login({
    id: 'owner001',
    name: '张三',
    role: 'owner',
    phone: '13800138000'
  })
  router.push('/owner/home')
}
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.test-section {
  padding: 20px;
}

.test-section h3 {
  margin-bottom: 20px;
  color: #333;
}

.login-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.login-info h4 {
  margin-bottom: 15px;
  color: #333;
}

.account-item {
  margin: 15px 0;
}

.account-item strong {
  color: #667eea;
  display: block;
  margin-bottom: 5px;
}

.account-item p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
</style>