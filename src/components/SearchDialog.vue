<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BaseDialog from './BaseDialog.vue'
import { useBlog } from '../stores/blog.js'
import { filterArticles } from '../utils/articleRepository.js'
const props = defineProps({ open: Boolean })
const emit = defineEmits(['update:open'])
const query = ref('')
const { sortedArticles } = useBlog()
const route = useRoute()
const results = computed(() => filterArticles(sortedArticles.value, { query: query.value }))
watch(() => props.open, open => { if (open) query.value = '' })
watch(() => route.fullPath, () => emit('update:open', false))
</script>

<template>
  <BaseDialog :open="open" label="搜索手记" class="search-dialog" @update:open="emit('update:open', $event)">
    <label class="sr-only" for="search-input">输入标题、标签或关键词</label><input id="search-input" v-model="query" type="search"
      placeholder="搜索标题、标签或关键词…" autocomplete="off" autofocus>
    <div aria-live="polite">
      <RouterLink v-for="article in results" :key="article.id" class="search-result" :to="`/articles/${article.id}`"
        @click="emit('update:open', false)">{{ article.title }}<small>{{ article.tags.join(' · ') || '未添加标签' }} · {{
          article.date }}</small></RouterLink>
      <p v-if="!results.length" class="empty-search">没有找到相关文章，换个关键词试试。</p>
    </div>
    <p class="search-hint">按 Esc 关闭</p>
  </BaseDialog>
</template>
