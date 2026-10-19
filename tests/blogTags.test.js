import test from 'node:test'
import assert from 'node:assert/strict'
import { STORAGE_KEY } from '../src/utils/articleRepository.js'
import { TAG_STORAGE_KEY } from '../src/utils/tags.js'
import { initialArticles } from '../src/data/articles.js'

test('tag store migrates legacy records, creates reusable tags and persists multi-selection', async () => {
  const values = new Map()
  values.set(STORAGE_KEY, JSON.stringify([{ ...initialArticles[0], category: '旧分类', tags: ['已有标签'] }]))
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
  const oldWindow = globalThis.window
  const oldStorage = globalThis.localStorage
  globalThis.window = { localStorage: storage }
  globalThis.localStorage = storage
  try {
    const { useBlog } = await import(`../src/stores/blog.js?test=${Date.now()}`)
    const blog = useBlog()
    assert.deepEqual(blog.articles.value[0].tags, ['旧分类', '已有标签'])
    assert.equal(blog.addTag('  新标签  '), '新标签')
    blog.addTag('新标签')
    assert.deepEqual(JSON.parse(values.get(TAG_STORAGE_KEY)), ['新标签'])
    assert.throws(() => blog.addTag(' '))
    const result = blog.saveArticle({ title: '测试文章', tags: ['新标签', '已有标签', '新标签'], excerpt: '测试摘要', content: '正文内容', cover: 'quiet' })
    assert.equal(result.persisted, true)
    assert.deepEqual(blog.findArticle(result.id).tags, ['新标签', '已有标签'])
    assert.equal('category' in blog.findArticle(result.id), false)
    const reloaded = await import(`../src/stores/blog.js?test=reload-${Date.now()}`)
    const restored = reloaded.useBlog()
    assert.ok(restored.availableTags.value.includes('新标签'))
    assert.deepEqual(restored.findArticle(result.id).tags, ['新标签', '已有标签'])
    restored.saveArticle({ title: '编辑后', tags: ['新标签'], excerpt: '摘要', content: '正文', cover: 'quiet' }, result.id)
    assert.deepEqual(restored.findArticle(result.id).tags, ['新标签'])
    restored.deleteArticle(result.id)
    assert.ok(restored.availableTags.value.includes('新标签'))
  } finally {
    if (oldWindow === undefined) delete globalThis.window
    else globalThis.window = oldWindow
    if (oldStorage === undefined) delete globalThis.localStorage
    else globalThis.localStorage = oldStorage
  }
})
