<script setup>
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useBlog } from '../stores/blog.js'
import { coverFor } from '../data/media.js'
import MarkdownContent from '../components/MarkdownContent.vue'
const route = useRoute()
const { findArticle, recordView } = useBlog()
const article = computed(() => findArticle(route.params.id))
watch(() => route.params.id, id => {
  recordView(id)
  if (article.value) document.title = `${article.value.title} — FGFRN`
}, { immediate: true })
</script>

<template>
  <main id="main" class="container detail-page">
    <RouterLink class="text-link" to="/">← 返回首页</RouterLink>
    <article v-if="article" class="reading-article">
      <header>
        <p class="eyebrow">个人手记</p>
        <h1>{{ article.title }}</h1>
        <p v-if="article.excerpt" class="reading-intro">{{ article.excerpt }}</p>
        <p class="reading-meta"><time :datetime="article.date">{{ article.date }}</time> · {{ article.minutes }}分钟 · {{
          article.views }}次阅读</p>
        <div class="tag-list">
          <RouterLink v-for="tag in article.tags" :key="tag"
            :to="{ name: 'home', query: { tag }, hash: '#writing' }"># {{ tag }}</RouterLink>
        </div>
      </header>
      <figure><img :src="coverFor(article.cover).src" :alt="coverFor(article.cover).alt">
        <figcaption>{{ coverFor(article.cover).alt }}</figcaption>
      </figure>
      <!-- <p v-if="article.demo" class="reader-notice">课设演示文章，可在管理页面替换为你的正式内容。</p> -->
      <MarkdownContent :content="article.content" />
      <footer class="reading-footer">
        <RouterLink class="text-link" :to="`/admin/edit/${article.id}`">编辑这篇文章 ↗</RouterLink>
        <RouterLink class="text-link" to="/">继续阅读 →</RouterLink>
      </footer>
    </article>
    <section v-else class="empty-state">
      <h1>这篇文章不存在</h1>
      <p>它可能已被删除，请返回首页查看其他文章。</p>
    </section>
  </main>
</template>

