// ===== THE VANI AFFAIR — WEBSITE SCRIPT =====

// Fix 100vh on mobile browsers (address bar shifts viewport height)
function setVH() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
setVH();
window.addEventListener('resize', setVH);

const TOTAL_PAGES = 18;

const pageTitles = [
  "The Vani Affair",
  "What's Inside",
  "The Editor's Letter",
  "The IT Girl",
  "The IT Girl",
  "Born to Be Wild",
  "Born to Be Wild",
  "The Creative Soul",
  "The Creative Soul",
  "The Kindest Heart",
  "The Kindest Heart",
  "The (Food) Obsession",
  "The Personality Award",
  "The Best Friend Feature",
  "The Best Friend Feature",
  "The Best Friend Feature",
  "The Best Friend Feature",
  "The Vani Affair"
];

// ===== BUILD PAGES DYNAMICALLY =====
const container = document.getElementById('pagesContainer');
const navDotsEl = document.getElementById('navDots');

for (let i = 0; i < TOTAL_PAGES; i++) {
  const isCover = i === 0;
  const isFinal = i === TOTAL_PAGES - 1;

  // Build section
  const section = document.createElement('section');
  section.className = `page${isCover ? ' page-cover' : ''}${isFinal ? ' page-final' : ''}`;
  section.id = `page-${i}`;
  section.dataset.index = i;

  // Image wrapper
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'page-image-wrapper';

  const img = document.createElement('img');
  img.src = `pages/page_${String(i + 1).padStart(2, '0')}.png`;
  img.alt = pageTitles[i];
  img.className = 'page-img';
  img.loading = i < 3 ? 'eager' : 'lazy';

  const overlay = document.createElement('div');
  overlay.className = `page-glow-overlay ${i % 2 === 0 ? 'warm-overlay' : 'dark-overlay'}`;

  imgWrapper.appendChild(img);
  imgWrapper.appendChild(overlay);
  section.appendChild(imgWrapper);

  // Cover extras
  if (isCover) {
    const coverOverlay = document.createElement('div');
    coverOverlay.className = 'cover-overlay';
    coverOverlay.innerHTML = `
      <div class="cover-meta">
        <span class="issue-tag">ISSUE 01</span>
        <span class="date-tag">OCTOBER 2026</span>
      </div>
    `;
    section.appendChild(coverOverlay);
  }

  // Final page extras
  if (isFinal) {
    const finalMsg = document.createElement('div');
    finalMsg.className = 'final-message';
    finalMsg.innerHTML = `
      <div class="final-inner">
        <p class="final-tag">— THE END —</p>
        <h2 class="final-title">Happy Birthday,<br/>Vani 🎂</h2>
        <p class="final-sub">With all the love in the world<br/>— from your best friend, Vipiksha 🤍</p>
        <button class="restart-btn" id="restartBtn">Read Again ↑</button>
      </div>
    `;
    section.appendChild(finalMsg);
  }

  container.appendChild(section);

  // Nav dot
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.dataset.page = i;
  dot.setAttribute('aria-label', pageTitles[i]);
  dot.addEventListener('click', () => scrollToPage(i));
  navDotsEl.appendChild(dot);
}

// ===== SCROLL HANDLING =====
const pagesContainer = document.getElementById('pagesContainer');
const progressBar = document.getElementById('progressBar');
const scrollHint  = document.getElementById('scrollHint');
const dots = () => document.querySelectorAll('.dot');

let currentPage  = 0;
const KB_CLASSES = ['kb-1','kb-2','kb-3','kb-4','kb-5','kb-6'];
// Assign a fixed KB variant per page (cycles through 6)
const kbVariant = i => KB_CLASSES[i % KB_CLASSES.length];

// ===== CHAPTER TOAST DOM =====
const toast = document.createElement('div');
toast.className = 'chapter-toast';
toast.innerHTML = `
  <div class="toast-bar"></div>
  <div class="toast-inner">
    <p class="toast-issue">Issue 01 &middot; Oct 2026</p>
    <p class="toast-title"></p>
  </div>`;
document.body.appendChild(toast);
const toastTitle = toast.querySelector('.toast-title');
let toastTimer = null;

function showToast(text) {
  // Don't show on cover page
  if (!text || currentPage === 0) return;
  toastTitle.textContent = text;
  toast.classList.remove('hide');
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
  }, 2800);
}

