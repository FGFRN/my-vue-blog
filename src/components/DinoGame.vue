<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { createGame, GROUND, jump, step } from '../utils/dinoEngine.js'

const canvas = ref(null)
const arena = ref(null)
const state = ref('ready')
const score = ref(0)
const best = ref(0)
const storageNote = ref('')
const announcement = ref('准备好了就出发吧。')
let game = createGame()
let frame = 0
let previousTime = 0
let resizeObserver
let context
const actionLabel = computed(() => ({ ready: '开始奔跑', running: '跳跃 ↑', paused: '继续游戏', over: '再跑一次 ↻' })[state.value])

function stopFrame() { cancelAnimationFrame(frame); frame = 0; previousTime = 0 }
function schedule() { if (!frame) frame = requestAnimationFrame(tick) }
function finish() {
  state.value = 'over'
  if (score.value > best.value) {
    best.value = score.value
    try { localStorage.setItem('fgfrn-dino-best-v1', String(best.value)) }
    catch { storageNote.value = '最高分仅在本次页面中保留。' }
  }
  announcement.value = `撞到轮胎了！本次 ${score.value} 分，可以再试一次。`
}
function tick(time) {
  frame = 0
  if (state.value !== 'running') return
  const dt = previousTime ? (time - previousTime) / 1000 : 0
  previousTime = time
  step(game, dt)
  score.value = Math.floor(game.elapsed * 10)
  if (game.over) finish()
  draw()
  if (state.value === 'running') schedule()
}
function action() {
  if (state.value === 'ready' || state.value === 'over') {
    stopFrame()
    game = createGame(arena.value.clientWidth)
    score.value = 0
    state.value = 'running'
    announcement.value = '出发！按空格、向上键，或者点击游戏区域跳跃。'
    schedule()
  } else if (state.value === 'paused') {
    state.value = 'running'
    announcement.value = '继续奔跑。'
    previousTime = 0
    schedule()
  } else jump(game)
  nextTick(() => arena.value?.focus({ preventScroll: true }))
}
function pause() {
  if (state.value !== 'running') return
  state.value = 'paused'
  stopFrame()
  announcement.value = '游戏已暂停，点击继续游戏即可恢复。'
  draw()
}
function keydown(event) {
  if (event.target !== arena.value) return
  if (['Space', 'ArrowUp', 'Enter'].includes(event.code)) {
    event.preventDefault()
    if (!event.repeat) action()
  } else if (event.code === 'Escape' || event.code === 'KeyP') {
    event.preventDefault()
    if (state.value === 'running') pause()
    else if (state.value === 'paused') action()
  }
}
function blur(event) { if (!event.currentTarget.contains(event.relatedTarget)) pause() }
function visibility() { if (document.hidden) pause() }
function resize() {
  const width = arena.value.clientWidth
  if (!width) return
  if (game.width !== width) {
    pause()
    for (const obstacle of game.obstacles) obstacle.x *= width / game.width
    game.width = width
  }
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.value.width = Math.round(width * ratio)
  canvas.value.height = Math.round(240 * ratio)
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  draw()
}
function drawCat(x, y, color) {
  const stride = state.value === 'running' && game.player.velocity === 0 ? Math.floor(game.elapsed * 12) % 2 : 0
  context.fillStyle = color
  // Curled tail, long body, triangular ears and a forward-facing muzzle.
  context.fillRect(x, y + 12 - stride * 3, 3, 12)
  context.fillRect(x + 3, y + 21, 9, 6)
  context.fillRect(x + 9, y + 15, 27, 15)
  context.fillRect(x + 27, y + 6, 18, 18)
  context.fillRect(x + 27, y, 3, 9)
  context.fillRect(x + 30, y + 3, 3, 6)
  context.fillRect(x + 42, y, 3, 9)
  context.fillRect(x + 39, y + 3, 3, 6)
  context.fillRect(x + 42, y + 15, 6, 6)
  const airborne = game.player.velocity !== 0
  for (const [leg, extended] of [[12, stride === 0], [27, stride === 1]]) {
    const length = airborne ? 3 : extended ? 6 : 3
    context.fillRect(x + leg, y + 30, 6, length)
    context.fillRect(x + leg + 3, y + 27 + length, 6, 3)
  }
  context.fillStyle = '#e5a3b7'
  context.fillRect(x + 30, y + 6, 3, 3)
  context.fillRect(x + 39, y + 6, 3, 3)
  context.fillStyle = '#101827'
  context.fillRect(x + 39, y + 12, 3, 3)
  context.fillRect(x + 45, y + 18, 3, 3)
}
function drawTire(obstacle, color, muted) {
  const radius = obstacle.width / 2
  context.save()
  context.translate(obstacle.x + radius, obstacle.y + radius)
  context.rotate(-game.distance / radius)
  context.strokeStyle = color
  context.lineWidth = 7
  context.beginPath()
  context.arc(0, 0, radius - 4, 0, Math.PI * 2)
  context.stroke()
  context.strokeStyle = muted
  context.lineWidth = 1.5
  context.beginPath()
  context.arc(0, 0, radius - 9, 0, Math.PI * 2)
  context.stroke()
  // Radial grooves show the tire rolling as it approaches.
  for (let i = 0; i < 10; i++) {
    const angle = i * Math.PI / 5
    context.beginPath()
    context.moveTo(Math.cos(angle) * (radius - 1), Math.sin(angle) * (radius - 1))
    context.lineTo(Math.cos(angle + 0.15) * (radius - 6), Math.sin(angle + 0.15) * (radius - 6))
    context.stroke()
  }
  context.restore()
}
function draw() {
  if (!context) return
  const style = getComputedStyle(arena.value)
  const muted = style.getPropertyValue('--subtle').trim() || '#686f7d'
  const blue = style.getPropertyValue('--blue').trim() || '#7e9eff'
  const text = style.getPropertyValue('--text').trim() || '#e9ebf1'
  context.clearRect(0, 0, game.width, 240)
  context.strokeStyle = muted
  context.globalAlpha = 0.5
  context.lineWidth = 1
  context.beginPath(); context.moveTo(0, GROUND + 1); context.lineTo(game.width, GROUND + 1); context.stroke()
  for (let x = 0; x < game.width + 90; x += 87) {
    const offset = ((x - game.distance) % (game.width + 90) + game.width + 90) % (game.width + 90)
    context.fillStyle = muted
    context.fillRect(offset, 204, 12, 1)
    context.fillRect(offset + 30, 217, 4, 1)
  }
  // A few static, quiet clouds keep the playground visually light.
  context.strokeStyle = muted
  for (const x of [game.width * 0.32, game.width * 0.77]) {
    context.beginPath(); context.moveTo(x, 62); context.lineTo(x + 13, 62); context.lineTo(x + 17, 53); context.lineTo(x + 30, 53); context.lineTo(x + 35, 62); context.lineTo(x + 47, 62); context.stroke()
  }
  context.globalAlpha = 1
  drawCat(game.player.x, game.player.y, '#F5A623')
  for (const obstacle of game.obstacles) drawTire(obstacle, text, muted)
}
onMounted(() => {
  try {
    const stored = Number(localStorage.getItem('fgfrn-dino-best-v1'))
    best.value = Number.isSafeInteger(stored) && stored >= 0 ? stored : 0
  } catch { storageNote.value = '最高分仅在本次页面中保留。' }
  context = canvas.value.getContext('2d')
  if (!context) { state.value = 'unavailable'; announcement.value = '当前浏览器不支持游戏画布，你仍可以返回首页。'; return }
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(arena.value)
  document.addEventListener('visibilitychange', visibility)
})
onBeforeUnmount(() => { stopFrame(); resizeObserver?.disconnect(); document.removeEventListener('visibilitychange', visibility) })
</script>

