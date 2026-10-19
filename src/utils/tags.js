export const TAG_STORAGE_KEY = 'fgfrn-blog-tags-v1'

export function mergeTags(...groups) {
  return [...new Set(groups.flat().filter(tag => typeof tag === 'string').map(tag => tag.trim()).filter(Boolean))]
}

export function normalizeArticleTags(article) {
  const { category, ...rest } = article
  return { ...rest, tags: mergeTags(category ? [category] : [], article.tags) }
}

export function validateTagName(value) {
  const name = value.trim()
  if (!name) throw new Error('请输入标签名称。')
  if (name.length > 20) throw new Error('标签名称不能超过20个字符。')
  if (/[,，\n\r]/.test(name)) throw new Error('一次添加一个标签，名称中不能包含逗号或换行。')
  return name
}

export function loadTagLibrary(storage) {
  const raw = storage.getItem(TAG_STORAGE_KEY)
  if (raw === null) return []
  const tags = JSON.parse(raw)
  if (!Array.isArray(tags) || !tags.every(tag => typeof tag === 'string')) throw new Error('标签数据格式不正确')
  return mergeTags(tags)
}
