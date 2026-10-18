<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import SearchDialog from './components/SearchDialog.vue'
import { useBlog } from './stores/blog.js'

const searchOpen = ref(false)
const light = ref(false)
const { storageWarning } = useBlog()
function skipToMain() {
  const main = document.getElementById('main')
  main?.setAttribute('tabindex', '-1')
  main?.focus()
}
onMounted(() => { try { light.value = localStorage.getItem('fgfrn-theme') === 'light' } catch {} })
watch(light, value => {
  document.documentElement.classList.toggle('light', value)
  try { localStorage.setItem('fgfrn-theme', value ? 'light' : 'dark') } catch {}
})
</script>

<template>
  <button class="skip-link" @click="skipToMain">跳到正文</button>
  <AppHeader :light="light" @toggle-theme="light = !light" @search="searchOpen = true" />
  <p v-if="storageWarning" class="container storage-warning" role="status">{{ storageWarning }}</p>
  <RouterView />
  <AppFooter />
  <SearchDialog v-model:open="searchOpen" />
</template>
