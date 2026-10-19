<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { mergeTags, validateTagName } from '../utils/tags.js'

const props = defineProps({ modelValue: { type: Array, required: true }, options: { type: Array, required: true }, id: { type: String, default: 'article-tags' } })
const emit = defineEmits(['update:modelValue', 'create'])
const root = ref(null)
const trigger = ref(null)
const input = ref(null)
const open = ref(false)
const creating = ref(false)
const name = ref('')
const error = ref('')
const status = ref('')
const choices = computed(() => mergeTags(props.options, props.modelValue))
const selected = computed({ get: () => props.modelValue, set: value => emit('update:modelValue', mergeTags(value)) })
function close() { open.value = false; creating.value = false; error.value = ''; name.value = '' }
function outside(event) { if (!root.value?.contains(event.target)) close() }
async function addRow() { creating.value = true; error.value = ''; await nextTick(); input.value?.focus() }
function add() {
  try {
    const tag = validateTagName(name.value)
    if (choices.value.includes(tag)) {
      selected.value = [...props.modelValue, tag]
      status.value = `已选择已有标签“${tag}”。`
    } else { emit('create', tag); status.value = `已添加并选择标签“${tag}”。` }
    creating.value = false; name.value = ''; error.value = ''
    nextTick(() => trigger.value?.focus())
  } catch (reason) { error.value = reason.message; input.value?.focus() }
}
function remove(tag) { selected.value = props.modelValue.filter(value => value !== tag) }
function escape(event) { if (!open.value) return; event.stopPropagation(); event.preventDefault(); close(); trigger.value?.focus() }
onMounted(() => { document.addEventListener('pointerdown', outside); document.addEventListener('focusin', outside) })
onBeforeUnmount(() => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside) })
</script>

<template>
  <div ref="root" class="tag-picker" @keydown.esc="escape">
    <button :id="id" ref="trigger" type="button" class="tag-trigger" :aria-expanded="open" :aria-controls="`${id}-panel`" :aria-describedby="`${id}-hint`" @click="open ? close() : open = true" @keydown.down.prevent="open = true">
      <span :class="{ placeholder: !modelValue.length }">{{ modelValue.length ? `已选 ${modelValue.length} 个标签：${modelValue.join(' · ')}` : '选择文章标签（可多选）' }}</span><span class="chevron" aria-hidden="true">{{ open ? '▴' : '▾' }}</span>
    </button>
    <div v-if="open" :id="`${id}-panel`" class="tag-panel">
      <div class="tag-options" role="group" aria-label="可选标签">
        <label v-for="tag in choices" :key="tag" class="tag-option"><input v-model="selected" type="checkbox" :value="tag"><span>{{ tag }}</span></label>
        <p v-if="!choices.length" class="no-tags">还没有标签，可以在下方添加。</p>
      </div>
      <div class="tag-add-row">
        <button v-if="!creating" type="button" class="add-tag-button" @click="addRow">＋ 添加标签</button>
        <div v-else class="tag-create"><label class="sr-only" :for="`${id}-new`">新标签名称</label><div class="create-controls"><input :id="`${id}-new`" ref="input" v-model="name" maxlength="20" placeholder="输入新标签，最多20字" :aria-invalid="Boolean(error)" :aria-describedby="`${id}-error`" @keydown.enter.prevent="add"><button type="button" class="primary-button" @click="add">添加</button></div><p v-if="error" :id="`${id}-error`" class="tag-error" role="alert">{{ error }}</p></div>
      </div>
    </div>
    <div v-if="modelValue.length" class="selected-tags"><span v-for="tag in modelValue" :key="tag" class="selected-tag">{{ tag }}<button type="button" :aria-label="`移除标签：${tag}`" @click="remove(tag)">×</button></span></div>
    <p :id="`${id}-hint`" class="tag-hint">勾选多个标签；没有合适的标签时，选择列表末尾的“＋ 添加标签”。</p>
    <p class="sr-only" role="status">{{ status }}</p>
  </div>
</template>

<style scoped>
.tag-picker{position:relative;min-width:0}.tag-trigger{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;min-height:48px;text-align:left;padding:12px 15px;background:var(--surface);border:1px solid var(--border);border-radius:5px;font-size:14px;line-height:1.8}.tag-trigger>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.placeholder,.chevron{color:var(--muted)}.tag-trigger[aria-expanded=true]{border-color:var(--blue)}.tag-panel{position:absolute;top:50px;left:0;right:0;z-index:30;background:var(--surface);border:1px solid var(--border);border-radius:8px;box-shadow:0 16px 45px #0005;overflow:hidden}.tag-options{max-height:240px;overflow-y:auto;padding:7px}.tag-option{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:5px;min-height:44px;cursor:pointer}.tag-option:hover{background:var(--surface-hover)}.tag-option input[type=checkbox]{appearance:auto;flex:none;width:16px;height:16px;margin:0;accent-color:var(--accent)}.tag-picker .tag-option>span{font-size:13px;color:var(--text);margin:0}.tag-add-row{border-top:1px solid var(--border);padding:8px}.add-tag-button{display:block;text-align:left;width:100%;padding:10px 12px;min-height:44px;color:var(--blue);font-size:13px;border-radius:5px}.add-tag-button:hover{background:var(--surface-hover)}.tag-create{padding:5px}.create-controls{display:flex;align-items:stretch;gap:9px}.tag-picker .tag-create input{flex:1;width:0;min-width:0;font-size:13px;padding:9px 10px}.tag-create .primary-button{font-size:12px;padding:9px 15px;min-height:44px}.tag-error{color:#ef9595;font-size:12px;margin-top:6px}.selected-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.selected-tag{display:inline-flex;align-items:center;gap:8px;padding:2px 8px 2px 10px;border:1px solid var(--border);border-radius:5px;font-size:12px;color:var(--blue);background:var(--surface)}.selected-tag button{display:inline-flex;align-items:center;justify-content:center;width:28px;height:30px;font-size:18px;border-radius:4px;color:var(--muted)}.selected-tag button:hover{background:var(--surface-hover);color:var(--text)}.tag-hint,.no-tags{font-size:11px;color:var(--muted);line-height:1.8;margin-top:8px}.no-tags{padding:8px 12px}.chevron{flex:none}@media(max-width:600px){.tag-trigger{font-size:13px}.tag-options{max-height:200px}}
</style>


