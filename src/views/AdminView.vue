<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseDialog from '../components/BaseDialog.vue'
import { useBlog } from '../stores/blog.js'
import { filterArticles } from '../utils/articleRepository.js'

const { sortedArticles, deleteArticle, availableTags } = useBlog()
const query = ref('')
const selected = ref(null)
const confirming = ref(false)
const notice = ref('')
const filtered = computed(() => filterArticles(sortedArticles.value, { query: query.value }))
const totalViews = computed(() => sortedArticles.value.reduce((total, article) => total + article.views, 0))
function requestDelete(article) { selected.value = article; confirming.value = true }
function confirmDelete() {
  const title = selected.value.title
  const persisted = deleteArticle(selected.value.id)
  notice.value = `已删除「${title}」。${persisted ? '本地数据已更新。' : '修改仅在本次页面中生效。'}`
  confirming.value = false
  selected.value = null
}
</script>

<template>
  <main id="main" class="container admin-page">
    <header class="page-heading"><div><p class="eyebrow">工作台 / DASHBOARD</p><h1>文章管理</h1><p class="muted">整理想法，记录每一次新的发现。</p></div><RouterLink class="primary-button" to="/admin/new">＋ 新增文章</RouterLink></header>
    <p class="local-note">纯前端管理演示：文章与阅读统计保存在当前浏览器，无需登录，也不会同步到其他设备。</p>
    <div class="stats-grid"><article><span>全部文章</span><strong>{{ sortedArticles.length }}</strong></article><article><span>累计阅读</span><strong>{{ totalViews }}</strong></article><article><span>文章标签</span><strong>{{ availableTags.length }}</strong></article></div>
    <div class="admin-toolbar"><label for="admin-query">查找文章</label><input id="admin-query" v-model="query" type="search" placeholder="搜索标题、标签或内容…"></div>
    <p v-if="notice" class="action-notice" role="status">{{ notice }}</p>
    <div v-if="filtered.length" class="table-scroll"><table class="articles-table"><caption class="sr-only">文章管理列表，共{{ filtered.length }}篇</caption><thead><tr><th scope="col">文章标题</th><th scope="col">标签</th><th scope="col">日期</th><th scope="col">阅读</th><th scope="col">操作</th></tr></thead><tbody><tr v-for="article in filtered" :key="article.id"><td><RouterLink :to="`/articles/${article.id}`">{{ article.title }}</RouterLink><small v-if="article.demo">演示文章</small></td><td>{{ article.tags.join(' · ') || '未添加标签' }}</td><td><time :datetime="article.date">{{ article.date }}</time></td><td>{{ article.views }}</td><td><div class="table-actions"><RouterLink :to="`/admin/edit/${article.id}`" :aria-label="`编辑：${article.title}`">编辑</RouterLink><button class="danger-link" :aria-label="`删除：${article.title}`" @click="requestDelete(article)">删除</button></div></td></tr></tbody></table></div>
    <p v-else class="empty-state">{{ query ? '没有找到匹配的文章。' : '还没有文章，点击“新增文章”开始创作。' }}</p>
    <BaseDialog v-model:open="confirming" label="删除文章"><p>确定删除「{{ selected?.title }}」吗？删除后无法恢复。</p><div class="dialog-actions"><button class="secondary-button" autofocus @click="confirming = false">取消</button><button class="danger-button" @click="confirmDelete">确认删除</button></div></BaseDialog>
  </main>
</template>