<template>
  <section class="dino-game" aria-labelledby="dino-title" @focusout="blur">
    <div class="game-top">
      <h2 id="dino-title"><span aria-hidden="true">✦</span> 嗷呜嗷呜轰隆隆！</h2>
      <div class="game-scores"><span>得分 <strong>{{ String(score).padStart(5, '0') }}</strong></span><span>最佳 <strong>{{
        String(best).padStart(5, '0') }}</strong></span></div>
    </div>
    <div ref="arena" class="game-arena" tabindex="0" role="group" aria-label="小猫游戏区域"
      aria-describedby="dino-instructions" @keydown="keydown" @pointerdown.prevent="action">
      <canvas ref="canvas" aria-label="小猫跳跃躲避轮胎，使用下方按钮或键盘操作">你的浏览器不支持画布。</canvas>
      <div v-if="state !== 'running'" class="game-overlay" aria-hidden="true"><span class="game-status">{{ {
        ready:
          'READY TO EXPLORE', paused: 'TAKE A BREATH', over: 'GAME OVER', unavailable: 'UNAVAILABLE'
      }[state]
          }}</span><strong>{{ {
            ready: '哈基米过马路', paused: '喵？', over: '老吴！', unavailable: '暂时无法启动游戏'
          }[state] }}</strong></div>
    </div>
    <div class="game-controls">
      <p id="dino-instructions"><kbd>空格</kbd> / <kbd>↑</kbd> 跳跃 · <kbd>P</kbd> 暂停<br>手机点击游戏区域或下方按钮操作</p>
      <div class="game-buttons"><button v-if="state === 'running'" class="secondary-button"
          @click="pause">暂停</button><button class="primary-button" :disabled="state === 'unavailable'"
          @click="action">{{ actionLabel }}</button></div>
    </div>
    <p class="sr-only" role="status" aria-live="polite">{{ announcement }}</p>
    <p v-if="storageNote" class="game-storage">{{ storageNote }}</p>
  </section>
