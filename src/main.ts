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
  Loading,
  Swipe,
  SwipeItem
} from 'vant'

// 导入store并添加示例数据
 

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
app.use(Swipe)
app.use(SwipeItem)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Loading)

app.use(pinia)
app.use(router)

 

app.mount('#app')