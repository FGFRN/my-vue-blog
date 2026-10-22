import test from 'node:test'
import assert from 'node:assert/strict'
import { generateArticleId, migrateArticleIds } from '../src/utils/articleIds.js'
import { initialArticles } from '../src/data/articles.js'
import { loadArticles, saveArticles, STORAGE_KEY, findArticleById, upsertArticle, removeArticle, incrementArticleViews } from '../src/utils/articleRepository.js'

test('initial IDs are eight digits and generation resolves collisions and wraps', () => {
  assert.ok(initialArticles.every(article => /^[1-9]\d{7}$/.test(article.id)))
  assert.equal(generateArticleId([{ id: '99999999' }, { id: '10000000' }], 99999999), '10000001')
})

test('legacy IDs migrate deterministically, preserve content and old links, and survive reload', () => {
  const old = [
    { ...initialArticles[0], id: 'interface', legacyIds: [] },
    { ...initialArticles[1], id: 'old-uuid', legacyIds: [] },
    { ...initialArticles[2], id: '10000001', legacyIds: [] },
  ]
  let saved = JSON.stringify(old)
  const storage = { getItem: () => saved, setItem: (key, value) => { saved = value } }
  const migrated = loadArticles(storage, [])
  assert.equal(new Set(migrated.map(article => article.id)).size, 3)
  assert.deepEqual(migrateArticleIds(old), migrated)
  assert.equal(findArticleById(migrated, 'interface').content, old[0].content)
  saveArticles(storage, migrated)
  assert.deepEqual(loadArticles(storage, []), migrated)
})

test('repository CRUD and reading counts preserve ID and legacy links', () => {
  const draft = { title: '新文章', tags: ['测试'], excerpt: '摘要', content: '正文', cover: 'quiet' }
  const created = upsertArticle(initialArticles, draft)
  assert.match(created.article.id, /^[1-9]\d{7}$/)
  const edited = upsertArticle(created.articles, draft, 'interface')
  assert.equal(edited.article.id, '10000001')
  assert.ok(edited.article.legacyIds.includes('interface'))
  const viewed = incrementArticleViews(edited.articles, 'interface')
  assert.equal(findArticleById(viewed, 'interface').views, 1)
  assert.ok(!findArticleById(removeArticle(viewed, 'interface'), 'interface'))
  assert.throws(() => saveArticles({ setItem() {} }, [{ ...initialArticles[0], id: 'old' }]))
})
