<template>
  <div class="complaint-page">
    <van-nav-bar
      title="我要投诉"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <van-form @submit="onSubmit" class="complaint-form">
      <van-field
        v-model="complaintType"
        readonly
        clickable
        label="投诉类型"
        placeholder="请选择投诉类型"
        required
        @click="showTypePicker = true"
      />
      <van-popup v-model:show="showTypePicker" position="bottom">
        <van-picker
          :columns="complaintTypeColumns"
          @confirm="onTypeConfirm"
          @cancel="showTypePicker = false"
        />
      </van-popup>

      <van-field
        v-model="building"
        label="所在楼栋"
        placeholder="如：3栋2单元501"
        required
        :rules="[{ required: true, message: '请填写所在楼栋' }]"
      />

      <van-field
        v-model="description"
        rows="4"
        autosize
        label="投诉描述"
        type="textarea"
        maxlength="200"
        placeholder="请详细描述投诉内容，至少10字"
        show-word-limit
        required
        :rules="[{ required: true, message: '请填写投诉描述' }]"
      />

      <div class="upload-section">
        <div class="upload-title">上传图片（最多3张）</div>
        <van-uploader
          v-model="fileList"
          multiple
          :max-count="3"
          :before-read="beforeRead"
          @oversize="onOversize"
        />
      </div>

      <van-field
        v-model="phone"
        type="tel"
        label="联系电话"
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
          提交投诉
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import type { UploaderBeforeRead } from 'vant/es/uploader/types'
import { useUserStore } from '@/stores'
import { complaintSubmit, uploadImage } from '@/services/communityHome'

const router = useRouter()
const userStore = useUserStore()

const complaintType = ref('')
const building = ref('')
const description = ref('')
const phone = ref(userStore.user?.phone || '')
const fileList = ref<any[]>([])
const showTypePicker = ref(false)

const complaintTypeColumns = [
  { text: '服务态度', value: '服务态度' },
  { text: '卫生问题', value: '卫生问题' },
  { text: '噪音扰民', value: '噪音扰民' },
  { text: '其他', value: '其他' }
]

const canSubmit = computed(() => {
  return complaintType.value && 
         building.value && 
         description.value && 
         description.value.length >= 10 &&
         phone.value && 
         /^1[3-9]\d{9}$/.test(phone.value)
})

const onTypeConfirm = ({ selectedOptions }: any) => {
  complaintType.value = selectedOptions[0].value
  showTypePicker.value = false
}

const beforeRead: UploaderBeforeRead = (file) => {
  const f = Array.isArray(file) ? (file[0] as any) : (file as any)
  const size = (f && (f.size as number)) || 0
  if (size > 5 * 1024 * 1024) {
    showFailToast('图片大小不能超过5MB')
    return false
  }
  return true
}

const onOversize = () => {
  showFailToast('图片大小不能超过5MB')
}

const onBack = () => {
  router.push('/owner/home')
}

const onSubmit = async () => {
  const token = userStore.user?.token || ''
  const uploaded: string[] = []
  for (const f of fileList.value) {
    const fileObj = f.file as File
    if (fileObj) {
      const r = await uploadImage('COMPLAINT', fileObj)
      const d: any = r && (r.data || r)
      const url = typeof d === 'string' ? d : (d?.url || (Array.isArray(d) ? d[0]?.url : '') || d?.ImageUrl || d?.imageUrl || '')
      if (url) uploaded.push(url)
    }
  }
  const payload = {
    requestType: 'COMPLAINT' as const,
    type: complaintType.value,
    building: building.value,
    description: description.value,
    images: uploaded,
    contactPhone: phone.value
  }
  const res = await complaintSubmit(token, payload)
  const ok = res && (res.result === true || res.complaintId)
  if (ok) {
    showSuccessToast('投诉成功，等待管理员审核')
    setTimeout(() => { router.push('/owner/home') }, 1200)
  } else {
    showFailToast((res && res.msg) || '提交失败')
  }
}
</script>

<style scoped>
.complaint-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.complaint-form {
  padding: 20px;
}

.upload-section {
  background: white;
  padding: 16px;
  margin-bottom: 10px;
}

.upload-title {
  font-size: 14px;
  color: #646566;
  margin-bottom: 12px;
}

.submit-section {
  margin-top: 30px;
}
</style>