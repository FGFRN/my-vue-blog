<script setup>
import { RouterLink } from 'vue-router'
import { avatar } from '../data/media.js'
</script>

<template>
  <main id="main" class="container detail-page"><article class="reading-article"><p class="eyebrow">关于 / ABOUT</p><img class="about-avatar" :src="avatar" alt="FGFRN 头像"><h1>你好，我是 FGFRN。</h1><p>这里是我的个人手记，记录软件学习、设计思考，以及生活中值得留意的小事。</p><p>我希望用代码实现想法，也希望在不断变化的技术里，保留人的观察、判断与好奇心。</p><h2>关于这个网站</h2><p>这是基于 Vue 的纯前端个人博客课程项目，支持文章浏览、分类、搜索和本地文章管理。内容保存在当前浏览器中，不会同步到其他设备。</p><RouterLink class="text-link" to="/">回到首页 →</RouterLink></article></main>
</template>
