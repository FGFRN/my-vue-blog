import MarkdownIt from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import { katex } from '@mdit/plugin-katex'

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
}).use(taskLists, { enabled: false }).use(katex, {
  throwOnError: false,
  trust: false,
  maxSize: 20,
  maxExpand: 1000,
  errorColor: '#ef4444',
  transformer: (html, displayMode) => displayMode
    ? `<div class="math-block" role="region" aria-label="独立公式" tabindex="0">${html}</div>`
    : html,
})

const defaultValidateLink = markdown.validateLink.bind(markdown)
markdown.validateLink = url => {
  if (!defaultValidateLink(url)) return false
  const protocol = url.trim().match(/^([a-z][a-z\d+.-]*):/i)
  return !protocol || ['http', 'https', 'mailto', 'tel'].includes(protocol[1].toLowerCase())
}

export function headingSlug(text) {
  return text.toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s+/g, '-') || 'section'
}

// IDs are generated from trusted parser tokens, never from raw HTML attributes.
markdown.core.ruler.push('article-heading-ids', state => {
  const usedIds = new Set()
  state.tokens.forEach((token, index) => {
    if (token.type !== 'heading_open') return
    const base = `md-${headingSlug(state.tokens[index + 1]?.content || '')}`
    let id = base
    let suffix = 2
    while (usedIds.has(id)) id = `${base}-${suffix++}`
    usedIds.add(id)
    token.attrSet('id', id)
  })
})

const defaultLinkOpen = markdown.renderer.rules.link_open || ((tokens, index, options, env, renderer) => renderer.renderToken(tokens, index, options))
markdown.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
  if (/^(?:https?:)?\/\//i.test(tokens[index].attrGet('href') || '')) {
    tokens[index].attrSet('target', '_blank')
    tokens[index].attrSet('rel', 'noopener noreferrer')
  }
  return defaultLinkOpen(tokens, index, options, env, renderer)
}

const defaultImage = markdown.renderer.rules.image
markdown.renderer.rules.image = (tokens, index, options, env, renderer) => {
  tokens[index].attrSet('loading', 'lazy')
  tokens[index].attrSet('decoding', 'async')
  tokens[index].attrSet('referrerpolicy', 'no-referrer')
  return defaultImage(tokens, index, options, env, renderer)
}

markdown.renderer.rules.table_open = () => '<div class="markdown-table" role="region" aria-label="文章表格" tabindex="0"><table>\n'
markdown.renderer.rules.table_close = () => '</table></div>\n'

export function renderMarkdown(source = '') {
  return markdown.render(typeof source === 'string' ? source : '')
}