</template>

<style scoped>
.dino-game {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 12px;
  overflow: hidden;
  text-align: left;
  margin: 34px auto 28px;
  max-width: 900px
}

.game-top {
  padding: 22px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid var(--border)
}

.game-top h2 {
  font-size: 14px;
  font-weight: 500
}

.game-top h2 span {
  color: var(--blue);
  margin-right: 8px
}

.game-scores {
  display: flex;
  gap: 24px;
  white-space: nowrap;
  font-size: 10px;
  color: var(--muted)
}

.game-scores strong {
  color: var(--text);
  font-family: Consolas, monospace;
  font-size: 14px;
  margin-left: 6px;
  font-weight: 400;
  font-variant-numeric: tabular-nums
}

.game-arena {
  position: relative;
  width: 100%;
  height: 240px;
  cursor: pointer;
  touch-action: manipulation;
  outline-offset: -3px;
  overflow: hidden
}

.game-arena canvas {
  display: block;
  width: 100%;
  height: 240px
}

.game-overlay {
  position: absolute;
  inset: 0 12px 65px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  pointer-events: none;
  text-align: center
}

.game-status {
  font: 10px Consolas, monospace;
  letter-spacing: .2em;
  color: var(--blue)
}

.game-overlay strong {
  font-size: 20px;
  font-weight: 400;
  color: var(--text)
}

.game-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 18px 26px 24px
}

.game-controls p {
  font-size: 11px;
  color: var(--muted);
  line-height: 2
}

kbd {
  font: 10px inherit;
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 2px 5px
}

.game-buttons {
  display: flex;
  gap: 10px
}

.game-storage {
  padding: 0 26px 16px;
  color: var(--muted);
  font-size: 11px
}

@media(max-width:600px) {
  .game-top {
    padding: 18px;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px
  }

  .game-top h2 {
    font-size: 13px
  }

  .game-scores {
    gap: 22px
  }

  .game-controls {
    padding: 16px 18px 20px;
    flex-direction: column;
    align-items: stretch;
    gap: 18px
  }

  .game-buttons {
    justify-content: flex-end
  }

  .game-buttons>.primary-button {
    flex: 1;
    justify-content: center
  }

  .game-overlay strong {
    font-size: 17px
  }

  .game-overlay {
    inset-inline: 26px
  }
}
</style>
