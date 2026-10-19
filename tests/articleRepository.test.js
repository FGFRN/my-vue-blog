import test from 'node:test'
import assert from 'node:assert/strict'
import { initialArticles } from '../src/data/articles.js'
import { filterArticles, paginate, loadArticles, saveArticles, STORAGE_KEY } from '../src/utils/articleRepository.js'
import { mergeTags, normalizeArticleTags, validateTagName, loadTagLibrary, TAG_STORAGE_KEY } from '../src/utils/tags.js'

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
test('tags and trimmed keyword filters work together', () => {
  assert.equal(filterArticles(initialArticles, { tag: '人工智能' })[0].id, 'interface')
  assert.equal(filterArticles(initialArticles, { query: '  离线  ' }).some(article => article.id === 'offline'), true)
  assert.equal(filterArticles(initialArticles, { tag: '设计', query: '人工智能' }).length, 1)
  assert.equal(filterArticles(initialArticles, { query: '没有这个关键词' }).length, 0)
})
test('legacy categories are merged into tags without losing article content', () => {
  const storage = memoryStorage()
  const legacy = { ...initialArticles[0], category: '科技', tags: ['科技', '  人工智能  ', '设计', ''] }
  storage.setItem(STORAGE_KEY, JSON.stringify([legacy]))
  const loaded = loadArticles(storage, initialArticles)
  assert.deepEqual(loaded[0].tags, ['科技', '人工智能', '设计'])
  assert.equal('category' in loaded[0], false)
  assert.equal(loaded[0].content, legacy.content)
  assert.equal(storage.getItem(STORAGE_KEY), JSON.stringify([legacy]))
  assert.equal(filterArticles(loaded, { category: '科技' }).length, 1)
  saveArticles(storage, loaded)
  assert.equal('category' in JSON.parse(storage.getItem(STORAGE_KEY))[0], false)
})
test('multiple selected tags and untagged articles round-trip without category', () => {
  const storage = memoryStorage()
  const article = { ...initialArticles[0], tags: ['学习', '设计', '学习'] }
  saveArticles(storage, [article])
  assert.deepEqual(loadArticles(storage, [])[0].tags, ['学习', '设计'])
  saveArticles(storage, [{ ...article, tags: [] }])
  assert.deepEqual(loadArticles(storage, [])[0].tags, [])
  assert.equal(filterArticles(loadArticles(storage, []), { tag: '学习' }).length, 0)
})
test('custom tag library survives even before a tag is assigned to an article', () => {
  const storage = memoryStorage()
  assert.deepEqual(loadTagLibrary(storage), [])
  storage.setItem(TAG_STORAGE_KEY, JSON.stringify(['新标签', ' 新标签 ', '学习']))
  assert.deepEqual(loadTagLibrary(storage), ['新标签', '学习'])
  assert.deepEqual(mergeTags(['设计', ''], [' 设计 ', '科技']), ['设计', '科技'])
  assert.equal(validateTagName('  Vue  '), 'Vue')
  assert.throws(() => validateTagName(' '))
  assert.throws(() => validateTagName('一个，两个'))
  assert.throws(() => validateTagName('a'.repeat(21)))
  storage.setItem(TAG_STORAGE_KEY, '{broken')
  assert.throws(() => loadTagLibrary(storage))
  assert.equal(storage.getItem(TAG_STORAGE_KEY), '{broken')
  assert.deepEqual(normalizeArticleTags({ category: '设计', tags: ['科技'] }).tags, ['设计', '科技'])
})
test('pagination clamps an out-of-range page after filtering or deletion', () => {
  assert.equal(paginate(initialArticles, 2, 3).items.length, 3)
  assert.equal(paginate(initialArticles.slice(0, 2), 9, 3).page, 1)
  assert.deepEqual(paginate([], 8, 3), { page: 1, totalPages: 1, items: [] })
})
