<script setup>
import { RouterLink } from 'vue-router'
import { coverFor } from '../data/media.js'
defineProps({ article: { type: Object, required: true } })
</script>

<template>
  <article class="featured">
    <div class="featured-copy"><p class="eyebrow"><span class="blue-dot">精选文章</span><span class="muted">{{ article.category }}</span></p><h2><RouterLink :to="`/articles/${article.id}`" class="article-title"><template v-if="article.title === '下一个界面，是没有界面。'">下一个界面，<br>是没有界面。</template><template v-else>{{ article.title }}</template></RouterLink></h2><p class="excerpt">{{ article.excerpt }}</p><div class="featured-bottom"><span class="meta">{{ article.date }} / 阅读约{{ article.minutes }}分钟</span><RouterLink class="text-link" :to="`/articles/${article.id}`">阅读全文 <span aria-hidden="true">→</span></RouterLink></div></div>
    <RouterLink class="featured-image" :to="`/articles/${article.id}`" :aria-label="`阅读：${article.title}`"><img :src="coverFor(article.cover).src" :alt="coverFor(article.cover).alt"><span class="image-caption">探索 — 001 <span>[ + ]</span></span></RouterLink>
  </article>
</template>
