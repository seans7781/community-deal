import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import OwnerHome from '@/views/owner/HomeWithTabBar.vue'
import OwnerRepair from '@/views/owner/Repair.vue'
import OwnerComplaint from '@/views/owner/Complaint.vue'
import OwnerOrderDetail from '@/views/owner/OrderDetail.vue'
import OwnerMyOrders from '@/views/owner/MyOrders.vue'
// 管理员端路由
import AdminHome from '@/views/admin/HomeWithTabBar.vue'
import AdminReviewList from '@/views/admin/ReviewList.vue'
import AdminReview from '@/views/admin/Review.vue'
import AdminReviewHistory from '@/views/admin/ReviewHistory.vue'
import AdminCarouselManagement from '@/views/admin/CarouselManagement.vue'
import AdminAnnouncementManagement from '@/views/admin/AnnouncementManagement.vue'
import AdminSuggestionReviewList from '@/views/admin/SuggestionReviewList.vue'
import AdminSuggestionReviewHistory from '@/views/admin/SuggestionReviewHistory.vue'
// 物业端路由
import PropertyHome from '@/views/property/HomeWithTabBar.vue'
import PropertyHandleList from '@/views/property/HandleList.vue'
import PropertyHandle from '@/views/property/Handle.vue'
import PropertyHandleHistory from '@/views/property/HandleHistory.vue'
import PropertySuggestAssignedList from '@/views/property/SuggestionAssignedList.vue'
import PropertySuggestHandledList from '@/views/property/SuggestionHandledList.vue'
import PropertySuggestHandle from '@/views/property/SuggestionHandle.vue'
import Profile from '@/views/Profile.vue'
import RegisterOwner from '@/views/RegisterOwner.vue'
import AnnouncementList from '@/views/AnnouncementList.vue'
import SuggestionForm from '@/views/SuggestionForm.vue'
import SuggestionDetail from '@/views/SuggestionDetail.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
    {
      path: '/register',
      name: 'register',
      component: RegisterOwner
    },
    {
      path: '/announcements',
      name: 'announcements',
      component: AnnouncementList
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
    {
      path: '/owner/my-orders',
      name: 'owner-my-orders',
      component: OwnerMyOrders
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
    {
      path: '/admin/suggestion-review-list',
      name: 'admin-suggestion-review-list',
      component: AdminSuggestionReviewList
    },
    {
      path: '/admin/suggestion-review-history',
      name: 'admin-suggestion-review-history',
      component: AdminSuggestionReviewHistory
    },
    {
      path: '/admin/carousel-management',
      name: 'admin-carousel-management',
      component: AdminCarouselManagement
    },
    {
      path: '/admin/announcement-management',
      name: 'admin-announcement-management',
      component: AdminAnnouncementManagement
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
      path: '/property/suggest-assigned',
      name: 'property-suggest-assigned',
      component: PropertySuggestAssignedList
    },
    {
      path: '/property/suggest-handled',
      name: 'property-suggest-handled',
      component: PropertySuggestHandledList
    },
    {
      path: '/property/handle/:id',
      name: 'property-handle',
      component: PropertyHandle
    },
    {
      path: '/property/suggest-handle/:id',
      name: 'property-suggest-handle',
      component: PropertySuggestHandle
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
    },
    // 建议提交
    {
      path: '/suggestion/new',
      name: 'suggestion-new',
      component: SuggestionForm
    },
    {
      path: '/suggestion/detail/:id',
      name: 'suggestion-detail',
      component: SuggestionDetail
    }
  ]
})

export default router