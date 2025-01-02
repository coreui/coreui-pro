// Shim for requestAnimationFrame with setTimeout fallback
const requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function (callback) {
    return window.setTimeout(callback, 1000 / 60)
  }

// Snowflake class
class Snowflake {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.reset()
  }

  // Reset snowflake to a new random position and velocity
  reset() {
    this.x = Math.random() * this.width
    this.y = Math.random() * -this.height
    this.vy = 1 + (Math.random() * 3)
    this.vx = 0.5 - Math.random()
    this.r = 1 + (Math.random() * 2)
    this.o = 0.5 + (Math.random() * 0.5)
  }

  // Move the snowflake
  updatePosition() {
    this.y += this.vy
    this.x += this.vx
  }

  // Check if the snowflake has moved beyond the bottom
  isOutOfView() {
    return this.y > this.height
  }
}

// Main function to create snowfall
const snowflakes = (target, count = 200) => {
  // Determine if the target is a selector string or a DOM element
  const container = typeof target === 'string' ? document.querySelector(target) : target

  if (!container) {
    return
  }

  // Create and configure canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  let width = container.clientWidth
  let height = container.clientHeight
  let active = false

  // Initialize canvas styles
  canvas.style.position = 'absolute'
  canvas.style.left = '0'
  canvas.style.top = '0'
  canvas.style.pointerEvents = 'none' // Allows clicks to pass through

  // Snowflake instances
  const flakes = []

  // Create snowflakes
  for (let i = 0; i < count; i++) {
    flakes.push(new Snowflake(width, height))
  }

  // Handle canvas resizing
  const onResize = () => {
    width = container.clientWidth
    height = container.clientHeight

    canvas.width = width
    canvas.height = height
    ctx.fillStyle = '#fff'

    // Reactivate animation only if width > 600
    const wasActive = active
    active = width > 600

    // If animation was inactive but is now active, request next frame
    if (!wasActive && active) {
      requestAnimFrame(update)
    }
  }

  // Animation loop
  const update = () => {
    // Clear the canvas
    ctx.clearRect(0, 0, width, height)

    // Stop updating if not active
    if (!active) {
      return
    }

    // Update and draw each snowflake
    flakes.forEach(flake => {
      flake.updatePosition()

      ctx.globalAlpha = flake.o
      ctx.beginPath()
      ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fill()

      // If out of view, reset the flake
      if (flake.isOutOfView()) {
        flake.reset()
      }
    })

    requestAnimFrame(update)
  }

  // Initial setup
  onResize()
  window.addEventListener('resize', onResize, false)
  container.append(canvas)
}

if (document.querySelector('.snowfall')) {
  snowflakes('.snowfall', 100)
}
