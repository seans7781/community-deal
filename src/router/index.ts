import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import OwnerHome from '@/views/owner/HomeWithTabBar.vue'
import OwnerRepair from '@/views/owner/Repair.vue'
import OwnerComplaint from '@/views/owner/Complaint.vue'
import OwnerOrderDetail from '@/views/owner/OrderDetail.vue'
// 管理员端路由
import AdminHome from '@/views/admin/HomeWithTabBar.vue'
import AdminReviewList from '@/views/admin/ReviewList.vue'
import AdminReview from '@/views/admin/Review.vue'
import AdminReviewHistory from '@/views/admin/ReviewHistory.vue'
// 物业端路由
import PropertyHome from '@/views/property/HomeWithTabBar.vue'
import PropertyHandleList from '@/views/property/HandleList.vue'
import PropertyHandle from '@/views/property/Handle.vue'
import PropertyHandleHistory from '@/views/property/HandleHistory.vue'
import Profile from '@/views/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    // 业主端路由
    {
      path: '/owner/home',
      name: 'owner-home',
      component: OwnerHome
    },
    {
      path: '/owner/repair',
      name: 'owner-repair',
      component: OwnerRepair
    },
    {
      path: '/owner/complaint',
      name: 'owner-complaint',
      component: OwnerComplaint
    },
    {
      path: '/owner/order-detail/:id',
      name: 'owner-order-detail',
      component: OwnerOrderDetail
    },
    
    // 管理员端路由
    {
      path: '/admin/home',
      name: 'admin-home',
      component: AdminHome
    },
    {
      path: '/admin/review-list',
      name: 'admin-review-list',
      component: AdminReviewList
    },
    {
      path: '/admin/review/:id',
      name: 'admin-review',
      component: AdminReview
    },
    {
      path: '/admin/review-history',
      name: 'admin-review-history',
      component: AdminReviewHistory
    },
    // 物业端路由
    {
      path: '/property/home',
      name: 'property-home',
      component: PropertyHome
    },
    {
      path: '/property/handle-list',
      name: 'property-handle-list',
      component: PropertyHandleList
    },
    {
      path: '/property/handle/:id',
      name: 'property-handle',
      component: PropertyHandle
    },
    {
      path: '/property/handle-history',
      name: 'property-handle-history',
      component: PropertyHandleHistory
    },
    // 个人中心
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    }
  ]
})

export default router