import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import 'galmuri/dist/galmuri.css'
import './style.css'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const root = document.documentElement

/* =========================================================
   1. 블록 텍스처 생성 (16×16 픽셀을 그려 CSS 변수로 등록)
      색을 바꾸려면 아래 팔레트 배열만 수정하세요.
   ========================================================= */
function seeded(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function texture(seed, paint) {
  const c = document.createElement('canvas')
  c.width = c.height = 16
  const g = c.getContext('2d')
  const rnd = seeded(seed)
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      g.fillStyle = paint(x, y, rnd, pick)
      g.fillRect(x, y, 1, 1)
    }
  }
  return c.toDataURL()
}

const GRASS = ['#5aa83a', '#4f9a31', '#66b844', '#47892b']
const DIRT = ['#7a4f2e', '#6b4427', '#86593a', '#5e3c22']
const STONE = ['#7d7d84', '#71717a', '#8a8a92', '#66666e']
const DEEP = ['#3b3346', '#352e40', '#42394f', '#2f2939']
const CORE = ['#1d1824', '#221c2b', '#19151f']
const ORES = ['#ffcf5a', '#ff7a5c', '#ff8fb8']

const grassDepth = Array.from({ length: 16 }, (_, i) => 3 + ((i * 7) % 3))

const TEXTURES = {
  'grass-top': texture(1, (x, y, r, p) => p(GRASS)),
  'grass-side': texture(2, (x, y, r, p) => (y < grassDepth[x] ? p(GRASS) : p(DIRT))),
  dirt: texture(3, (x, y, r, p) => p(DIRT)),
  stone: texture(4, (x, y, r, p) => p(STONE)),
  ore: texture(5, (x, y, r, p) => {
    // 3×3 칸마다 하나씩 보석 알갱이가 박힌 돌
    const cell = (Math.floor(x / 5) * 7 + Math.floor(y / 5) * 3) % 3
    const inSpeck = (x % 5 === 1 || x % 5 === 2) && (y % 5 === 1 || y % 5 === 2)
    return inSpeck && r() > 0.25 ? ORES[cell] : p(STONE)
  }),
  deep: texture(6, (x, y, r, p) => (r() > 0.975 ? p(ORES) : p(DEEP))),
  core: texture(7, (x, y, r, p) => (r() > 0.985 ? '#ff7a5c' : p(CORE))),
}

Object.entries(TEXTURES).forEach(([name, url]) => {
  root.style.setProperty(`--tx-${name}`, `url("${url}")`)
})

/* =========================================================
   2. 픽셀 아이콘 (11×11). 글자 하나가 픽셀 한 칸입니다.
   ========================================================= */
const ICON_COLORS = {
  Y: '#f5b82e', O: '#e0761c', R: '#ff7a5c', r: '#b44a33', W: '#fff8e8', B: '#3d6fd1',
  b: '#a8703f', D: '#6b4427', K: '#23180f', S: '#b9b9c2', s: '#6e6e78', G: '#2f6b3a',
  P: '#ff8fb8', p: '#c95a85', C: '#ff7a5c', c: '#ffc2b0', L: '#5aa83a',
}

const ICONS = {
  star: [
    '.....Y.....', '....YYY....', '....YOY....', 'YYYYYYYYYYY', '.YYYYYYYYY.',
    '..YYYYYYY..', '...YYYYY...', '..YYYYYYY..', '..YYY.YYY..', '.YYY...YYY.', '.YY.....YY.',
  ],
  home: [
    '.....R.....', '....RRR....', '...RRRRR...', '..RRRRRRR..', '.RRRRRRRRR.',
    '..WWWWWWW..', '..WWWWWBW..', '..WDDWWWW..', '..WDDWWWW..', '..WDDWWWW..', '..WDDWWWW..',
  ],
  bulb: [
    '...YYYYY...', '..YYYYYYY..', '.YYWWYYYYY.', '.YWWYYYYYY.', '.YYYYYYYYY.',
    '.YYYYYYYYY.', '..YYYYYYY..', '...YYYYY...', '...SSSSS...', '...sssss...', '....SSS....',
  ],
  book: [
    '...........', '.RRRRRRRRR.', '.RWWWWWWWR.', '.RWKKKKKWR.', '.RWWWWWWWR.',
    '.RWKKKKWWR.', '.RWWWWWWWR.', '.RWKKKKKWR.', '.RWWWWWWWR.', '.RRRRRRRRR.', '.rrrrrrrrr.',
  ],
  chest: [
    '...........', '.DDDDDDDDD.', '.DbbbbbbbD.', '.DbbbbbbbD.', '.KKKKKKKKK.',
    '.DbbbYbbbD.', '.DbbbYbbbD.', '.DbbbbbbbD.', '.DbbbbbbbD.', '.DDDDDDDDD.', '...........',
  ],
  mail: [
    '...........', '...........', 'KKKKKKKKKKK', 'KWKWWWWWKWK', 'KWWKWWWKWWK',
    'KWWWKWKWWWK', 'KWWWWKWWWWK', 'KWWWWWWWWWK', 'KWWWWWWWWWK', 'KKKKKKKKKKK', '...........',
  ],
  arrow: [
    '.....L.....', '....LLL....', '...LLLLL...', '..LLLLLLL..', '.LLLLLLLLL.',
    '....LLL....', '....LLL....', '....LLL....', '....LLL....', '....LLL....', '...........',
  ],
  shield: [
    '.SSSSSSSSS.', '.SBBBBBBBS.', '.SBBBYBBBS.', '.SBBYYYBBS.', '.SBBBYBBBS.',
    '.SBBBBBBBS.', '..SBBBBBS..', '..SBBBBBS..', '...SBBBS...', '....SBS....', '.....S.....',
  ],
  chip: [
    '...........', '..K.K.K.K..', '.KKKKKKKKK.', 'KKGGGGGGGKK', '.KGGYYYGGK.',
    'KKGGYGYGGKK', '.KGGYYYGGK.', 'KKGGGGGGGKK', '.KKKKKKKKK.', '..K.K.K.K..', '...........',
  ],
  brain: [
    '...PPPPP...', '..PpPPPpP..', '.PPPpPpPPP.', '.PpPPpPPpP.', '.PPPPpPPPP.',
    '.PpPPpPPpP.', '.PPPpPpPPP.', '..PpPPPpP..', '...PPPPP...', '....SSS....', '....SSS....',
  ],
  gem: [
    '...........', '...CCCCC...', '..CcCCCcC..', '.CCcCCCcCC.', '.CCCCCCCCC.',
    '..CCCCCCC..', '...CCCCC...', '....CCC....', '.....C.....', '...........', '...........',
  ],
}

