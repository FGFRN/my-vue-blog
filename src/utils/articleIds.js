export const isArticleId = id => /^[1-9]\d{7}$/.test(id)

export function generateArticleId(articles, start = 10000000 + crypto.getRandomValues(new Uint32Array(1))[0] % 90000000) {
  const used = new Set(articles.map(article => article.id))
  for (let offset = 0; offset < 90000000; offset++) {
    const id = String(10000000 + (start - 10000000 + offset) % 90000000)
    if (!used.has(id)) return id
  }
  throw new Error('文章编号已用完。')
}

export function normalizeArticleIds(articles) {
  const occupied = articles.filter(article => isArticleId(article.id))
  return articles.map(article => {
    const { legacyIds, ...cleanArticle } = article
    if (isArticleId(article.id)) return cleanArticle
    // A stable mapping also works when storage is read-only.
    let hash = 2166136261
    for (const character of article.id) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
    const preferred = String(10000000 + hash % 90000000)
    const id = generateArticleId(occupied, Number(preferred))
    occupied.push({ id })
    return { ...cleanArticle, id }
  })
}

export function findArticleById(articles, id) {
  return articles.find(article => article.id === id)
}
