import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/store/auth'

const Home = () => import('@/views/Home.vue')
const LoginSeller = () => import('@/views/LoginSeller.vue')
const RegistrationSeller = () => import('@/views/RegistrationSeller.vue')
const LoginPersonnel = () => import('@/views/LoginPersonnel.vue')
const Stats = () => import('@/views/Stats.vue')
const Personal = () => import('@/views/Personal.vue')
const Categories = () => import('@/views/Categories.vue')
const Characteristics = () => import('@/views/Characteristics.vue')
const Banners = () => import('@/views/Banners.vue')
const Brands = () => import('@/views/Brands.vue')
const Users = () => import('@/views/Users.vue')
const Tags = () => import('@/views/Tags.vue')
const Shops = () => import('@/views/Shops.vue')
const Withdrawer = () => import('@/views/Withdrawer.vue')
const Products = () => import('@/views/Products.vue')
const Product = () => import('@/views/Product.vue')
const ProductMulti = () => import('@/views/ProductMulti.vue')
const ProductComments = () => import('@/views/ProductComments.vue')
const ProductComment = () => import('@/views/ProductComment.vue')
const ProductChats = () => import('@/views/ProductChats.vue')
const Orders = () => import('@/views/Orders.vue')
const OrdersSeller = () => import('@/views/OrdersSeller.vue')
const Order = () => import('@/views/Order.vue')
const OrderPrint = () => import('@/views/OrderPrint.vue')
const OrderSeller = () => import('@/views/OrderSeller.vue')
const Shippings = () => import('@/views/Shippings.vue')
const Locations = () => import('@/views/Locations.vue')
const Comments = () => import('@/views/Comments.vue')
const Chats = () => import('@/views/Chats.vue')
const ChatsAdmin = () => import('@/views/ChatsAdmin.vue')
const Chat = () => import('@/views/Chat.vue')
const PaymentMethods = () => import('@/views/PaymentMethods.vue')

const routes = [
  { path: '/', name: 'home', meta: { roles: ['ADMIN', 'MANAGER', 'SELLER'] }, component: Home },
  {
    path: '/login',
    name: 'login-seller',
    meta: { layout: 'empty', roles: ['ADMIN', 'MANAGER', 'SELLER'] },
    component: LoginSeller
  },
  {
    path: '/registration',
    name: 'registration-seller',
    meta: { layout: 'empty', roles: ['ADMIN', 'MANAGER', 'SELLER'] },
    component: RegistrationSeller
  },
  {
    path: '/authorization/login',
    name: 'login-personnel',
    meta: { layout: 'empty', roles: ['ADMIN', 'MANAGER', 'SELLER'] },
    component: LoginPersonnel
  },
  { path: '/stats', name: 'stats', meta: { roles: ['ADMIN'] }, component: Stats },
  { path: '/personal', name: 'personal', meta: { roles: ['ADMIN'] }, component: Personal },
  { path: '/categories', name: 'categories', meta: { roles: ['ADMIN'] }, component: Categories },
  { path: '/characteristics', name: 'characteristics', meta: { roles: ['ADMIN'] }, component: Characteristics },
  { path: '/banners', name: 'banners', meta: { roles: ['ADMIN'] }, component: Banners },
  { path: '/brands', name: 'brands', meta: { roles: ['ADMIN'] }, component: Brands },
  { path: '/users', name: 'users', meta: { roles: ['ADMIN'] }, component: Users },
  { path: '/tags', name: 'tags', meta: { roles: ['ADMIN'] }, component: Tags },
  { path: '/shops', name: 'shops', meta: { roles: ['ADMIN'] }, component: Shops },
  { path: '/withdrawer', name: 'withdrawer', meta: { roles: ['ADMIN', 'MANAGER', 'SELLER'] }, component: Withdrawer },
  { path: '/products', name: 'products', meta: { roles: ['ADMIN', 'MANAGER', 'SELLER'] }, component: Products },
  { path: '/product/:id', name: 'product', meta: { roles: ['ADMIN', 'MANAGER', 'SELLER'] }, component: Product },
  {
    path: '/product-multi/:id',
    name: 'product-multi',
    meta: { roles: ['ADMIN', 'MANAGER', 'SELLER'] },
    component: ProductMulti
  },
  {
    path: '/product-comments/:id',
    name: 'product-comments',
    meta: { roles: ['ADMIN', 'MANAGER', 'SELLER'] },
    component: ProductComments
  },
  {
    path: '/product-comment/:id',
    name: 'product-comment',
    meta: { roles: ['ADMIN', 'MANAGER', 'SELLER'] },
    component: ProductComment
  },
  { path: '/product-chats/:id', name: 'product-chats', meta: { roles: ['ADMIN', 'SELLER'] }, component: ProductChats },
  { path: '/orders', name: 'orders', meta: { roles: ['ADMIN', 'MANAGER'] }, component: Orders },
  { path: '/orders-seller', name: 'orders-seller', meta: { roles: ['SELLER'] }, component: OrdersSeller },
  { path: '/order/:id', name: 'order', meta: { roles: ['ADMIN', 'MANAGER'] }, component: Order },
  {
    path: '/order-print/:id',
    name: 'order-print',
    meta: {
      layout: 'empty',
      roles: ['ADMIN', 'MANAGER']
    },
    component: OrderPrint
  },
  {
    path: '/order-seller/:id',
    name: 'order-seller',
    meta: { roles: ['ADMIN', 'MANAGER', 'SELLER'] },
    component: OrderSeller
  },
  { path: '/shippings', name: 'shippings', meta: { roles: ['ADMIN'] }, component: Shippings },
  { path: '/locations', name: 'locations', meta: { roles: ['ADMIN'] }, component: Locations },
  { path: '/payment-methods', name: 'payment-methods', meta: { roles: ['ADMIN'] }, component: PaymentMethods },
  { path: '/comments', name: 'comments', meta: { roles: ['ADMIN', 'MANAGER', 'SELLER'] }, component: Comments },
  { path: '/chats', name: 'chats', meta: { roles: ['ADMIN', 'MANAGER', 'SELLER'] }, component: Chats },
  { path: '/admin-chats', name: 'admin-chats', meta: { roles: ['ADMIN', 'MANAGER'] }, component: ChatsAdmin },
  { path: '/chat/:id', name: 'chat', meta: { roles: ['ADMIN', 'MANAGER', 'SELLER'] }, component: Chat }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuth()
  if (to.name === 'login-seller' || to.name === 'login-personnel' || to.name === 'registration-seller') {
    next()
    return
  }

  if (!auth.isAuth) {
    await auth.getProfile()
  }

  if (to.meta?.roles && !to.meta.roles?.includes(auth.getRole)) {
    next('/login')
    return
  }

  if (to.name === 'home') {
    if (auth.getRole === 'SELLER') {
      next('/orders-seller')
      return
    }
    if (auth.getRole === 'ADMIN') {
      next('/stats')
      return
    }
    if (auth.getRole === 'MANAGER') {
      next('/orders')
      return
    }
  }
  next()
})
export default router
