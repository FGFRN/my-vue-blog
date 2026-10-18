<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
const props = defineProps({ open: Boolean, label: { type: String, required: true } })
const emit = defineEmits(['update:open'])
const dialog = ref(null)
let previousOverflow = ''
let locked = false
function unlock() { if (locked) { document.body.style.overflow = previousOverflow; locked = false } }
watch(() => props.open, async open => {
  await nextTick()
  if (!dialog.value) return
  if (open && !dialog.value.open) {
    previousOverflow = document.body.style.overflow
    locked = true
    document.body.style.overflow = 'hidden'
    dialog.value.showModal()
  } else if (!open && dialog.value.open) dialog.value.close()
}, { immediate: true })
function closed() { unlock(); emit('update:open', false) }
function backdrop(event) {
  if (event.target !== dialog.value) return
  const rect = dialog.value.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) emit('update:open', false)
}
onBeforeUnmount(unlock)
</script>

<template>
  <dialog ref="dialog" :aria-label="label" @close="closed" @cancel.prevent="emit('update:open', false)" @click="backdrop">
    <div class="dialog-top"><h2>{{ label }}</h2><button class="icon-button close-dialog" aria-label="关闭弹窗" @click="emit('update:open', false)">×</button></div>
    <slot />
  </dialog>
</template>
