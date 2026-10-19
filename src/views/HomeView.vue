<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ArticleCard from '../components/ArticleCard.vue'
import FeaturedArticle from '../components/FeaturedArticle.vue'
import Pagination from '../components/Pagination.vue'
import NewsletterForm from '../components/NewsletterForm.vue'
import { useBlog } from '../stores/blog.js'
import { filterArticles, paginate } from '../utils/articleRepository.js'
import { avatar } from '../data/media.js'

const { sortedArticles, availableTags } = useBlog()
const route = useRoute()
const router = useRouter()
const tag = computed(() => typeof route.query.tag === 'string' ? route.query.tag : typeof route.query.category === 'string' ? route.query.category : 'all')
const filters = computed(() => ['all', ...availableTags.value])
const featured = computed(() => sortedArticles.value.find(article => article.id === 'interface') || sortedArticles.value[0])
const filtered = computed(() => filterArticles(sortedArticles.value, { tag: tag.value }).filter(article => tag.value !== 'all' || article.id !== featured.value?.id))
const pagination = computed(() => paginate(filtered.value, Number.parseInt(route.query.page, 10) || 1, 3))
function changeTag(value) { router.push({ path: '/', query: value === 'all' ? {} : { tag: value }, hash: '#writing' }) }
function changePage(page) { router.push({ path: '/', query: { ...route.query, page: String(page) }, hash: '#writing' }) }
</script>

<template>
  <main id="main" class="container">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-eyebrow"><span class="eyebrow">Hello World</span><span class="independent"><i></i>
          独立思考，自由表达</span></div>
      <h1 id="hero-title">以人的视角，<br>看数字世界。</h1>
      <p class="hero-description">我是 FGFRN，一名软件设计与代码爱好者。<br class="desktop-break">在这里，记录技术、设计，以及生活里的微小发现。</p><span
        class="mobile-independent"><i></i> 独立思考，自由表达</span>
    </section>
    <FeaturedArticle v-if="featured" :article="featured" />
    <section id="writing" class="writing-section" aria-labelledby="writing-title">
      <div class="section-heading">
        <h2 id="writing-title">最新文章 <span class="small-count">[ {{ String(filtered.length).padStart(2, '0') }} ]</span>
        </h2><button class="text-link muted" @click="changeTag('all')">查看全部 <span
            aria-hidden="true">→</span></button>
      </div>
      <div class="filters" role="group" aria-label="按文章标签筛选"><button v-for="filter in filters" :key="filter"
          class="filter" :class="{ active: tag === filter }" :aria-pressed="tag === filter"
          @click="changeTag(filter)">{{ filter === 'all' ? '全部文章' : filter }}</button></div>
      <div class="article-grid">
        <ArticleCard v-for="article in pagination.items" :key="article.id" :article="article" />
      </div>
      <p v-if="!filtered.length" class="empty-state">这里还没有文章。<RouterLink to="/admin/new" class="text-link">写下第一篇 →
        </RouterLink>
      </p>
      <Pagination :page="pagination.page" :total-pages="pagination.totalPages" @change="changePage" />
      <p class="sr-only" role="status">共{{ filtered.length }}篇文章，第{{ pagination.page }}页</p>
    </section>
    <section class="bottom-grid" aria-label="作者与订阅">
      <article id="about" class="about-card">
        <div class="author"><img :src="avatar" width="40" height="40" alt="FGFRN 头像">
          <div>
            <h2>FGFRN</h2><span class="meta">创造者 / 设计与代码爱好者</span>
          </div>
        </div>
        <p>持续记录软件学习、创造和关注的事物</p>
        <RouterLink class="text-link" to="/about">进一步了解我 <span aria-hidden="true">↗</span></RouterLink>
      </article>
      <NewsletterForm />
    </section>
  </main>
</template>
