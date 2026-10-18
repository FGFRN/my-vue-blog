import test from 'node:test'
import assert from 'node:assert/strict'
import { createGame, GROUND, jump, overlaps, step, tireHitsPlayer } from '../src/utils/dinoEngine.js'

test('jump cannot repeat in midair and lands back on the ground', () => {
  const game = createGame()
  assert.equal(jump(game), true)
  step(game, .016)
  assert.ok(game.player.y < GROUND - game.player.height)
  assert.equal(jump(game), false)
  for (let i = 0; i < 60; i++) step(game, .016)
  assert.equal(game.player.y, GROUND - game.player.height)
  assert.equal(jump(game), true)
})
test('collision ends a run and no further simulation advances', () => {
  const game = createGame()
  game.obstacles.push({ x: 52, y: GROUND - 40, width: 40, height: 40 })
  step(game, .016)
  assert.equal(game.over, true)
  const elapsed = game.elapsed
  step(game, .016)
  assert.equal(game.elapsed, elapsed)
})
test('cat jump clears a tire and tab-delay deltas are bounded', () => {
  const game = createGame()
  jump(game)
  for (let i = 0; i < 15; i++) step(game, .016)
  game.obstacles.push({ x: 60, y: GROUND - 40, width: 40, height: 40 })
  step(game, .016)
  assert.equal(game.over, false)
  const elapsed = game.elapsed
  step(game, 100)
  assert.ok(game.elapsed - elapsed <= .041)
})
test('tire collision follows its round silhouette rather than square corners', () => {
  const tire = { x: 0, y: 0, width: 40, height: 40 }
  assert.equal(tireHitsPlayer({ x: 0, y: 0, width: 3, height: 3 }, tire), false)
  assert.equal(tireHitsPlayer({ x: 14, y: 14, width: 12, height: 12 }, tire), true)
  assert.equal(tireHitsPlayer({ x: 41, y: 14, width: 10, height: 12 }, tire), false)
})
test('spawned tires have equal width and height and rest on the ground', () => {
  const game = createGame()
  game.spawnIn = 0
  step(game, .016, () => 0.5)
  assert.equal(game.obstacles.length, 1)
  assert.equal(game.obstacles[0].width, game.obstacles[0].height)
  assert.equal(game.obstacles[0].y + game.obstacles[0].height, GROUND)
})
test('touching bounds do not collide, overlapping bounds do', () => {
  const box = { x: 0, y: 0, width: 10, height: 10 }
  assert.equal(overlaps(box, { ...box, x: 10 }), false)
  assert.equal(overlaps(box, { ...box, x: 9 }), true)
})