function iconSvg(rows) {
  let rects = ''
  rows.forEach((row, y) => {
    ;[...row].forEach((ch, x) => {
      if (ICON_COLORS[ch]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${ICON_COLORS[ch]}"/>`
    })
  })
  return `<svg viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`
}

document.querySelectorAll('[data-icon]').forEach((el) => {
  const rows = ICONS[el.dataset.icon]
  if (rows) el.innerHTML = iconSvg(rows)
})

/* =========================================================
   3. 블록 버튼: 누르면 블록이 깨지며 해당 영역으로 이동
   ========================================================= */
function goTo(hash) {
  const target = document.querySelector(hash)
  if (!target) return
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  history.replaceState(null, '', hash)
}

function burst(x, y, colors) {
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span')
    s.className = 'shard'
    s.style.left = `${x}px`
    s.style.top = `${y}px`
    s.style.background = colors[i % colors.length]
    document.body.appendChild(s)
    const angle = Math.random() * Math.PI * 2
    const dist = 50 + Math.random() * 70
    s.animate(
      [
        { transform: 'translate(-50%, -50%)', opacity: 1 },
        {
          transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist + 60}px) rotate(${Math.random() * 180}deg)`,
          opacity: 0,
        },
      ],
      { duration: 600, easing: 'steps(6)' }
    ).onfinish = () => s.remove()
  }
}

document.querySelectorAll('.block-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault()
    const hash = btn.getAttribute('href')
    if (reduceMotion) return goTo(hash)
    const r = btn.querySelector('.cube').getBoundingClientRect()
    const colors = btn.querySelector('.cube--grass') ? [...GRASS, ...DIRT] : [...STONE, ...ORES]
    btn.classList.add('is-breaking')
    burst(r.left + r.width / 2, r.top + r.height / 2, colors)
    setTimeout(() => {
      btn.classList.remove('is-breaking')
      goTo(hash)
    }, 380)
  })
})

/* =========================================================
   4. 스크롤에 따라 콘텐츠 등장
   ========================================================= */
const revealEls = document.querySelectorAll('.reveal')

document.querySelectorAll('.grid').forEach((group) => {
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
   5. 깊이 측정기(Y 좌표) + 하단 단축 바
   ========================================================= */
const depthY = document.getElementById('depth-y')
const depthLayer = document.getElementById('depth-layer')
const tip = document.getElementById('hotbar-tip')
const slots = [...document.querySelectorAll('.slot')]
const layers = [...document.querySelectorAll('.layer')]
let currentId = ''
let tipTimer

function setActive(id) {
  if (id === currentId) return
  currentId = id
  const section = document.getElementById(id)
  depthLayer.textContent = section.dataset.layer
  slots.forEach((slot) => {
    const on = slot.getAttribute('href') === `#${id}`
    slot.classList.toggle('is-active', on)
    if (on) {
      slot.setAttribute('aria-current', 'true')
      tip.textContent = slot.dataset.name
    } else {
      slot.removeAttribute('aria-current')
    }
  })
  tip.classList.add('is-shown')
  clearTimeout(tipTimer)
  tipTimer = setTimeout(() => tip.classList.remove('is-shown'), 1600)
}

function onScroll() {
  const max = root.scrollHeight - window.innerHeight
  const ratio = max > 0 ? window.scrollY / max : 0
  depthY.textContent = Math.round(64 - ratio * 128)

  const line = window.innerHeight * 0.4
  let active = layers[0]
  layers.forEach((layer) => {
    if (layer.getBoundingClientRect().top <= line) active = layer
  })
  setActive(active.id)
}

window.addEventListener('scroll', onScroll, { passive: true })
window.addEventListener('resize', onScroll)
onScroll()

// 숫자 키 1~5로 이동
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return
  const slot = slots[Number(e.key) - 1]
  if (slot) {
    e.preventDefault()
    goTo(slot.getAttribute('href'))
    slot.focus({ preventScroll: true })
  }
})
