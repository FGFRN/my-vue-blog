<script setup>
import { RouterLink } from 'vue-router'
import DinoGame from '../components/DinoGame.vue'
</script>

<template>
  <main id="main" class="container not-found-page">
    <p class="eyebrow">404 / A LITTLE DETOUR</p>
    <h1>你好像走丢了……</h1>
    <p class="not-found-description">这里是。。大马路？？？</p>
    <DinoGame />
    <RouterLink to="/" class="text-link home-link">← 回到熟悉的首页</RouterLink>
  </main>
</template>

<style scoped>
.not-found-page{padding-top:65px;padding-bottom:40px;text-align:center}.not-found-page h1{font-size:clamp(30px,4vw,48px);letter-spacing:-.03em;line-height:1.4;font-weight:500;margin:18px 0}.not-found-description{font-size:14px;line-height:1.9;color:var(--muted)}.home-link{display:inline-block;min-height:44px;padding:10px 0}.mobile-only{display:none}@media(max-width:600px){.not-found-page{padding-top:38px;padding-bottom:20px}.not-found-description{font-size:13px}.mobile-only{display:block}}
</style>
