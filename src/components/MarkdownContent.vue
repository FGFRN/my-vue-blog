<script setup>
import { computed, ref } from 'vue'
import 'katex/dist/katex.min.css'
import '../article-font.css'
import { headingSlug, renderMarkdown } from '../utils/markdown.js'

const props = defineProps({ content: { type: String, default: '' } })
const body = ref(null)
const html = computed(() => renderMarkdown(props.content))

function followHeading(event) {
  const link = event.target.closest('a')
  const href = link?.getAttribute('href')
  if (!href?.startsWith('#') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  // Keep in-article anchors from replacing the Vue Router hash route.
  event.preventDefault()
  let fragment
  try { fragment = decodeURIComponent(href.slice(1)) } catch { return }
  const headings = [...body.value.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')]
  const target = headings.find(heading => heading.id === fragment) || headings.find(heading => heading.id === `md-${headingSlug(fragment)}`)
  if (target) {
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  }
}
</script>

<template>
  <!-- Only parser-generated HTML is inserted; raw HTML input is disabled. -->
  <div ref="body" class="markdown-body" v-html="html" @click="followHeading"></div>
</template>

<style scoped>
.markdown-body{color:var(--muted);font-size:16px;line-height:1.95;overflow-wrap:anywhere}
.markdown-body{font-family:var(--article-font-family)}
.markdown-body :deep(.math-block){max-width:100%;overflow-x:auto;overflow-y:hidden;margin:1.5em 0;overflow-wrap:normal}
.markdown-body :deep(.katex-display){min-width:max-content;margin:1em 0}
.markdown-body :deep(.katex){overflow-wrap:normal;word-break:normal}
.markdown-body :deep(> :first-child){margin-top:0}
.markdown-body :deep(h1),.markdown-body :deep(h2),.markdown-body :deep(h3),.markdown-body :deep(h4),.markdown-body :deep(h5),.markdown-body :deep(h6){color:var(--text);font-weight:550;line-height:1.5;letter-spacing:0;margin:1.7em 0 .65em;scroll-margin-top:30px}
.markdown-body :deep(h1){font-size:30px}.markdown-body :deep(h2){font-size:25px}.markdown-body :deep(h3){font-size:21px}.markdown-body :deep(h4){font-size:18px}.markdown-body :deep(h5),.markdown-body :deep(h6){font-size:16px}
.markdown-body :deep(p){margin:1em 0;white-space:normal}
.markdown-body :deep(strong){font-weight:650;color:var(--text)}
.markdown-body :deep(a){color:var(--blue);text-decoration:underline;text-underline-offset:4px}.markdown-body :deep(a:hover){text-decoration-thickness:2px}
.markdown-body :deep(ul),.markdown-body :deep(ol){margin:1em 0;padding-left:1.6em}.markdown-body :deep(li){margin:.35em 0}.markdown-body :deep(li>ul),.markdown-body :deep(li>ol){margin:.35em 0}
.markdown-body :deep(blockquote){margin:1.5em 0;padding:.2em 1.2em;border-left:3px solid var(--blue);background:var(--surface);border-radius:0 6px 6px 0}.markdown-body :deep(blockquote p){margin:.6em 0}
.markdown-body :deep(code){font-family:"Cascadia Code",Consolas,monospace;font-size:.88em;color:var(--text);background:var(--surface-hover);border-radius:4px;padding:.15em .4em}
.markdown-body :deep(pre){margin:1.5em 0;padding:20px;max-width:100%;overflow-x:auto;border:1px solid var(--border);background:var(--surface);border-radius:8px;line-height:1.7;tab-size:2;overflow-wrap:normal;white-space:pre}
.markdown-body :deep(pre code){padding:0;background:none;border-radius:0;font-size:13px;color:var(--text);white-space:inherit;word-break:normal}
.markdown-body :deep(img){display:block;width:auto;height:auto;max-width:100%;object-fit:contain;border-radius:6px;margin:24px auto}
.markdown-body :deep(hr){border:0;border-top:1px solid var(--border);margin:2em 0}
.markdown-body :deep(.markdown-table){max-width:100%;overflow-x:auto;margin:1.5em 0;border:1px solid var(--border);border-radius:6px}
.markdown-body :deep(table){border-collapse:collapse;width:100%;font-size:14px}.markdown-body :deep(th),.markdown-body :deep(td){padding:10px 15px;border:1px solid var(--border);white-space:normal;min-width:100px}.markdown-body :deep(th){background:var(--surface-hover);color:var(--text);font-weight:550}.markdown-body :deep(tr:nth-child(even)){background:var(--surface)}
.markdown-body :deep(.contains-task-list){padding-left:1.35em}.markdown-body :deep(.task-list-item){list-style:none}.markdown-body :deep(.task-list-item-checkbox){width:15px;height:15px;margin:0 8px 0 -1.25em;vertical-align:middle;accent-color:var(--accent)}
@media(max-width:760px){.markdown-body{font-size:15px}.markdown-body :deep(h1){font-size:26px}.markdown-body :deep(h2){font-size:22px}.markdown-body :deep(h3){font-size:19px}.markdown-body :deep(pre){padding:15px}.markdown-body :deep(pre code){font-size:12px}}
</style>
