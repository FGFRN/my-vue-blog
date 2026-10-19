<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()
import themeIcon from '../assets/theme-icon.svg'

// 接收父组件传入的主题状态
const props = defineProps({ light: Boolean })

// 通知父组件切换主题或打开搜索
defineEmits(['toggle-theme', 'search'])

const rotation = ref(props.light ? 180 : 0)

// 根据实际主题变化旋转，也能响应父组件对主题的修改
watch(
  () => props.light,
  () => {
    rotation.value += 180
  },
)
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink class="brand" to="/" aria-label="FGFRN 首页"><span
          class="brand-label">My-Vue-Blog</span><strong>FGFRN</strong><span class="brand-note"> / 手记</span></RouterLink>
      <div class="header-tools">
        <button class="theme-button icon-button" :aria-label="light ? '切换到深色主题' : '切换到浅色主题'"
          @click="$emit('toggle-theme')">
          <img :src="themeIcon" alt="" class="theme-icon" :style="{ transform: `rotate(${rotation}deg)` }">
        </button>
        <button class="icon-button" aria-label="搜索文章" @click="$emit('search')"><svg viewBox="0 0 24 24"
            aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg></button>
      </div>
      <nav class="main-nav" aria-label="主导航">
        <RouterLink to="/" class="nav-link" :class="{ active: route.name === 'home' && !route.query.tag && !route.query.category }">文章
        </RouterLink>
        <RouterLink :to="{ name: 'home', query: { tag: '生活与创作' }, hash: '#writing' }" class="nav-link"
          :class="{ active: (route.query.tag ?? route.query.category) === '生活与创作' }">随笔</RouterLink>
        <RouterLink to="/about" class="nav-link" :class="{ active: route.name === 'about' }">关于</RouterLink>
      </nav>
      <RouterLink to="/admin" class="subscribe-link">文章管理 <span aria-hidden="true">↗</span></RouterLink>
    </div>
  </header>
</template>

<style scoped>
.theme-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  transform-origin: center;
  transition: transform 0.4s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .theme-icon {
    transition: none;
  }
}
</style>
