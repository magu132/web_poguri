import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './style.css'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

/* =========================================================
   1. 수식·좌표·도형이 움직이는 배경 (canvas)
   ========================================================= */
const canvas = document.getElementById('math-bg')
const ctx = canvas.getContext('2d')

const FORMULAS = [
  'y = ax² + bx + c', 'a² + b² = c²', 'eⁱᵖ + 1 = 0', '∫ f(x) dx', 'Σ n = n(n+1)/2',
  'f′(x)', 'π ≈ 3.14159', '(x, y)', 'lim n→∞', '√2', 'sin²θ + cos²θ = 1', 'Δy / Δx',
  'A = πr²', '∞', 'φ = 1.618…', 'y = mx + b', '∂f/∂x', '(0, 0)', '1, 1, 2, 3, 5, 8',
]
const COLORS = ['255,207,112', '255,122,102', '255,143,184']

let W = 0
let H = 0
let DPR = 1
let items = []
let shapes = []
const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function setup() {
  DPR = Math.min(window.devicePixelRatio || 1, 2)
  W = window.innerWidth
  H = window.innerHeight
  canvas.width = W * DPR
  canvas.height = H * DPR
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

  const small = W < 720
  const formulaCount = small ? 9 : 18
  const shapeCount = small ? 5 : 10

  items = Array.from({ length: formulaCount }, () => ({
    text: pick(FORMULAS),
    x: rand(0, W),
    y: rand(0, H),
    size: rand(14, small ? 20 : 26),
    speed: rand(0.08, 0.3),
    depth: rand(0.2, 1),
    color: pick(COLORS),
    alpha: rand(0.12, 0.28),
  }))

  shapes = Array.from({ length: shapeCount }, () => ({
    sides: pick([0, 3, 4, 5, 6]),
    x: rand(0, W),
    y: rand(0, H),
    r: rand(24, small ? 60 : 110),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.004, 0.004),
    vy: rand(-0.15, -0.04),
    depth: rand(0.2, 1),
    color: pick(COLORS),
    alpha: rand(0.12, 0.3),
  }))
}

function drawGrid(t) {
  const step = W < 720 ? 48 : 64
  const ox = (mouse.x * 10) % step
  const oy = ((mouse.y * 10 + t * 0.01) % step + step) % step
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(255,207,112,0.045)'
  ctx.beginPath()
  for (let x = -step + ox; x < W + step; x += step) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
  }
  for (let y = -step + oy; y < H + step; y += step) {
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
  }
  ctx.stroke()

  // 좌표축
  const cx = W * 0.5 + mouse.x * 20
  const cy = H * 0.55 + mouse.y * 20
  ctx.strokeStyle = 'rgba(255,122,102,0.14)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(0, cy)
  ctx.lineTo(W, cy)
  ctx.moveTo(cx, 0)
  ctx.lineTo(cx, H)
  ctx.stroke()

  // 움직이는 함수 그래프 (사인파)
  const waves = [
    { amp: 60, freq: 0.006, speed: 0.0006, color: '255,143,184', a: 0.22 },
    { amp: 90, freq: 0.0035, speed: -0.0004, color: '255,207,112', a: 0.16 },
  ]
  waves.forEach((w) => {
    ctx.strokeStyle = `rgba(${w.color},${w.a})`
    ctx.lineWidth = 1.6
    ctx.beginPath()
    for (let x = 0; x <= W; x += 8) {
      const y = cy + Math.sin(x * w.freq + t * w.speed) * w.amp
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
  })
}

