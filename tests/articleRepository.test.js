import test from 'node:test'
import assert from 'node:assert/strict'
import { initialArticles } from '../src/data/articles.js'
import { filterArticles, paginate, loadArticles, saveArticles, STORAGE_KEY } from '../src/utils/articleRepository.js'

function memoryStorage() {
  const data = new Map()
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
}
test('CRUD data survives serialization including an empty collection', () => {
  const storage = memoryStorage()
  const articles = loadArticles(storage, initialArticles)
  const added = { ...articles[0], id: 'test-article', title: '新文章', views: 2 }
  articles.push(added)
  saveArticles(storage, articles)
  assert.equal(loadArticles(storage, initialArticles).find(article => article.id === added.id).title, '新文章')
  added.title = '编辑后的文章'
  saveArticles(storage, articles)
  assert.equal(loadArticles(storage, initialArticles).at(-1).title, '编辑后的文章')
  saveArticles(storage, articles.filter(article => article.id !== added.id))
  assert.equal(loadArticles(storage, initialArticles).some(article => article.id === added.id), false)
  saveArticles(storage, [])
  assert.deepEqual(loadArticles(storage, initialArticles), [])
})
test('invalid saved data is rejected instead of overwriting it', () => {
  const storage = memoryStorage()
  storage.setItem(STORAGE_KEY, '{broken')
  assert.throws(() => loadArticles(storage, initialArticles))
  assert.equal(storage.getItem(STORAGE_KEY), '{broken')
  storage.setItem(STORAGE_KEY, JSON.stringify([initialArticles[0], initialArticles[0]]))
  assert.throws(() => loadArticles(storage, initialArticles))
})
test('category, tag and trimmed keyword filters work together', () => {
  assert.equal(filterArticles(initialArticles, { category: '人工智能' })[0].id, 'interface')
  assert.equal(filterArticles(initialArticles, { query: '  离线  ' }).some(article => article.id === 'offline'), true)
  assert.equal(filterArticles(initialArticles, { category: '设计', query: '人工智能' }).length, 1)
  assert.equal(filterArticles(initialArticles, { query: '没有这个关键词' }).length, 0)
})
test('pagination clamps an out-of-range page after filtering or deletion', () => {
  assert.equal(paginate(initialArticles, 2, 3).items.length, 3)
  assert.equal(paginate(initialArticles.slice(0, 2), 9, 3).page, 1)
  assert.deepEqual(paginate([], 8, 3), { page: 1, totalPages: 1, items: [] })
})
