<template>
  <div class="suggestion-page">
    <van-nav-bar
      title="提交建议"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <van-form @submit="onSubmit" class="suggestion-form">
      <van-field
        v-model="title"
        label="建议标题"
        placeholder="请输入建议标题"
        required
        :rules="[{ required: true, message: '请填写建议标题' }]"
      />

      <van-field
        v-model="content"
        type="textarea"
        rows="4"
        autosize
        label="建议内容"
        maxlength="200"
        placeholder="请详细描述建议内容，至少10字"
        show-word-limit
        required
        :rules="[{ required: true, message: '请填写建议内容' }]"
      />

      <van-field
        :model-value="targetRoleText"
        readonly
        label="建议对象"
      />

      <van-field
        v-model="contactPhone"
        label="联系电话"
        type="tel"
        placeholder="请输入联系电话"
        required
        :rules="[
          { required: true, message: '请填写联系电话' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
        ]"
      />

      <div class="submit-section">
        <van-button
          type="primary"
          size="large"
          native-type="submit"
          :disabled="!canSubmit"
        >
          提交建议
        </van-button>
      </div>
    </van-form>
  </div>
  </template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { useUserStore } from '@/stores'
import { suggestSubmit } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()

const title = ref('')
const content = ref('')
const contactPhone = ref(userStore.user?.phone || '')

const targetRole = computed<'owner' | 'property'>(() => {
  const role = userStore.user?.role
  return role === 'property' ? 'owner' : 'property'
})

const targetRoleText = computed(() => {
  return targetRole.value === 'owner' ? '业主' : '物业'
})

const canSubmit = computed(() => {
  return title.value.trim().length > 0 && content.value.trim().length >= 10 && /^1[3-9]\d{9}$/.test(contactPhone.value)
})

const onBack = () => { router.back() }

const onSubmit = async () => {
  const sender = userStore.user
  if (!sender) return
  const token = sender.token || ''
  const payload: { title: string; content: string; target: 'OWNER' | 'PROPERTY'; contactPhone: string } = { title: title.value.trim(), content: content.value.trim(), target: targetRole.value === 'owner' ? 'OWNER' : 'PROPERTY', contactPhone: contactPhone.value }
  const res = await suggestSubmit(token, payload)
  if (res && res.result === true) {
    showSuccessToast('建议已提交，等待管理员审核')
    setTimeout(() => { router.push('/profile') }, 1000)
  } else {
    showFailToast((res && res.msg) || '提交失败')
  }
}
</script>

<style scoped>
.suggestion-page { min-height: 100vh; background: #f5f5f5; }
.suggestion-form { padding: 20px; }
.submit-section { margin-top: 30px; }
</style>