<template>
  <div class="handle-page">
    <van-nav-bar
      title="工单处理"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <div v-if="order" class="handle-content">
      <van-cell-group title="工单基本信息">
        <van-cell title="工单编号" :value="order.id" />
        <van-cell title="工单类型" :value="getOrderTypeText(order.type, order.subtype)" />
        <van-cell title="提交时间" :value="order.submitTime" />
        <van-cell title="所在楼栋" :value="order.building" />
      </van-cell-group>

      <van-cell-group title="问题描述">
        <div class="description-content">
          {{ order.description }}
        </div>
      </van-cell-group>

      <van-cell-group title="相关图片" v-if="order.images && order.images.length > 0">
        <div class="image-list">
          <van-image
            v-for="(image, index) in order.images"
            :key="index"
            :src="image"
            width="80"
            height="80"
            fit="cover"
            @click="previewImage(order.images, index)"
          />
        </div>
      </van-cell-group>

      <van-form @submit="onSubmit" class="handle-form">
        <van-field
          v-model="handleDescription"
          rows="4"
          autosize
          label="处理说明"
          type="textarea"
          maxlength="500"
          placeholder="请详细描述处理过程及结果（必填）"
          show-word-limit
          required
          :rules="[{ required: true, message: '请填写处理说明' }]"
        />

        <div class="upload-section">
          <div class="upload-title">上传处理图片（最多3张）</div>
          <van-uploader
            v-model="fileList"
            multiple
            :max-count="3"
            :before-read="beforeRead"
            @oversize="onOversize"
          />
        </div>

        <van-field
          v-model="handlerName"
          label="处理人员"
          placeholder="请输入处理人员姓名"
          required
          :rules="[{ required: true, message: '请填写处理人员姓名' }]"
        />

        <div class="submit-section">
          <van-button
            type="primary"
            size="large"
            native-type="submit"
            :disabled="!canSubmit"
            :loading="submitting"
          >
            提交处理结果
          </van-button>
        </div>
      </van-form>
    </div>

    <div v-else class="loading-container">
      <van-loading size="24px">加载中...</van-loading>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showImagePreview, showSuccessToast, showFailToast } from 'vant'
import type { UploaderBeforeRead } from 'vant/es/uploader/types'
import { useUserStore } from '@/stores'
import { complaintHandle, uploadImage, complaintDetail } from '@/services/communityHome'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const order = ref<any | null>(null)
const handleDescription = ref('')
const handlerName = ref('')
const fileList = ref<any[]>([])
const submitting = ref(false)

onMounted(() => { loadOrder() })

const loadOrder = async () => {
  const orderId = route.params.id as string
  const token = userStore.user?.token || ''
  const res = await complaintDetail(token, orderId)
  if (!res || res.result === false) {
    showFailToast((res && res.msg) || '工单不存在')
    router.back()
    return
  }
  const data = res.data || res
  const c = data.complaint
  order.value = {
    id: c?.Id || orderId,
    type: String(c?.RequestType || '').toUpperCase() === 'REPAIR' ? 'repair' : 'complaint',
    subtype: c?.Type || '',
    building: c?.Building || '',
    description: c?.Description || '',
    images: (c?.Images || '').split(',').filter((x: string) => !!x),
    status: c?.Status || '',
    submitTime: c?.CreatedAt || ''
  }
}

const canSubmit = computed(() => {
  return handleDescription.value && 
         handlerName.value && 
         handleDescription.value.length >= 10
})

const onBack = () => {
  router.back()
}

const getOrderTypeText = (type: string, subtype: string) => {
  const typeMap = {
    repair: '报修',
    complaint: '投诉'
  }
  return `${typeMap[type as keyof typeof typeMap]} - ${subtype}`
}

const previewImage = (images: string[], startPosition: number) => {
  showImagePreview({
    images,
    startPosition,
    closeable: true
  })
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

const onSubmit = async () => {
  if (!order.value) return
  
  submitting.value = true
  
  try {
    const token = userStore.user?.token || ''
    const uploaded: string[] = []
    for (const f of fileList.value) {
      const fileObj = f.file as File
      if (fileObj) {
        const r = await uploadImage('HANDLING', fileObj)
        const list = Array.isArray((r as any)?.data) ? (r as any).data : []
        const url = list[0]?.url || ''
        if (url) uploaded.push(url)
      }
    }
    const res = await complaintHandle(token, { complaintId: order.value.id, resultDescription: handleDescription.value, photos: uploaded })
    if (res && res.result === true) {
      showSuccessToast('处理完成，已同步至业主端')
      setTimeout(() => { router.back() }, 1200)
    } else {
      showFailToast((res && res.msg) || '提交失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.handle-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.handle-content {
  padding-bottom: 20px;
}

.description-content {
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  background: white;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
  background: white;
}

.handle-form {
  margin-top: 10px;
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
  padding: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>