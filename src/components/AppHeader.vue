<script setup>
import { RouterLink, useRoute } from 'vue-router'
defineProps({ light: Boolean })
defineEmits(['toggle-theme', 'search'])
const route = useRoute()
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink class="brand" to="/" aria-label="FGFRN 首页"><span class="brand-label">My-Vue-Blog</span><strong>FGFRN</strong><span class="brand-note"> / 手记</span></RouterLink>
      <div class="header-tools">
        <button class="theme-button icon-button" :aria-label="light ? '切换到深色主题' : '切换到浅色主题'" title="切换主题" @click="$emit('toggle-theme')"><span aria-hidden="true">☼</span></button>
        <button class="icon-button" aria-label="搜索文章" @click="$emit('search')"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg></button>
      </div>
      <nav class="main-nav" aria-label="主导航">
        <RouterLink to="/" class="nav-link" :class="{ active: route.name === 'home' && !route.query.category }">文章</RouterLink>
        <RouterLink :to="{ name: 'home', query: { category: '生活与创作' }, hash: '#writing' }" class="nav-link" :class="{ active: route.query.category === '生活与创作' }">随笔</RouterLink>
        <RouterLink to="/about" class="nav-link" :class="{ active: route.name === 'about' }">关于</RouterLink>
      </nav>
      <RouterLink to="/admin" class="subscribe-link">文章管理 <span aria-hidden="true">↗</span></RouterLink>
    </div>
  </header>
</template>
