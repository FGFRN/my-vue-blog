import test from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdown } from '../src/utils/markdown.js'

test('renders headings, paragraphs, emphasis, nested lists, blockquotes and rules', () => {
  const html = renderMarkdown('# 大标题\n\n## 小标题\n\n**粗体**、*斜体*、~~删除~~\n\n- 一级\n  - 二级\n\n1. 有序列表\n\n> 引用\n\n---')
  for (const fragment of ['<h1 ', '<h2 ', '<strong>粗体</strong>', '<em>斜体</em>', '<s>删除</s>', '<ul>', '<ol>', '<blockquote>', '<hr>']) assert.ok(html.includes(fragment), fragment)
})
test('renders fenced and inline code as escaped text', () => {
  const html = renderMarkdown('`<span>`\n\n```javascript\nconst html = "<script>alert(1)</script>"\n```')
  assert.ok(html.includes('<code>&lt;span&gt;</code>'))
  assert.ok(html.includes('class="language-javascript"'))
  assert.ok(html.includes('&lt;script&gt;'))
  assert.ok(!html.includes('<script>'))
})
test('renders aligned tables in a scrolling region and read-only task lists', () => {
  const html = renderMarkdown('| 功能 | 状态 |\n| :--- | ---: |\n| 列表 | 完成 |\n\n- [x] 已完成\n- [ ] 待完成')
  assert.ok(html.includes('class="markdown-table"'))
  assert.ok(html.includes('<table>'))
  assert.ok(html.includes('text-align:right'))
  assert.equal((html.match(/type="checkbox"/g) || []).length, 2)
  assert.equal((html.match(/disabled/g) || []).length, 2)
})
test('safe links, references, automatic URLs and images have correct output', () => {
  const html = renderMarkdown('[外链](https://example.com)\n\n[引用][ref]\n\n[ref]: https://example.com/docs\n\nhttps://example.com\n\n![示意图](https://example.com/image.png)')
  assert.ok(html.includes('href="https://example.com" target="_blank" rel="noopener noreferrer"'))
  assert.ok(html.includes('href="https://example.com/docs"'))
  assert.ok(html.includes('alt="示意图"'))
  assert.ok(html.includes('loading="lazy"'))
  assert.ok(html.includes('referrerpolicy="no-referrer"'))
})
test('raw HTML, event handlers and dangerous URL protocols cannot become active markup', () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[危险](javascript:alert(1))\n\n![危险](data:image/svg+xml;base64,abc)\n\n[文件](file:///etc/passwd)\n\n[混淆](jav&#x61;script:alert(1))')
  assert.ok(!/<script[\s>]/i.test(html))
  assert.ok(!/<img[\s>]/i.test(html))
  assert.ok(!/(?:href|src)="(?:javascript|data|file):/i.test(html))
  assert.ok(html.includes('&lt;script&gt;'))
})
test('heading IDs are unique and reset for each render', () => {
  const source = '## 章节\n\n## 章节\n\n## 章节-2'
  const html = renderMarkdown(source)
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1])
  assert.equal(new Set(ids).size, 3)
  assert.equal(renderMarkdown(source), html)
  assert.equal(renderMarkdown(null), '')
})
