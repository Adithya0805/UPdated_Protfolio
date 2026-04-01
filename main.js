/* =========================================
   main.js — Adithya Kuppusamy Portfolio
   ========================================= */

// ── Particle Canvas / Three.js ──────────────────────
(function initBackground() {
  const container = document.querySelector('.hero');
  if (!container) return;
  const isMobile = () => window.innerWidth < 768;

  // Use existing canvas for 2D fallback or if on mobile
  const canvas2d = document.getElementById('particle-canvas');
  let useFallback = isMobile() || typeof THREE === 'undefined';

  if (!useFallback && typeof THREE !== 'undefined') {
    // Hide 2D canvas, we will use Three.js
    if (canvas2d) canvas2d.style.display = 'none';
    
    // Setup Three.js scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e27, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';
    container.insertBefore(renderer.domElement, container.firstChild);

    // Particles geometry
    const geometry = new THREE.BufferGeometry();
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    // Colors: #00d9ff (0, 217, 255) / #00ff88 (0, 255, 136) / #7f77dd (127, 119, 221)
    const colorPalette = [
      new THREE.Color(0x00d9ff),
      new THREE.Color(0x00ff88),
      new THREE.Color(0x7f77dd)
    ];

    for(let i = 0; i < count; i++) {
      positions[i*3] = (Math.random() - 0.5) * 800;
      positions[i*3+1] = (Math.random() - 0.5) * 800;
      positions[i*3+2] = (Math.random() - 0.5) * 400 - 100;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i*3] = color.r;
      colors[i*3+1] = color.g;
      colors[i*3+2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circular particle sprite
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.arc(16, 16, 16, 0, Math.PI*2);
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    });

    function animate() {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;
      
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    }
    
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
  } else if (canvas2d) {
    // 2D Fallback
    const ctx = canvas2d.getContext('2d');
    let W, H, particles = [], RAF;

    function resize() {
      W = canvas2d.width = canvas2d.offsetWidth;
      H = canvas2d.height = canvas2d.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.6 ? '#00d9ff' : Math.random() > 0.5 ? '#00ff88' : '#7f77dd'
      };
    }

    function init2D() {
      resize();
      particles = Array.from({ length: 40 }, createParticle);
    }

    function drawLine(a, b) {
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist > 100) return;
      ctx.save();
      ctx.globalAlpha = (1 - dist / 100) * 0.15;
      ctx.strokeStyle = '#00d9ff';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        for (let j = i + 1; j < particles.length; j++) drawLine(p, particles[j]);
      }
      RAF = requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    init2D();
    tick();
  }
})();

// ── Sticky Header ────────────────────────
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile Hamburger ─────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
// Close on mobile link click
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ── Connect Dropdown ─────────────────────
const connectBtn = document.getElementById('connect-btn');
const connectDropdown = document.getElementById('connect-dropdown');
connectBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  connectDropdown.classList.toggle('open');
});
document.addEventListener('click', () => connectDropdown.classList.remove('open'));

// ── Active Nav on Scroll ─────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' });
sections.forEach(s => observer.observe(s));

// ── Reveal on Scroll ─────────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger siblings
      const siblings = [...entry.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 80}ms`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// ── Counter Animation ─────────────────────
const counters = document.querySelectorAll('.stat-num, .metric-val[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    if (!el.dataset.target) return;
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 35);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// ── Skill Bar Animation ───────────────────
const skillFills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.style.width = entry.target.dataset.w + '%';
    skillObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });
skillFills.forEach(f => skillObserver.observe(f));

// ── Smooth Scroll for Anchor Links ───────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

// ── Hover Tilt on Project Cards ───────────
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    card.style.transform = `translateY(-6px) rotateX(${-y}deg) rotateY(${x}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
    setTimeout(() => card.style.transition = '', 500);
  });
});

// ── Page Load Animation ───────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.4s ease';
    document.body.style.opacity = '1';
  });
});

// ── Download Resume PDF ────────────────────
document.querySelectorAll('.resume-download-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (typeof html2pdf !== 'undefined') {
      // Setup options for html2pdf
      const opt = {
        margin:       [0.5, 0.5],
        filename:     'Adithya_Kuppusamy_Portfolio.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#0a0e27' },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      // Temporarily hide the particle canvas for cleaner PDF print
      const bgCanvas = document.querySelector('canvas');
      const originalDisplay = bgCanvas ? bgCanvas.style.display : '';
      if (bgCanvas) bgCanvas.style.display = 'none';

      // Ensure the button shows loading state
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Downloading...';

      html2pdf().set(opt).from(document.body).save().then(() => {
        // Restore background and text
        if (bgCanvas) bgCanvas.style.display = originalDisplay;
        btn.innerHTML = originalText;
      });
    } else {
      window.print();
    }
  });
});