// ===== SCROLL TO PAGE =====
function scrollToPage(index) {
  const pages = document.querySelectorAll('.page');
  if (pages[index]) pages[index].scrollIntoView({ behavior: 'smooth' });
}

// ===== UPDATE UI ON PAGE CHANGE =====
function updateUI(index) {
  currentPage = index;

  // Progress bar
  progressBar.style.width = `${(index / (TOTAL_PAGES - 1)) * 100}%`;

  // Nav dots
  dots().forEach((dot, i) => dot.classList.toggle('active', i === index));

  // Scroll hint
  scrollHint.classList.toggle('hidden', index > 0);

  // Confetti on final page
  if (index === TOTAL_PAGES - 1) launchConfetti();

  // Chapter toast
  showToast(pageTitles[index]);
}

// ===== KEN BURNS: apply/reset per page wrapper =====
function applyKenBurns(pageEl, index) {
  const wrapper = pageEl.querySelector('.page-image-wrapper');
  if (!wrapper) return;
  // Strip previous KB classes
  wrapper.classList.remove('kb-active', ...KB_CLASSES);
  // Force reflow so animation restarts
  void wrapper.offsetWidth;
  // Apply this page's variant
  wrapper.classList.add('kb-active', kbVariant(index));
}

// ===== FADE IN: page image entry =====
function applyPageReveal(pageEl) {
  const img = pageEl.querySelector('.page-img');
  if (!img) return;
  img.style.opacity = '0';
  // Let the opacity transition handle the fade
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { img.style.opacity = '1'; });
  });
}

// ===== INTERSECTION OBSERVER =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
      const index = parseInt(entry.target.dataset.index);
      updateUI(index);
      applyKenBurns(entry.target, index);
      applyPageReveal(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.page').forEach(page => observer.observe(page));

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault();
    scrollToPage(Math.min(currentPage + 1, TOTAL_PAGES - 1));
  }
  if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    scrollToPage(Math.max(currentPage - 1, 0));
  }
});

// ===== RESTART BUTTON =====
document.addEventListener('click', (e) => {
  if (e.target.id === 'restartBtn') {
    scrollToPage(0);
  }
});

// ===== TOUCH SWIPE (mobile) =====
let touchStartY = 0;
pagesContainer.addEventListener('touchstart', e => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

pagesContainer.addEventListener('touchend', e => {
  const delta = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(delta) > 50) {
    if (delta > 0) scrollToPage(Math.min(currentPage + 1, TOTAL_PAGES - 1));
    else scrollToPage(Math.max(currentPage - 1, 0));
  }
}, { passive: true });

// ===== SPARKLES ON COVER =====
function createSparkle() {
  const cover = document.getElementById('page-0');
  if (!cover) return;
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.style.cssText = `
    left: ${Math.random() * 100}%;
    top: ${Math.random() * 100}%;
    width: ${Math.random() * 6 + 3}px;
    height: ${Math.random() * 6 + 3}px;
    animation-duration: ${Math.random() * 3 + 2}s;
    animation-delay: ${Math.random() * 2}s;
  `;
  cover.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 5000);
}
setInterval(createSparkle, 400);

// ===== CONFETTI =====
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let confettiPieces = [];
let confettiRunning = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  // Re-observe current page after resize so snapping resets cleanly
  scrollToPage(currentPage);
});

function launchConfetti() {
  if (confettiRunning) return;
  confettiRunning = true;
  confettiPieces = [];

  const colors = ['#e8a598', '#f2c4c0', '#c9a96e', '#ffffff', '#ffd6e0', '#a8d8ea'];
  for (let i = 0; i < 180; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: Math.random() * 10 + 4,
      h: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      r: Math.random() * Math.PI * 2,
      rSpeed: (Math.random() - 0.5) * 0.1,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 3 + 2,
      opacity: 1
    });
  }
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let alive = 0;
  confettiPieces.forEach(p => {
    if (p.y < canvas.height + 20) alive++;
    p.x += p.vx;
    p.y += p.vy;
    p.r += p.rSpeed;
    p.vy += 0.05;
    p.opacity = Math.max(0, 1 - (p.y / canvas.height) * 0.5);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });

  if (alive > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Initial update
updateUI(0);
