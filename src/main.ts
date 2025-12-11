import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 引入Vant组件库
import 'vant/lib/index.css'

// 导入常用Vant组件
import {
  NavBar,
  Field,
  Button,
  Cell,
  CellGroup,
  Form,
  Picker,
  Popup,
  Toast,
  Grid,
  GridItem,
  Search,
  List,
  PullRefresh,
  Image as VanImage,
  Empty,
  Dialog,
  Uploader,
  Divider,
  Icon,
  NoticeBar,
  Tabbar,
  TabbarItem,
  Loading
} from 'vant'

// 导入store并添加示例数据
import { useWorkOrderStore } from './stores'

const app = createApp(App)
const pinia = createPinia()

// 注册Vant组件
app.use(NavBar)
app.use(Field)
app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(Form)
app.use(Picker)
app.use(Popup)
app.use(Toast)
app.use(Grid)
app.use(GridItem)
app.use(Search)
app.use(List)
app.use(PullRefresh)
app.use(VanImage)
app.use(Empty)
app.use(Dialog)
app.use(Uploader)
app.use(Divider)
app.use(Icon)
app.use(NoticeBar)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Loading)

app.use(pinia)
app.use(router)

// 添加示例数据
const workOrderStore = useWorkOrderStore()

// 添加一些示例工单数据
const sampleOrders = [
  {
    id: 'BX20250610001',
    type: 'repair' as const,
    subtype: '水电维修',
    building: '3栋2单元501',
    description: '厨房水龙头漏水，水流很小，需要维修。已经持续一周时间了，影响正常使用。',
    phone: '13800138000',
    images: [],
    status: 'pending' as const,
    submitTime: '2025-06-10 14:30:25',
    ownerName: '张三'
  },
  {
    id: 'TS20250610002',
    type: 'complaint' as const,
    subtype: '噪音扰民',
    building: '5栋1单元302',
    description: '楼上住户每天晚上10点后还在大声播放音乐，严重影响休息。多次沟通无果。',
    phone: '13900139000',
    images: [],
    status: 'approved' as const,
    submitTime: '2025-06-09 16:45:12',
    ownerName: '李四',
    reviewTime: '2025-06-10 09:15:30',
    reviewer: '李管理员',
    reviewComment: '情况属实，请物业尽快处理'
  },
  {
    id: 'BX20250609003',
    type: 'repair' as const,
    subtype: '家电维修',
    building: '2栋3单元401',
    description: '客厅空调不制冷，遥控器可以正常开机，但是吹出来的风不凉。',
    phone: '13700137000',
    images: [],
    status: 'completed' as const,
    submitTime: '2025-06-08 10:20:15',
    ownerName: '王五',
    reviewTime: '2025-06-08 14:30:25',
    reviewer: '李管理员',
    handleTime: '2025-06-09 11:20:30',
    handler: '张师傅',
    handleDescription: '已检查空调，发现制冷剂不足，已补充制冷剂并清洗过滤网，现在可以正常制冷。',
    handleImages: []
  }
]

// 添加示例数据到store
sampleOrders.forEach(order => {
  workOrderStore.addWorkOrder(order)
})

app.mount('#app')