function drawShape(s) {
  const x = s.x + mouse.x * 40 * s.depth
  const y = s.y + mouse.y * 40 * s.depth
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(s.rot)
  ctx.strokeStyle = `rgba(${s.color},${s.alpha})`
  ctx.lineWidth = 1.4
  ctx.beginPath()
  if (s.sides === 0) {
    ctx.arc(0, 0, s.r, 0, Math.PI * 2)
  } else {
    for (let i = 0; i <= s.sides; i++) {
      const a = (i / s.sides) * Math.PI * 2
      const px = Math.cos(a) * s.r
      const py = Math.sin(a) * s.r
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
  }
  ctx.stroke()
  // 꼭짓점 점
  ctx.fillStyle = `rgba(${s.color},${s.alpha + 0.2})`
  ctx.beginPath()
  ctx.arc(s.r, 0, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function frame(t = 0) {
  mouse.x += (mouse.tx - mouse.x) * 0.05
  mouse.y += (mouse.ty - mouse.y) * 0.05

  ctx.clearRect(0, 0, W, H)
  drawGrid(t)

  shapes.forEach((s) => {
    s.rot += s.vr
    s.y += s.vy
    if (s.y < -s.r * 2) {
      s.y = H + s.r * 2
      s.x = rand(0, W)
    }
    drawShape(s)
  })

  ctx.textBaseline = 'middle'
  items.forEach((it) => {
    it.y -= it.speed
    if (it.y < -40) {
      it.y = H + 40
      it.x = rand(0, W)
      it.text = pick(FORMULAS)
    }
    ctx.font = `italic ${it.size}px "Cambria Math", "Times New Roman", serif`
    ctx.fillStyle = `rgba(${it.color},${it.alpha})`
    ctx.fillText(it.text, it.x + mouse.x * 60 * it.depth, it.y + mouse.y * 60 * it.depth)
  })

  if (!reduceMotion) requestAnimationFrame(frame)
}

setup()
frame()

let resizeTimer
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    setup()
    if (reduceMotion) frame()
  }, 150)
})

/* =========================================================
   2. 마우스 반응: 배경 시차, 빛 번짐, 카드 기울기
   ========================================================= */
const glow = document.querySelector('.bg-glow')

if (finePointer) {
  window.addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX / W - 0.5
    mouse.ty = e.clientY / H - 0.5
    glow.style.setProperty('--gx', `${e.clientX}px`)
    glow.style.setProperty('--gy', `${e.clientY}px`)
  })

  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      card.style.setProperty('--mx', `${px * 100}%`)
      card.style.setProperty('--my', `${py * 100}%`)
      if (!reduceMotion) {
        card.style.setProperty('--ry', `${(px - 0.5) * 10}deg`)
        card.style.setProperty('--rx', `${(0.5 - py) * 10}deg`)
      }
    })
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg')
      card.style.setProperty('--ry', '0deg')
    })
  })
}

/* =========================================================
   3. 스크롤에 따라 콘텐츠 등장
   ========================================================= */
const revealEls = document.querySelectorAll('.reveal')

// 같은 묶음 안의 요소는 순서대로 조금씩 늦게 등장
document.querySelectorAll('.grid, .interests, .hero__text').forEach((group) => {
  group.querySelectorAll(':scope > .reveal').forEach((el, i) => {
    el.style.setProperty('--delay', `${i * 0.12}s`)
  })
})

if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        obs.unobserve(entry.target)
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  )
  revealEls.forEach((el) => revealObserver.observe(el))
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'))
}

/* =========================================================
   4. 스크롤 진행 막대 + 현재 섹션 메뉴 표시
   ========================================================= */
const root = document.documentElement
window.addEventListener(
  'scroll',
  () => {
    const max = root.scrollHeight - window.innerHeight
    root.style.setProperty('--progress', max > 0 ? window.scrollY / max : 0)
  },
  { passive: true }
)

const links = document.querySelectorAll('.nav__list a')
const sections = [...links]
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean)

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      links.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`)
      })
    })
  },
  { rootMargin: '-40% 0px -55% 0px' }
)
sections.forEach((section) => navObserver.observe(section))

/* 아직 주소가 없는 임시 링크(href="#")는 클릭해도 맨 위로 튀지 않도록 */
document.querySelectorAll('a.placeholder[href="#"]').forEach((a) => {
  a.addEventListener('click', (e) => e.preventDefault())
})
