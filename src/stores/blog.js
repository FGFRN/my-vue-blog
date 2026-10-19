import { computed, ref } from 'vue'
import { initialArticles } from '../data/articles.js'
import { loadArticles, saveArticles } from '../utils/articleRepository.js'
import { mergeTags, normalizeArticleTags, validateTagName, loadTagLibrary, TAG_STORAGE_KEY } from '../utils/tags.js'

const storageWarning = ref('')
const storageBlocked = ref(false)
let initial
try { initial = loadArticles(window.localStorage, initialArticles) }
catch {
  initial = structuredClone(initialArticles).map(normalizeArticleTags)
  storageBlocked.value = true
  storageWarning.value = '本地存储不可用或已有数据格式异常。当前展示演示数据，修改仅在本次页面中生效，原存储不会被覆盖。'
}
const articles = ref(initial)
const sortedArticles = computed(() => [...articles.value].sort((a, b) => b.date.localeCompare(a.date)))
const customTags = ref([])
const tagWarning = ref('')
let tagStorageBlocked = false
try { customTags.value = loadTagLibrary(window.localStorage) }
catch {
  tagStorageBlocked = true
  tagWarning.value = '标签库读取失败，仍可使用文章已有标签；新标签本次可用，但可能无法保存。'
}
const availableTags = computed(() => mergeTags(articles.value.flatMap(article => article.tags), customTags.value))

function addTag(value) {
  const name = validateTagName(value)
  if (availableTags.value.includes(name)) return name
  customTags.value = mergeTags(customTags.value, [name])
  if (!tagStorageBlocked) {
    try { localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(customTags.value)); tagWarning.value = '' }
    catch { tagWarning.value = '新标签已加入本次列表，但标签库保存失败，刷新后可能丢失。' }
  }
  return name
}

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
    title: draft.title.trim(),
    tags: mergeTags(draft.tags),
    excerpt: draft.excerpt.trim(), content: draft.content.trim(), cover: draft.cover,
    date: existing?.date || new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date()),
    minutes: Math.max(1, Math.ceil(draft.content.trim().length / 350)),
    views: existing?.views || 0, demo: false,
  }
  if (!article.title || !article.excerpt || !article.content) throw new Error('请填写标题、摘要和正文。')
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

export function useBlog() { return { articles, sortedArticles, storageWarning, availableTags, tagWarning, addTag, findArticle, saveArticle, deleteArticle, recordView } }
