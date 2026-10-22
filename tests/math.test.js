import test from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdown } from '../src/utils/markdown.js'

test('inline and display formulas include accessible MathML', () => {
  const html = renderMarkdown('公式 $E=mc^2$。\n\n$$\n\\frac{a}{b} + \\sqrt{x}\n$$')
  assert.ok(html.includes('katex-mathml'))
  assert.ok(html.includes('class="math-block"'))
  assert.ok(html.includes('katex-display'))
})

test('invalid math does not prevent subsequent content rendering', () => {
  const html = renderMarkdown('$\\frac{1}{$\n\n后续正文')
  assert.ok(html.includes('katex-error'))
  assert.ok(html.includes('<p>后续正文</p>'))
})

test('code and escaped dollars stay literal', () => {
  const html = renderMarkdown('`$x$`\n\n```text\n$x$\n```\n\n\\$100')
  assert.ok(!html.includes('class="katex"'))
  assert.ok(html.includes('$100'))
})

test('math cannot introduce executable links or HTML attributes', () => {
  const html = renderMarkdown('$\\href{javascript:alert(1)}{x}$\n\n$\\htmlClass{injected}{x}$')
  assert.ok(!/href="javascript:/i.test(html))
  assert.ok(!html.includes('class="injected"'))
})
