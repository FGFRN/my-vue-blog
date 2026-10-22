import { computed, ref } from 'vue'
import { initialArticles } from '../data/articles.js'
import { loadArticles, saveArticles, findArticleById, upsertArticle, removeArticle, incrementArticleViews } from '../utils/articleRepository.js'
import { migrateArticleIds } from '../utils/articleIds.js'
import { mergeTags, normalizeArticleTags, validateTagName, loadTagLibrary, TAG_STORAGE_KEY } from '../utils/tags.js'

const storageWarning = ref('')
const storageBlocked = ref(false)
let initial
try { initial = loadArticles(window.localStorage, initialArticles) }
catch {
  initial = migrateArticleIds(structuredClone(initialArticles).map(normalizeArticleTags))
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

function findArticle(id) { return findArticleById(articles.value, id) }
function saveArticle(draft, id) {
  const result = upsertArticle(articles.value, draft, id)
  articles.value = result.articles
  return { id: result.article.id, persisted: persist() }
}
function deleteArticle(id) {
  articles.value = removeArticle(articles.value, id)
  return persist()
}
function recordView(id) {
  if (findArticle(id)) {
    articles.value = incrementArticleViews(articles.value, id)
    persist()
  }
}

export function useBlog() { return { articles, sortedArticles, storageWarning, availableTags, tagWarning, addTag, findArticle, saveArticle, deleteArticle, recordView } }
