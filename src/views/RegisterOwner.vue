<template>
  <div class="register-page">
    <van-nav-bar title="注册业主账号" left-text="返回" left-arrow @click-left="onBack" />

    <div class="intro-section">
      <h3>网站功能介绍</h3>
      <p>本平台为业主与物业提供便捷的沟通通道，支持报修、投诉、公告查看、意见建议提交与审核等功能，提高响应效率，优化社区服务体验。</p>
      <van-divider />
      <h3>业主信息保密告知</h3>
      <p>您提交的姓名、手机号、楼栋与房号仅用于社区服务与工单沟通，不会对外泄露或用于无关用途。平台对信息进行严格保护与最小化使用。</p>
      <van-divider />
      <h3>使用规则</h3>
      <p>请文明表达诉求，不发布违法违规、攻击性或虚假内容。工单内容需真实准确，以便物业快速处理；如遇紧急情况请直接拨打物业热线。</p>
    </div>

    <div class="form-section">
      <van-form @submit="onSubmit">
        <van-field v-model="building" label="楼栋" placeholder="请输入楼栋" />
        <van-field v-model="room" label="房号" placeholder="请输入房号" />
        <van-field v-model="phone" label="手机号" type="tel" placeholder="请输入手机号" />
        <van-field v-model="name" label="姓名" placeholder="请输入姓名" />
        <van-field v-model="password" label="密码" type="password" placeholder="请输入密码" />
        <van-field v-model="passwordConfirm" label="确认密码" type="password" placeholder="请再次输入密码" />
        <div style="margin: 16px;">
          <van-button round block type="success" native-type="submit" :disabled="!canSubmit">注册并进入</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()

const building = ref('')
const room = ref('')
const phone = ref('')
const name = ref('')
const password = ref('')
const passwordConfirm = ref('')

const canSubmit = computed(() => {
  return (
    building.value &&
    room.value &&
    phone.value &&
    name.value &&
    phone.value.length >= 7 &&
    password.value &&
    passwordConfirm.value &&
    password.value === passwordConfirm.value &&
    password.value.length >= 6
  )
})

const onSubmit = async () => {
  if (!canSubmit.value) {
    showToast('请填写完整且一致的信息')
    return
  }
  const created = await userStore.registerOwner({
    name: name.value,
    phone: phone.value,
    building: building.value,
    room: room.value,
    password: password.value
  })
  const ok = created && (created.result === true)
  if (!ok) {
    const msg = (created && created.msg) || '注册失败'
    showToast(msg)
    return
  }
  const logged = await userStore.loginWithPassword(phone.value, password.value)
  if (logged) {
    router.push('/owner/home')
  } else {
    showToast('注册成功，请重新登录')
  }
}

const onBack = () => { router.back() }
</script>

<style scoped>
.register-page { min-height: 100vh; background: #f5f5f5; }
.intro-section { background: white; padding: 16px; }
.intro-section h3 { margin: 0 0 8px; color: #333; }
.intro-section p { margin: 0 0 12px; color: #555; line-height: 1.7; font-size: 14px; }
.form-section { background: white; margin-top: 10px; }
</style>