<script setup>
import { ref } from 'vue'
const email = ref('')
const emailInput = ref(null)
const message = ref('随时来拜访，随时可退订。')
const error = ref(false)
function submit() {
  error.value = !email.value.trim() || !emailInput.value.validity.valid
  message.value = error.value ? '请输入有效的电子邮箱，例如 hello@example.com。' : '尚未接入邮件服务'
  if (error.value) emailInput.value.focus()
}
</script>

<template>
  <section id="newsletter" class="newsletter" aria-labelledby="newsletter-title"><span class="eyebrow">不定期来信</span><h2 id="newsletter-title">好想法，直达你的收件箱。</h2><p>新文章、有趣的发现，以及创作途中的随想。没有噪音。</p><form novalidate @submit.prevent="submit"><label class="sr-only" for="email">你的电子邮箱</label><div class="form-row"><input id="email" ref="emailInput" v-model="email" name="email" type="email" placeholder="你的电子邮箱" autocomplete="email" required :aria-invalid="error" aria-describedby="newsletter-message"><button class="primary-button" type="submit">我要订阅 <span aria-hidden="true">→</span></button></div><p id="newsletter-message" class="form-message" :class="{ error }" role="status">{{ message }}</p></form></section>
</template>
