import { computed, ref } from 'vue'
import { initialArticles } from '../data/articles.js'
import { loadArticles, saveArticles } from '../utils/articleRepository.js'

const storageWarning = ref('')
const storageBlocked = ref(false)
let initial
try { initial = loadArticles(window.localStorage, initialArticles) }
catch {
  initial = structuredClone(initialArticles)
  storageBlocked.value = true
  storageWarning.value = '本地存储不可用或已有数据格式异常。当前展示演示数据，修改仅在本次页面中生效，原存储不会被覆盖。'
}
const articles = ref(initial)
const sortedArticles = computed(() => [...articles.value].sort((a, b) => b.date.localeCompare(a.date)))

function persist() {
  if (storageBlocked.value) return false
  try {
    saveArticles(window.localStorage, articles.value)
    storageWarning.value = ''
    return true
  } catch {
    storageWarning.value = '本地存储写入失败。修改仅在本次页面中生效，刷新后可能丢失。'
    return false
  }
}

function findArticle(id) { return articles.value.find(article => article.id === id) }
function saveArticle(draft, id) {
  const existing = id ? findArticle(id) : null
  if (id && !existing) throw new Error('文章不存在，无法保存。')
  const article = {
    id: existing?.id || crypto.randomUUID(),
    title: draft.title.trim(), category: draft.category.trim(),
    tags: [...new Set(draft.tags.split(/[,，]/).map(tag => tag.trim()).filter(Boolean))],
    excerpt: draft.excerpt.trim(), content: draft.content.trim(), cover: draft.cover,
    date: existing?.date || new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date()),
    minutes: Math.max(1, Math.ceil(draft.content.trim().length / 350)),
    views: existing?.views || 0, demo: false,
  }
  if (!article.title || !article.category || !article.excerpt || !article.content) throw new Error('请填写标题、分类、摘要和正文。')
  if (existing) articles.value = articles.value.map(item => item.id === id ? article : item)
  else articles.value = [article, ...articles.value]
  return { id: article.id, persisted: persist() }
}
function deleteArticle(id) {
  articles.value = articles.value.filter(article => article.id !== id)
  return persist()
}
function recordView(id) {
  const article = findArticle(id)
  if (article) { article.views++; persist() }
}

export function useBlog() { return { articles, sortedArticles, storageWarning, findArticle, saveArticle, deleteArticle, recordView } }
