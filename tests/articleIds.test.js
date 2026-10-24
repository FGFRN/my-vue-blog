import test from 'node:test'
import assert from 'node:assert/strict'
import { generateArticleId, normalizeArticleIds } from '../src/utils/articleIds.js'
import { initialArticles } from '../src/data/articles.js'
import { loadArticles, saveArticles, STORAGE_KEY, findArticleById, upsertArticle, removeArticle, incrementArticleViews } from '../src/utils/articleRepository.js'

test('initial IDs are eight digits and generation resolves collisions and wraps', () => {
  assert.ok(initialArticles.every(article => /^[1-9]\d{7}$/.test(article.id)))
  assert.equal(generateArticleId([{ id: '99999999' }, { id: '10000000' }], 99999999), '10000001')
})

test('legacy IDs migrate deterministically, preserve content and discard old aliases, and survive reload', () => {
  const old = [
    { ...initialArticles[0], id: 'interface', legacyIds: [] },
    { ...initialArticles[1], id: 'old-uuid', legacyIds: [] },
    { ...initialArticles[2], id: '10000001', legacyIds: [] },
  ]
  let saved = JSON.stringify(old)
  const storage = { getItem: () => saved, setItem: (key, value) => { saved = value } }
  const migrated = loadArticles(storage, [])
  assert.equal(new Set(migrated.map(article => article.id)).size, 3)
  assert.deepEqual(normalizeArticleIds(old), migrated)
  assert.equal(migrated[0].content, old[0].content)
  assert.equal(findArticleById(migrated, 'interface'), undefined)
  assert.ok(migrated.every(article => !('legacyIds' in article)))
  saveArticles(storage, migrated)
  assert.deepEqual(loadArticles(storage, []), migrated)
})

test('repository CRUD and reading counts preserve ID and require exact IDs', () => {
  const draft = { title: '新文章', tags: ['测试'], excerpt: '摘要', content: '正文', cover: 'quiet' }
  const created = upsertArticle(initialArticles, draft)
  assert.match(created.article.id, /^[1-9]\d{7}$/)
  const edited = upsertArticle(created.articles, draft, '10000001')
  assert.equal(edited.article.id, '10000001')
  assert.equal('legacyIds' in edited.article, false)
  const viewed = incrementArticleViews(edited.articles, '10000001')
  assert.equal(findArticleById(viewed, '10000001').views, 1)
  assert.ok(!findArticleById(removeArticle(viewed, '10000001'), '10000001'))
  assert.throws(() => saveArticles({ setItem() {} }, [{ ...initialArticles[0], id: 'old' }]))
})
