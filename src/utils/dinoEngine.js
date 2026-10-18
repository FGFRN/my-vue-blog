export const GROUND = 190
const GRAVITY = 1900
const JUMP_SPEED = -620

export function createGame(width = 900) {
  return {
    width, elapsed: 0, distance: 0, spawnIn: 1.5, over: false,
    player: { x: 44, y: GROUND - 36, width: 48, height: 36, velocity: 0 },
    obstacles: [],
  }
}

export function jump(game) {
  if (!game.over && game.player.y >= GROUND - game.player.height - 0.1) {
    game.player.velocity = JUMP_SPEED
    return true
  }
  return false
}

export function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

export function tireHitsPlayer(player, tire) {
  const radius = tire.width / 2
  const centerX = tire.x + radius
  const centerY = tire.y + radius
  const nearestX = Math.max(player.x, Math.min(centerX, player.x + player.width))
  const nearestY = Math.max(player.y, Math.min(centerY, player.y + player.height))
  // Rounded corners should not collide as though the tire were a solid square.
  return (centerX - nearestX) ** 2 + (centerY - nearestY) ** 2 < (radius - 2) ** 2
}

export function step(game, delta, random = Math.random) {
  if (game.over) return
  const dt = Math.min(Math.max(delta, 0), 0.04)
  game.elapsed += dt
  const speed = Math.min(Math.max(200, game.width * 0.34) + game.elapsed * 3, 440)
  game.distance += speed * dt
  game.player.velocity += GRAVITY * dt
  game.player.y = Math.min(GROUND - game.player.height, game.player.y + game.player.velocity * dt)
  if (game.player.y >= GROUND - game.player.height) game.player.velocity = 0
  game.spawnIn -= dt
  if (game.spawnIn <= 0) {
    const diameter = 32 + Math.floor(random() * 13)
    game.obstacles.push({ x: game.width + 20, y: GROUND - diameter, width: diameter, height: diameter })
    game.spawnIn = 1.25 + random() * 0.65
  }
  for (const obstacle of game.obstacles) obstacle.x -= speed * dt
  game.obstacles = game.obstacles.filter(obstacle => obstacle.x + obstacle.width > 0)
  // Slightly inset hitboxes make the silhouette's empty pixels forgiving.
  const playerBox = { x: game.player.x + 8, y: game.player.y + 4, width: game.player.width - 16, height: game.player.height - 6 }
  game.over = game.obstacles.some(obstacle => tireHitsPlayer(playerBox, obstacle))
}
