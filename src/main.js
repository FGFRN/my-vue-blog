import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './styles.css'
import './application.css'

router.afterEach((to, from, failure) => {
  if (!failure) document.title = `${to.meta.title || '个人手记'} — FGFRN`
})
createApp(App).use(router).mount('#app')
