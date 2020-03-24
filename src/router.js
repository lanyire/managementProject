import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'
import Cate from './components/goods/Cate.vue'
import Params from './components/goods/Params.vue'
import GoodList from './components/goods/List.vue'
import Add from './components/goods/Add.vue'
import Order from './components/order/Order.vue'

Vue.use(Router)
const router = new Router({
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },

        // 访问home路由时会重定向到welcome页面，并在welcome页面中兼容其他路由
        {
            path: '/home',
            component: Home,
            redirect: '/welcom',
            children: [{ path: '/welcome', component: Welcome },
                { path: '/users', component: Users },
                { path: '/rights', component: Rights },
                { path: '/roles', component: Roles },
                { path: '/categories', component: Cate },
                { path: '/params', component: Params },
                { path: '/goods', component: GoodList },
                { path: '/goods/add', component: Add },
                { path: '/orders', component: Order },
            ]
        }
    ]
})

//挂载路由守卫，to将要访问的路径，from表示从哪个路径跳转而来，next（）放行，next（'./login)强制跳转回登录页
router.beforeEach((to, from, next) => {
    //如果访问的是登录页直接放行
    if (to.path === '/login') return next()

    //从session中获取token
    const tokenStr = window.sessionStorage.getItem('token')

    //token不存在强制跳转到登录页，存在则放行
    if (!tokenStr) return next('/login')
    next()
})

//暴露路由对象之前需要挂载一个路由守卫，没有token则直接打回
export default router