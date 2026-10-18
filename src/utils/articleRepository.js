export const STORAGE_KEY = 'fgfrn-blog-articles-v1'

export function validateArticles(value) {
  if (!Array.isArray(value)) return false
  const ids = new Set()
  return value.every(article => {
    if (!article || typeof article !== 'object') return false
    if (!['id', 'title', 'category', 'excerpt', 'content', 'cover', 'date'].every(key => typeof article[key] === 'string')) return false
    if (!article.id || !article.title.trim() || !article.category.trim() || !article.content.trim() || ids.has(article.id)) return false
    ids.add(article.id)
    return Array.isArray(article.tags) && article.tags.every(tag => typeof tag === 'string') && Number.isFinite(article.views) && article.views >= 0 && Number.isFinite(article.minutes) && article.minutes > 0
  })
}

export function loadArticles(storage, defaults) {
  const saved = storage.getItem(STORAGE_KEY)
  if (saved === null) return structuredClone(defaults)
  const parsed = JSON.parse(saved)
  if (!validateArticles(parsed)) throw new Error('文章数据格式不正确')
  return parsed
}

export function saveArticles(storage, articles) {
  if (!validateArticles(articles)) throw new Error('文章数据格式不正确')
  storage.setItem(STORAGE_KEY, JSON.stringify(articles))
}

export function filterArticles(articles, { category = 'all', query = '' } = {}) {
  const keyword = query.trim().toLocaleLowerCase()
  return articles.filter(article => (category === 'all' || article.category === category || article.tags.includes(category)) && `${article.title} ${article.category} ${article.tags.join(' ')} ${article.excerpt} ${article.content}`.toLocaleLowerCase().includes(keyword))
}

export function paginate(articles, requestedPage, pageSize) {
  const totalPages = Math.max(1, Math.ceil(articles.length / pageSize))
  const page = Math.min(Math.max(1, requestedPage), totalPages)
  return { page, totalPages, items: articles.slice((page - 1) * pageSize, page * pageSize) }
}
