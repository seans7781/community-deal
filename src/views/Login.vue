<template>
  <div class="login-container">
    <div class="login-header">
      <div class="app-logo">🏠</div>
      <h1 class="app-title">小区家园通</h1>
    </div>

    <div class="login-form">
      <van-field
        v-model="role"
        readonly
        clickable
        label="角色"
        placeholder="请选择角色"
        @click="showRolePicker = true"
      />
      <van-popup v-model:show="showRolePicker" position="bottom">
        <van-picker
          :columns="roleColumns"
          @confirm="onRoleConfirm"
          @cancel="showRolePicker = false"
        />
      </van-popup>

      <!-- 业主登录 - 口令输入 -->
      <div v-if="role === '业主'">
        <van-field
          v-model="password"
          type="digit"
          label="6位数字口令"
          placeholder="请输入6位数字口令"
          maxlength="6"
        />
      </div>

      <!-- 管理员/物业登录 - 账号密码 -->
      <div v-else-if="role && role !== '业主'">
        <van-field
          v-model="username"
          label="账号"
          placeholder="请输入手机号或用户名"
        />
        <van-field
          v-model="password"
          type="password"
          label="密码"
          placeholder="请输入密码"
        />
        <div class="forgot-password" @click="onForgotPassword">
          忘记密码？
        </div>
      </div>

      <van-button
        type="primary"
        size="large"
        @click="onLogin"
        :disabled="!canLogin"
        class="login-btn"
      >
        登录
      </van-button>
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

const role = ref('')
const username = ref('')
const password = ref('')
const showRolePicker = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const roleColumns = [{ text: '业主', value: '业主' }, { text: '管理员', value: '管理员' }, { text: '社区/物业', value: '社区/物业' }]

const canLogin = computed(() => {
  if (!role.value) return false
  if (role.value === '业主') {
    return password.value.length === 6
  } else {
    return username.value && password.value
  }
})

const onRoleConfirm = ({ selectedOptions }: any) => {
  role.value = selectedOptions[0].value
  showRolePicker.value = false
  // 清空输入
  username.value = ''
  password.value = ''
}

const onLogin = () => {
  // 模拟登录验证
  if (role.value === '业主') {
    // 验证6位数字口令
    if (password.value === '123456') {
      userStore.login({
        id: 'owner001',
        name: '张三',
        role: 'owner',
        phone: '13800138000'
      })
      router.push('/owner/home')
    } else {
      showToast('口令错误')
    }
  } else if (role.value === '管理员') {
    // 验证管理员账号密码
    if (username.value === 'admin' && password.value === 'admin123') {
      userStore.login({
        id: 'admin001',
        name: '李管理员',
        role: 'admin'
      })
      router.push('/admin/home')
    } else {
      showToast('账号密码错误')
    }
  } else if (role.value === '社区/物业') {
    // 验证物业账号密码
    if (username.value === 'property' && password.value === 'prop123') {
      userStore.login({
        id: 'property001',
        name: '王物业',
        role: 'property'
      })
      router.push('/property/home')
    } else {
      showToast('账号密码错误')
    }
  }
}

const onForgotPassword = () => {
  showToast('请联系系统管理员重置密码')
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
</style>