<script setup>
defineProps({ page: { type: Number, required: true }, totalPages: { type: Number, required: true } })
defineEmits(['change'])
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="文章分页">
    <button :disabled="page === 1" aria-label="上一页" @click="$emit('change', page - 1)">←</button>
    <span>第 {{ page }} / {{ totalPages }} 页</span>
    <button :disabled="page === totalPages" aria-label="下一页" @click="$emit('change', page + 1)">→</button>
  </nav>
</template>
