<template>
  <div class="login-container">
    <div class="login-header">
      <div class="app-logo">🏠</div>
      <h1 class="app-title">小区家园通</h1>
    </div>

    <div class="login-form">
      <van-field
        v-model="username"
        label="账号"
        placeholder="请输入手机号或用户名"
        type="text"
        autocapitalize="off"
      />
      <van-field
        v-model="password"
        type="password"
        label="密码"
        placeholder="请输入密码"
      />
      <!-- <div class="forgot-password" @click="onForgotPassword">
        忘记密码？
      </div> -->

      <van-button
        type="primary"
        size="large"
        @click="onLogin"
        :disabled="!canLogin"
        class="login-btn"
      >
        登录
      </van-button>

      <van-button
        type="success"
        size="large"
        class="register-btn"
        @click="goToRegister"
      >
        注册业主账号
      </van-button>
      <van-button
        type="warning"
        size="large"
        class="home-btn"
        @click="goHome"
      >
        返回首页大厅
      </van-button>
    </div>

    <div class="login-intro">
我们为您和物业服务团队搭建了一座 24小时在线 的沟通桥梁。在这里，您的每一条声音都会被及时听见，每一件家园事都能得到高效跟进。
    </div>

    <div class="login-contact">
      <p>物业24小时在线电话：<a href="tel:4000000000">400-000-0000</a></p>
      <p>网页管理员QQ：123456789</p>
    </div>

    <div class="login-footer">
      <p>©2025 小区物业服务中心</p>
    </div>

    <!-- 错误提示 -->
  <van-toast v-model:show="showError" type="fail" :message="errorMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const showError = ref(false)
const errorMessage = ref('')

const canLogin = computed(() => {
  return username.value && password.value
})

const onLogin = async () => {
  const ret: any = await userStore.loginWithPassword(username.value, password.value)
  if (ret && ret.ok) {
    const role = userStore.user?.role
    if (role === 'admin') {
      router.push('/admin/home')
    } else if (role === 'property') {
      router.push('/property/home')
    } else {
      router.push('/owner/home')
    }
  } else {
    const msg = (ret && ret.msg) || '账号或密码错误'
    showToast(msg)
  }
}

const goHome = () => {
  router.push('/owner/home')
}

 

const goToRegister = () => {
  router.push('/register')
}

</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 20px;
}

.login-header {
  text-align: center;
  color: white;
}

.app-logo {
  font-size: 60px;
  margin-bottom: 10px;
}

.app-title {
  font-size: 28px;
  font-weight: 500;
  margin: 0;
}

.login-form {
  background: white;
  border-radius: 12px;
  padding: 30px 20px;
  margin: 20px 0;
}

.login-btn {
  margin-top: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.register-btn { margin-top: 12px; }
.home-btn { margin-top: 12px; }

.forgot-password {
  text-align: right;
  color: #666;
  font-size: 14px;
  margin-top: 10px;
  cursor: pointer;
}

.login-footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.login-intro {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.6;
}

.login-contact {
  text-align: center;
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  line-height: 1.6;
}
.login-contact a { color: inherit; text-decoration: underline; }
</style>
