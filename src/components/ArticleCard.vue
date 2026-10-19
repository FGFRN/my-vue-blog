<script setup>
import { RouterLink } from 'vue-router'
import { coverFor } from '../data/media.js'
defineProps({ article: { type: Object, required: true } })
</script>

<template>
  <article class="article-card">
    <RouterLink class="card-image" :to="`/articles/${article.id}`" :aria-label="`阅读：${article.title}`"><img
        :src="coverFor(article.cover).src" :alt="coverFor(article.cover).alt" loading="lazy"></RouterLink>
    <div class="card-body"><span class="category">{{ article.tags.join(' · ') || '未添加标签' }}</span>
      <h3>
        <RouterLink class="article-title" :to="`/articles/${article.id}`">{{ article.title }}</RouterLink>
      </h3>
      <p class="excerpt">{{ article.excerpt }}</p>
      <div class="card-bottom"><span class="meta">{{ article.date }} / {{ article.minutes }}分钟 · {{ article.views
          }}次阅读</span>
        <RouterLink class="icon-button small" :to="`/articles/${article.id}`" :aria-label="`阅读：${article.title}`">↗
        </RouterLink>
      </div>
    </div>
  </article>
</template>
