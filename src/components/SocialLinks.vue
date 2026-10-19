<script setup>
import { socialLinks } from '../data/socialLinks.js'
import xIcon from '../assets/social/x.svg'
import youtubeIcon from '../assets/social/youtube.svg'
import discordIcon from '../assets/social/discord.svg'
import qqIcon from '../assets/social/qq.svg'
import githubIcon from '../assets/social/github.svg'
import { computed } from 'vue'

const visibleLinks = computed(() =>
  socialLinks.filter(link => link.href.trim())
)

const icons = { x: xIcon, youtube: youtubeIcon, discord: discordIcon, qq: qqIcon, github: githubIcon }
</script>

<template>
  <nav class="social-links" aria-label="社交媒体">
    <a v-for="link in visibleLinks" :key="link.id" class="social-button" role="link" :href="link.href || undefined" :target="link.href ? '_blank' : undefined" rel="noopener noreferrer" :aria-disabled="!link.href || undefined" :tabindex="link.href ? undefined : 0" :aria-label="link.href ? `访问 ${link.label}（新窗口打开）` : `${link.label}（链接待填写）`" :title="link.href ? link.label : `${link.label}：链接待填写`">
      <img :src="icons[link.id]" alt="" width="18" height="18" class="social-icon">
    </a>
  </nav>
</template>

<style scoped>
.social-links {
  --social-background: #151a23;
  --social-border: #252b35;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  gap: 12px;
}
.social-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border: 1px solid var(--social-border);
  border-radius: 8px;
  background: var(--social-background);
  transition: border-color .18s, background-color .18s, transform .18s;
}
.social-icon {
  display: block;
  flex: none;
  width: 18px;
  height: 18px;
  object-fit: contain;
}
.social-button:hover:not([aria-disabled="true"]) {
  border-color: var(--blue);
  transform: translateY(-2px);
}
.social-button[aria-disabled="true"] { cursor: default; }
.social-button:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 4px;
}
:global(.light) .social-links {
  --social-background: #edf1fa;
  --social-border: #cbd5e7;
}
@media (max-width: 900px) {
  .social-links { justify-content: flex-start; }
}
</style>
