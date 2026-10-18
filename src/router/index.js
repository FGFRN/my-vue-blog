import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '个人手记' } },
    { path: '/articles/:id', name: 'article', component: () => import('../views/ArticleView.vue'), meta: { title: '文章详情' } },
    { path: '/about', name: 'about', component: () => import('../views/AboutView.vue'), meta: { title: '关于我' } },
    { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue'), meta: { title: '文章管理' } },
    { path: '/admin/new', name: 'new-article', component: () => import('../views/EditorView.vue'), meta: { title: '新增文章' } },
    { path: '/admin/edit/:id', name: 'edit-article', component: () => import('../views/EditorView.vue'), meta: { title: '编辑文章' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue'), meta: { title: '页面未找到' } },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 24 }
    return { top: 0 }
  },
})
