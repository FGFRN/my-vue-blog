<script setup>
import { RouterLink } from 'vue-router'
import SocialLinks from './SocialLinks.vue'
function backToTop() { window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }
</script>

<template>
  <footer class="container site-footer">
    <div><strong>© 2026 FGFRN</strong><span>用心创造，保持好奇。</span></div>
    <nav aria-label="页脚导航">
      <RouterLink to="/">文章</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
      <RouterLink to="/admin">管理</RouterLink><button @click="backToTop">回到顶部 ↑</button>
    </nav>
    <SocialLinks />
  </footer>
</template>

