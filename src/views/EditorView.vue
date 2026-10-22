<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { covers } from '../data/media.js'
import { useBlog } from '../stores/blog.js'
import BaseDialog from '../components/BaseDialog.vue'
import TagSelect from '../components/TagSelect.vue'
import { mergeTags } from '../utils/tags.js'

const route = useRoute()
const router = useRouter()
const { findArticle, saveArticle, availableTags, tagWarning, addTag } = useBlog()
const editing = computed(() => route.name === 'edit-article')
const missing = ref(false)
const draft = reactive({ title: '', tags: [], excerpt: '', content: '', cover: 'quiet' })
const error = ref('')
const saved = ref('')
const form = ref(null)
const baseline = ref('')
let resolveLeave
const leaveOpen = ref(false)
watch(() => route.fullPath, () => {
  const existing = editing.value ? findArticle(route.params.id) : null
  missing.value = editing.value && !existing
  Object.assign(draft, existing ? { title: existing.title, tags: [...existing.tags], excerpt: existing.excerpt, content: existing.content, cover: existing.cover } : { title: '', tags: [], excerpt: '', content: '', cover: 'quiet' })
  baseline.value = JSON.stringify(draft)
  error.value = ''; saved.value = ''
}, { immediate: true })
const dirty = computed(() => JSON.stringify(draft) !== baseline.value)
const characterCount = computed(() => draft.content.length)
onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  leaveOpen.value = true
  return new Promise(resolve => { resolveLeave = resolve })
})
function finishLeave(leave) { leaveOpen.value = false; resolveLeave?.(leave); resolveLeave = undefined }
watch(leaveOpen, open => { if (!open && resolveLeave) finishLeave(false) })
function createTag(name) {
  const tag = addTag(name)
  draft.tags = mergeTags(draft.tags, [tag])
}
function submit() {
  saved.value = ''; error.value = ''
  if (!form.value.reportValidity()) return
  try {
    const result = saveArticle(draft, editing.value ? route.params.id : undefined)
    baseline.value = JSON.stringify(draft)
    if (result.persisted) router.push('/admin')
    else {
      saved.value = '文章已在本次页面中更新，但本地存储不可用，刷新后可能丢失。'
      if (!editing.value) router.replace(`/admin/edit/${result.id}`)
    }
  } catch (reason) { error.value = reason.message }
}
</script>

<template>
  <main id="main" class="container editor-page">
    <RouterLink to="/admin" class="text-link">← 返回文章管理</RouterLink>
    <header class="page-heading">
      <div>
        <p class="eyebrow">写作 / EDITOR</p>
        <h1>{{ editing ? '编辑文章' : '写下新的想法' }}</h1>
      </div>
    </header>
    <section v-if="missing" class="empty-state">
      <h2>这篇文章不存在</h2>
      <RouterLink to="/admin" class="text-link">返回文章管理 →</RouterLink>
    </section>
    <form v-else ref="form" class="editor-form" @submit.prevent="submit">
      <label for="article-title">文章标题 <span>必填，最多100字</span></label><input id="article-title" v-model="draft.title"
        required maxlength="100" placeholder="给这个想法起一个名字">
      <label for="article-tags">标签 <span>可多选</span></label>
      <TagSelect v-model="draft.tags" :options="availableTags" @create="createTag" />
      <p v-if="tagWarning" class="form-error" role="status">{{ tagWarning }}</p>
      <label for="article-excerpt">文章摘要 <span>必填，最多200字</span></label><textarea id="article-excerpt"
        v-model="draft.excerpt" required maxlength="200" rows="3" placeholder="用几句话介绍这篇文章"></textarea>
      <fieldset class="cover-options">
        <legend>封面插图</legend><label v-for="cover in covers" :key="cover.id"
          :class="{ selected: draft.cover === cover.id }"><input v-model="draft.cover" type="radio" name="cover"
            :value="cover.id"><img :src="cover.src" :alt="cover.alt"><span>{{ cover.label }}</span></label>
      </fieldset>
      <label for="article-content">正文 <span>必填，最多30,000字</span></label>
      <p id="content-help" class="editor-help">支持 Markdown：标题、粗体、列表、引用、代码块、链接、图片、表格和任务清单。段落之间空一行，原始 HTML 不会执行。</p><textarea
        id="article-content" v-model="draft.content" required maxlength="30000" rows="16"
        aria-describedby="content-help" placeholder="从这里开始…"></textarea>
      <p class="editor-count">{{ characterCount }} 字 · 预计阅读 {{ Math.max(1, Math.ceil(characterCount / 350)) }} 分钟</p>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <p v-if="saved" class="action-notice" role="status">{{ saved }}</p>
      <div class="editor-actions">
        <RouterLink class="secondary-button" to="/admin">取消</RouterLink><button class="primary-button" type="submit">{{
          editing ? '保存修改' : '发布文章' }} →</button>
      </div>
    </form>
    <BaseDialog v-model:open="leaveOpen" label="离开编辑页面？">
      <p>你有尚未保存的修改，离开后会丢失。</p>
      <div class="dialog-actions"><button class="secondary-button" autofocus
          @click="finishLeave(false)">继续编辑</button><button class="danger-button"
          @click="finishLeave(true)">放弃修改并离开</button></div>
    </BaseDialog>
  </main>
</template>

