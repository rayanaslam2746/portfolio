/**
 * CUBE PORTFOLIO — Main Application
 * Three.js + GSAP ScrollTrigger driven cinematic portfolio
 * ================================================================
 * CONTENT CONFIG — Fill in your own data here
 * ================================================================
 */
const contentConfig = {
  hero: {
    name: ['Rayan', 'Aslam'],
    eyebrow: 'Software Engineer · AI · Builder',
    sub: 'Computer Science · Rutgers University',
  },

  showcaseModules: [
    {
      id: 'p1',
      title: 'Portfolio',
      tags: ['Three.js', 'GSAP', 'WebGL'],
      desc: 'This interactive 3D portfolio — a living Rubik\'s cube as a storytelling device.',
      problem: 'How do you stand out in a sea of static resume sites?',
      solution: 'A scroll-driven 3D narrative experience that doubles as a technical showcase.',
      github: '#',
      demo: '#',
      color: '#2979F2',
    },
    {
      id: 'p2',
      title: 'AI Research',
      tags: ['Python', 'PyTorch', 'NLP'],
      desc: 'Applied ML research on intelligent system pipelines.',
      problem: 'Placeholder — describe your research problem here.',
      solution: 'Placeholder — describe your approach and results.',
      github: '#',
      demo: null,
      color: '#2DBB6B',
    },
    {
      id: 'p3',
      title: 'Startup Project',
      tags: ['React', 'FastAPI', 'PostgreSQL'],
      desc: 'Full-stack product built from zero to launch.',
      problem: 'Placeholder — describe the user problem you solved.',
      solution: 'Placeholder — describe the system and outcome.',
      github: '#',
      demo: '#',
      color: '#F5C842',
    },
    {
      id: 'p4',
      title: 'Web Application',
      tags: ['Next.js', 'TypeScript', 'Prisma'],
      desc: 'Production web app with real-time features.',
      problem: 'Placeholder — add your project description.',
      solution: 'Placeholder — add architecture details.',
      github: '#',
      demo: '#',
      color: '#E8293A',
    },
    {
      id: 'p5',
      title: 'Data Viz',
      tags: ['D3.js', 'Python', 'Pandas'],
      desc: 'Interactive data visualization dashboard.',
      problem: 'Placeholder — add your project description.',
      solution: 'Placeholder — add architecture details.',
      github: '#',
      demo: '#',
      color: '#F06B20',
    },
    {
      id: 'p6',
      title: 'Hackathon',
      tags: ['React', 'Node.js', 'API'],
      desc: '24-hour build — shipped a complete product.',
      problem: 'Placeholder — add your hackathon challenge.',
      solution: 'Placeholder — add what you built.',
      github: '#',
      demo: '#',
      color: '#4F98A3',
    },
    {
      id: 'p7',
      title: 'Automation',
      tags: ['Python', 'Selenium', 'AWS'],
      desc: 'Workflow automation reducing manual overhead.',
      problem: 'Placeholder — describe the automation challenge.',
      solution: 'Placeholder — describe what you automated.',
      github: '#',
      demo: null,
      color: '#2979F2',
    },
    {
      id: 'p8',
      title: 'ML Tool',
      tags: ['PyTorch', 'ONNX', 'FastAPI'],
      desc: 'Production ML inference pipeline.',
      problem: 'Placeholder — describe your ML problem.',
      solution: 'Placeholder — describe the model and deployment.',
      github: '#',
      demo: '#',
      color: '#2DBB6B',
    },
    {
      id: 'p9',
      title: 'Open Source',
      tags: ['TypeScript', 'CLI', 'npm'],
      desc: 'Open source tool used by the community.',
      problem: 'Placeholder — describe the open source need.',
      solution: 'Placeholder — describe your contribution.',
      github: '#',
      demo: null,
      color: '#E8293A',
    },
  ],

  capabilityNodes: [
    // Frontend
    { label: 'React',       axis: 'frontend', x: 12, y: 18,  exp: '3 years · production systems' },
    { label: 'TypeScript',  axis: 'frontend', x: 22, y: 30,  exp: 'Type-safe full-stack' },
    { label: 'Next.js',     axis: 'frontend', x: 8,  y: 42,  exp: 'SSR / SSG · production' },
    { label: 'Three.js',    axis: 'frontend', x: 18, y: 55,  exp: 'WebGL · 3D experiences' },
    { label: 'CSS / GSAP',  axis: 'frontend', x: 6,  y: 68,  exp: 'Motion · design systems' },
    // AI / Data
    { label: 'PyTorch',     axis: 'ai',       x: 45, y: 12,  exp: 'Deep learning · research' },
    { label: 'Python',      axis: 'ai',       x: 55, y: 28,  exp: 'Primary language · ML' },
    { label: 'Pandas / NumPy', axis: 'ai',    x: 48, y: 45,  exp: 'Data pipelines · analysis' },
    { label: 'Transformers',axis: 'ai',       x: 60, y: 20,  exp: 'NLP · LLM fine-tuning' },
    { label: 'Scikit-Learn',axis: 'ai',       x: 52, y: 62,  exp: 'Classical ML · modeling' },
    // Backend
    { label: 'FastAPI',     axis: 'backend',  x: 82, y: 20,  exp: 'REST APIs · async' },
    { label: 'Node.js',     axis: 'backend',  x: 88, y: 38,  exp: 'Event-driven systems' },
    { label: 'PostgreSQL',  axis: 'backend',  x: 78, y: 55,  exp: 'Relational DB · design' },
    { label: 'AWS',         axis: 'backend',  x: 91, y: 68,  exp: 'Cloud · serverless' },
    { label: 'Docker',      axis: 'backend',  x: 72, y: 38,  exp: 'Containers · deployment' },
  ],

  timelineEntries: [
    {
      date: '2024 — Present',
      role: 'Software Engineering Intern',
      org: 'Placeholder Company',
      desc: 'Placeholder — describe your role, team, and impact. What systems did you build? What problems did you solve?',
      tags: ['React', 'Python', 'AWS'],
    },
    {
      date: '2023 — 2024',
      role: 'AI Research Assistant',
      org: 'Rutgers University',
      desc: 'Placeholder — describe your research project, methods, and contributions. Include any publications or presentations.',
      tags: ['PyTorch', 'NLP', 'Research'],
    },
    {
      date: '2023',
      role: 'Full-Stack Developer',
      org: 'Freelance / Independent',
      desc: 'Placeholder — describe freelance or independent projects. What did you build for whom?',
      tags: ['React', 'Node.js', 'PostgreSQL'],
    },
    {
      date: '2022 — 2023',
      role: 'Technical Lead',
      org: 'Student Organization',
      desc: 'Placeholder — describe your leadership role. How many people? What did you ship?',
      tags: ['Leadership', 'Full-Stack', 'Mentorship'],
    },
    {
      date: '2021 — Present',
      role: 'B.S. Computer Science',
      org: 'Rutgers University',
      desc: 'Relevant coursework: Data Structures, Algorithms, Machine Learning, Systems Programming, Computer Architecture, Software Engineering.',
      tags: ['CS', 'AI/ML', 'Systems'],
    },
  ],

  contactActions: [
    { label: 'GitHub',   href: 'https://github.com/',   icon: '⬡', primary: false },
    { label: 'LinkedIn', href: 'https://linkedin.com/',  icon: '⬡', primary: false },
    { label: 'Resume',   href: '#',                       icon: '⬡', primary: true  },
    { label: 'Email',    href: 'mailto:rra98@scarletmail.rutgers.edu', icon: '⬡', primary: false },
  ],
};

/* ================================================================
   IMPORTS
   ================================================================ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/* ================================================================
   GLOBALS
   ================================================================ */
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

let scene, camera, renderer, composer;
let cubeGroup, cubeModel;
let clock = new THREE.Clock();
let mouse = { x: 0, y: 0, nx: 0, ny: 0 };
let currentChapter = 0;

/* Cube face colors for procedural cube */
const FACE_COLORS = [0xE8293A, 0xF06B20, 0xF5C842, 0x2DBB6B, 0x2979F2, 0xE8E8E0];

/* ================================================================
   CURSOR
   ================================================================ */
function initCursor() {
  const dot  = document.createElement('div'); dot.id  = 'cursor';
  const ring = document.createElement('div'); ring.id = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    mouse.nx = (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.ny = (e.clientY / window.innerHeight) * 2 - 1;
  });

  const interactables = 'a, button, .tile, .project-card, .skill-node, .cta-btn, .modal-link, .form-submit';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactables)) document.body.classList.add('hovering');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactables)) document.body.classList.remove('hovering');
  });

  function loop() {
    // dot: fast
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    // ring: lagged
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  }
  loop();
}

/* ================================================================
   PARTICLE CANVAS
   ================================================================ */
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const particles = [];
  const N = window.innerWidth < 768 ? 40 : 80;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < N; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      a: Math.random() * 0.6 + 0.1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79,152,163,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ================================================================
   PRELOADER — Procedural mini cube
   ================================================================ */
function runPreloader(onComplete) {
  const canvas = document.getElementById('pre-canvas');
  const w = 180, h = 180;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');

  let angle = 0;
  let scale = 0;
  let progress = 0;
  let done = false;
  const bar = document.getElementById('pre-bar');

  // Draw a simple isometric cube proxy
  function drawCube(s, a) {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    ctx.scale(s, s);

    // Face top
    ctx.beginPath();
    const top = [[-40, -20], [0, -40], [40, -20], [0, 0]];
    ctx.moveTo(...top[0]);
    top.forEach(p => ctx.lineTo(...p));
    ctx.closePath();
    ctx.fillStyle = '#2979F2';
    ctx.fill();

    // Face left
    ctx.beginPath();
    const left = [[-40, -20], [0, 0], [0, 40], [-40, 20]];
    ctx.moveTo(...left[0]);
    left.forEach(p => ctx.lineTo(...p));
    ctx.closePath();
    ctx.fillStyle = '#2DBB6B';
    ctx.fill();

    // Face right
    ctx.beginPath();
    const right = [[0, 0], [40, -20], [40, 20], [0, 40]];
    ctx.moveTo(...right[0]);
    right.forEach(p => ctx.lineTo(...p));
    ctx.closePath();
    ctx.fillStyle = '#E8293A';
    ctx.fill();

    // edges
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-40,-20); ctx.lineTo(0,-40); ctx.lineTo(40,-20); ctx.lineTo(0,0); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-40,20); ctx.lineTo(0,40); ctx.lineTo(40,20); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-40); ctx.lineTo(0,0); ctx.moveTo(-40,-20); ctx.lineTo(-40,20); ctx.moveTo(40,-20); ctx.lineTo(40,20); ctx.stroke();

    ctx.restore();
  }

  // Allow skip on click or keypress
  function skipPreloader() {
    if (done) return;
    done = true;
    bar.style.width = '100%';
    setTimeout(() => {
      gsap.to('#preloader', {
        opacity: 0, duration: 0.5, ease: 'power2.inOut',
        onComplete: () => {
          document.getElementById('preloader').style.display = 'none';
          onComplete();
        }
      });
    }, 150);
  }
  canvas.parentElement.addEventListener('click', skipPreloader);
  document.addEventListener('keydown', skipPreloader);

  const startTime = performance.now();
  const duration = 2000;

  function finish() {
    if (done) return;
    done = true;
    bar.style.width = '100%';
    drawCube(1, Math.PI * 0.25);
    setTimeout(() => {
      gsap.to('#preloader', {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          document.getElementById('preloader').style.display = 'none';
          onComplete();
        }
      });
    }, 150);
  }

  // Fallback: force complete after 2.5s regardless of rAF support
  setTimeout(finish, 2500);

  function tick(now) {
    if (done) return;
    const elapsed = now - startTime;
    progress = Math.min(elapsed / duration, 1);
    bar.style.width = (progress * 100) + '%';

    scale = progress < 0.3 ? (progress / 0.3) : 1;
    angle = progress * Math.PI * 1.5;
    drawCube(scale * 0.95, angle);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      finish();
    }
  }
  requestAnimationFrame(tick);
}

/* ================================================================
   THREE.JS SCENE
   ================================================================ */
function initScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080808, 0.035);

  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 1, 9);

  // Renderer
  const canvas = document.getElementById('main-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.18);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(5, 8, 6);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x4F98A3, 0.6);
  rimLight.position.set(-6, 2, -4);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-3, -2, 5);
  scene.add(fillLight);

  const warmAccent = new THREE.PointLight(0xF5C842, 0.4, 12);
  warmAccent.position.set(3, -2, 3);
  scene.add(warmAccent);

  buildProceduralCube();
  loadGLBCube();

  window.addEventListener('resize', onResize);
  render();
}

/* ── PROCEDURAL CUBE (shown during GLB load + used for preloader anim) ── */
function buildProceduralCube() {
  cubeGroup = new THREE.Group();
  scene.add(cubeGroup);

  const SIZE   = 0.62;
  const GAP    = 0.04;
  const BEVEL  = 0.06;
  const STEP   = SIZE + GAP;

  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d0d0d,
    metalness: 0.85,
    roughness: 0.12,
    reflectivity: 0.9,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });

  // Map face directions to colors
  const faceColorMap = {
    '+z': 0x2979F2,  // front  = blue
    '-z': 0x2DBB6B,  // back   = green
    '+y': 0xE8E8E0,  // top    = white
    '-y': 0xF5C842,  // bottom = yellow
    '+x': 0xF06B20,  // right  = orange
    '-x': 0xE8293A,  // left   = red
  };

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const pieceGroup = new THREE.Group();
        pieceGroup.position.set(x * STEP, y * STEP, z * STEP);

        // Shell
        const shellGeo = new THREE.BoxGeometry(SIZE - 0.02, SIZE - 0.02, SIZE - 0.02);
        const shell = new THREE.Mesh(shellGeo, shellMat);
        pieceGroup.add(shell);

        // Sticker tiles — only on exposed faces
        const stickerSize = SIZE * 0.72;
        const offset = SIZE * 0.5 + 0.004;

        const faces = [
          { dir: '+x', visible: x === 1,  rot: [0, Math.PI/2, 0],   pos: [offset, 0, 0] },
          { dir: '-x', visible: x === -1, rot: [0, -Math.PI/2, 0],  pos: [-offset, 0, 0] },
          { dir: '+y', visible: y === 1,  rot: [-Math.PI/2, 0, 0],  pos: [0, offset, 0] },
          { dir: '-y', visible: y === -1, rot: [Math.PI/2, 0, 0],   pos: [0, -offset, 0] },
          { dir: '+z', visible: z === 1,  rot: [0, 0, 0],            pos: [0, 0, offset] },
          { dir: '-z', visible: z === -1, rot: [0, Math.PI, 0],      pos: [0, 0, -offset] },
        ];

        faces.forEach(f => {
          if (!f.visible) return;
          const geo = new THREE.PlaneGeometry(stickerSize, stickerSize);
          const col = faceColorMap[f.dir];
          const mat = new THREE.MeshStandardMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 0.22,
            roughness: 0.55,
            metalness: 0.0,
          });
          const sticker = new THREE.Mesh(geo, mat);
          sticker.position.set(...f.pos);
          sticker.rotation.set(...f.rot);
          sticker.userData.stickerColor = col;
          pieceGroup.add(sticker);
        });

        pieceGroup.userData.gridPos = { x, y, z };
        cubeGroup.add(pieceGroup);
      }
    }
  }

  cubeGroup.userData.built = true;
}

/* ── LOAD THE GLB (replaces procedural cube if successful) ── */
function loadGLBCube() {
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  // Use an <img> element trick to trigger the S3 redirect, then read src
  // Actually for GLB, we serve it as a local file via the deploy proxy.
  // We'll try loading it; if it fails we keep the procedural cube.
  loader.load(
    './assets/rubiks_cube.glb',
    (gltf) => {
      cubeModel = gltf.scene;
      // Scale and center
      const box = new THREE.Box3().setFromObject(cubeModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3.2 / maxDim;
      cubeModel.scale.setScalar(scale);
      cubeModel.position.sub(center.multiplyScalar(scale));

      // Upgrade materials to premium
      cubeModel.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.metalness = 0.2;
            child.material.roughness = 0.45;
            if (child.material.map) child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
          }
        }
      });

      // Swap out procedural cube
      scene.remove(cubeGroup);
      cubeGroup = new THREE.Group();
      cubeGroup.add(cubeModel);
      scene.add(cubeGroup);
      console.log('GLB loaded successfully');
    },
    undefined,
    (err) => {
      console.warn('GLB load failed, keeping procedural cube:', err.message);
    }
  );
}

/* ================================================================
   RENDER LOOP
   ================================================================ */
function render() {
  requestAnimationFrame(render);
  const t = clock.getElapsedTime();

  if (cubeGroup) {
    // Smooth mouse parallax
    mouse.x += (mouse.nx - mouse.x) * 0.04;
    mouse.y += (mouse.ny - mouse.y) * 0.04;

    // Idle breathing
    cubeGroup.position.y = Math.sin(t * 0.6) * 0.06;

    // Subtle mouse parallax
    cubeGroup.rotation.x += (mouse.y * 0.08 - cubeGroup.rotation.x) * 0.05;
    cubeGroup.rotation.y += (mouse.x * 0.12 - cubeGroup.rotation.y) * 0.05;
  }

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ================================================================
   SCROLL CHOREOGRAPHY
   ================================================================ */
function initScrollTimeline() {
  const chapters = document.querySelectorAll('.chapter');

  // ── Chapter 1 · Hero ─────────────────────────────────────
  // Camera push + cube slow
  ScrollTrigger.create({
    trigger: '#ch-hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.5,
    onUpdate: (self) => {
      const p = self.progress;
      // Camera dollies in
      gsap.set(camera.position, { z: 9 - p * 2.5 });
      // Subtle scene darkening via fog
      scene.fog.density = 0.035 + p * 0.025;
      // Cube slows as we scroll
      if (cubeGroup) {
        cubeGroup.rotation.z = p * 0.3;
      }
    }
  });

  // ── Chapter 2 · About ────────────────────────────────────
  ScrollTrigger.create({
    trigger: '#ch-about',
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      if (!cubeGroup) return;
      // Cube rotates to face front
      const targetY = p * Math.PI * 0.25;
      cubeGroup.rotation.y += (targetY - cubeGroup.rotation.y) * 0.1;
      camera.position.z = 6.5 + (1 - p) * 2;
      camera.position.x = -p * 1.5;
    }
  });

  // ── Chapter 3 · Projects ────────────────────────────────
  ScrollTrigger.create({
    trigger: '#ch-projects',
    start: 'top 80%',
    end: 'center center',
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      if (!cubeGroup) return;
      // Cube "explodes" slightly via scale
      const explodeScale = 1 + p * 0.15;
      cubeGroup.scale.setScalar(explodeScale);
      // Dramatic rotation
      cubeGroup.rotation.y += 0.003;
      camera.position.z = 5 + p * 2;
      camera.position.x = -1.5 + p * 3;
    }
  });

  // ── Chapter 4 · Skills ───────────────────────────────────
  ScrollTrigger.create({
    trigger: '#ch-skills',
    start: 'top 70%',
    end: 'bottom 30%',
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      if (!cubeGroup) return;
      cubeGroup.scale.setScalar(0.9 + p * 0.1);
      cubeGroup.rotation.x = p * Math.PI * 0.15;
      camera.position.y = 1 + p * 1.5;
      camera.position.z = 7 - p;
    }
  });

  // ── Chapter 5 · Experience ──────────────────────────────
  ScrollTrigger.create({
    trigger: '#ch-experience',
    start: 'top 70%',
    end: 'center center',
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      if (!cubeGroup) return;
      // Cube splits into layers effect via Y offset per layer
      const orbitAngle = p * Math.PI * 0.4;
      camera.position.x = Math.sin(orbitAngle) * 2;
      camera.position.z = 7 + Math.cos(orbitAngle) * 0.5;
      cubeGroup.rotation.y = -p * 0.5;
    }
  });

  // ── Chapter 6 · Contact ──────────────────────────────────
  ScrollTrigger.create({
    trigger: '#ch-contact',
    start: 'top 80%',
    end: 'center center',
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      if (!cubeGroup) return;
      // Cube "solves" — returns to clean rotation
      cubeGroup.rotation.x += (0 - cubeGroup.rotation.x) * 0.08;
      cubeGroup.rotation.y += (Math.PI * 0.25 - cubeGroup.rotation.y) * 0.05;
      cubeGroup.scale.setScalar(1 + p * 0.05);

      // Intensify emissive on solve
      cubeGroup.traverse(child => {
        if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = 0.22 + p * 0.3;
        }
      });

      // Widen camera for payoff
      camera.position.z = 6 + p * 2;
      camera.position.x = 0;
      camera.position.y = 1;
    }
  });

  // ── Chapter progress dots ────────────────────────────────
  chapters.forEach((ch, i) => {
    ScrollTrigger.create({
      trigger: ch,
      start: 'top center',
      end: 'bottom center',
      onEnter:      () => setActiveChapter(i),
      onEnterBack:  () => setActiveChapter(i),
    });
  });
}

function setActiveChapter(idx) {
  currentChapter = idx;
  document.querySelectorAll('.nav-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
}

/* ================================================================
   EXPERIENCE TIMELINE — intersection reveal
   ================================================================ */
function initExperienceTimeline() {
  const container = document.getElementById('exp-timeline');

  contentConfig.timelineEntries.forEach((entry, i) => {
    const el = document.createElement('div');
    el.className = 'exp-entry';
    el.style.transitionDelay = `${i * 0.08}s`;
    el.innerHTML = `
      <div class="exp-date">${entry.date}</div>
      <div class="exp-role">${entry.role}</div>
      <div class="exp-org">${entry.org}</div>
      <div class="exp-desc">${entry.desc}</div>
      <div class="exp-tags">${entry.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    `;
    container.appendChild(el);
  });

  // Scroll reveal
  ScrollTrigger.create({
    trigger: '#ch-experience',
    start: 'top 60%',
    onEnter: () => {
      document.querySelectorAll('.exp-entry').forEach((el, i) => {
        setTimeout(() => el.classList.add('revealed'), i * 120);
      });
    }
  });
}

/* ================================================================
   PROJECTS GRID
   ================================================================ */
function initProjectsGrid() {
  const grid = document.getElementById('project-grid');
  const modal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');

  contentConfig.showcaseModules.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.setProperty('--card-glow', hexToRgba(p.color, 0.12));
    card.innerHTML = `
      <div class="project-card-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="project-card-title">${p.title}</div>
      <div class="project-card-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="project-card-desc">${p.desc}</div>
      <div class="project-card-arrow">View Project →</div>
    `;
    card.addEventListener('click', () => openModal(p));
    grid.appendChild(card);
  });

  function openModal(p) {
    modalContent.innerHTML = `
      <div class="modal-title">${p.title}</div>
      <div class="modal-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="modal-section-label">Problem</div>
      <div class="modal-body">${p.problem}</div>
      <div class="modal-section-label">Solution</div>
      <div class="modal-body">${p.solution}</div>
      <div class="modal-links">
        ${p.github ? `<a class="modal-link" href="${p.github}" target="_blank" rel="noopener">GitHub →</a>` : ''}
        ${p.demo   ? `<a class="modal-link" href="${p.demo}"   target="_blank" rel="noopener">Live Demo →</a>` : ''}
      </div>
    `;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ================================================================
   SKILL CONSTELLATION
   ================================================================ */
function initSkillConstellation() {
  const container = document.getElementById('skill-constellation');
  const tooltip   = document.getElementById('skill-tooltip');

  // Draw SVG connection lines
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.25;';
  container.appendChild(svg);

  const nodes = [];

  contentConfig.capabilityNodes.forEach(n => {
    const el = document.createElement('div');
    el.className = `skill-node ${n.axis}`;
    el.style.left = n.x + '%';
    el.style.top  = n.y + '%';
    el.innerHTML  = `<div class="skill-node-dot"></div><div class="skill-node-label">${n.label}</div>`;

    el.addEventListener('mouseenter', (e) => {
      tooltip.innerHTML = `<strong>${n.label}</strong><br/>${n.exp}`;
      tooltip.classList.add('visible');
    });
    el.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      let tx = e.clientX - rect.left + 16;
      let ty = e.clientY - rect.top  + 12;
      if (tx + 210 > rect.width)  tx = e.clientX - rect.left - 210;
      if (ty + 80  > rect.height) ty = e.clientY - rect.top  - 70;
      tooltip.style.left = tx + 'px';
      tooltip.style.top  = ty + 'px';
    });
    el.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));

    container.appendChild(el);
    nodes.push({ el, n });
  });

  // Animate nodes in with stagger
  ScrollTrigger.create({
    trigger: '#ch-skills',
    start: 'top 60%',
    onEnter: () => {
      nodes.forEach(({ el }, i) => {
        gsap.fromTo(el,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 0.5, delay: i * 0.04, ease: 'back.out(1.5)' }
        );
      });

      // Draw lines between same-axis nodes after a beat
      setTimeout(() => drawConnections(svg, nodes), 400);
    }
  });
}

function drawConnections(svg, nodes) {
  const container = svg.parentElement;
  const W = container.offsetWidth;
  const H = container.offsetHeight;

  const axes = ['frontend', 'ai', 'backend'];
  const colors = { frontend: '#2979F2', ai: '#2DBB6B', backend: '#F06B20' };

  axes.forEach(axis => {
    const group = nodes.filter(({ n }) => n.axis === axis);
    for (let i = 0; i < group.length - 1; i++) {
      const a = group[i].n, b = group[i + 1].n;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', (a.x / 100) * W);
      line.setAttribute('y1', (a.y / 100) * H);
      line.setAttribute('x2', (b.x / 100) * W);
      line.setAttribute('y2', (b.y / 100) * H);
      line.setAttribute('stroke', colors[axis]);
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    }
  });
}

/* ================================================================
   CONTACT CTA
   ================================================================ */
function initContact() {
  const cta = document.getElementById('contact-cta');
  contentConfig.contactActions.forEach(action => {
    const a = document.createElement('a');
    a.className = `cta-btn${action.primary ? ' primary' : ''}`;
    a.href = action.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = action.label;
    cta.appendChild(a);
  });

  document.getElementById('contact-form').addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('.form-submit');
    btn.textContent = 'Message Sent ✓';
    btn.style.background = '#2DBB6B';
    setTimeout(() => {
      btn.innerHTML = 'Send Message <span class="btn-arrow">→</span>';
      btn.style.background = '';
      e.target.reset();
    }, 3000);
  });
}

/* ================================================================
   HERO ENTRANCE ANIMATIONS
   ================================================================ */
function animateHeroIn() {
  const tl = gsap.timeline({ delay: 0.3 });

  tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    .to('.hero-name',    { opacity: 1,      duration: 0.9, ease: 'power3.out' }, '-=0.5')
    .to('.hero-sub',     { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    .to('.scroll-hint',  { opacity: 1,      duration: 0.6, ease: 'power3.out' }, '-=0.2')
    .call(() => {
      document.getElementById('nav').classList.add('visible');
    }, null, 0.4);

  // Cube entrance
  if (cubeGroup) {
    gsap.from(cubeGroup.rotation, { y: Math.PI * 2, duration: 2.2, ease: 'power3.out', delay: 0.1 });
    gsap.from(cubeGroup.scale, { x: 0, y: 0, z: 0, duration: 1.2, ease: 'back.out(1.3)', delay: 0.2 });
  }
}

/* ================================================================
   UTILS
   ================================================================ */
function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ================================================================
   VIGNETTE
   ================================================================ */
function addVignette() {
  const v = document.createElement('div');
  v.id = 'vignette';
  document.body.appendChild(v);
}

/* ================================================================
   BOOT SEQUENCE
   ================================================================ */
function boot() {
  initCursor();
  initParticles();
  addVignette();

  runPreloader(() => {
    // Show site
    gsap.to('#site', { opacity: 1, duration: 0.8, ease: 'power2.out' });

    // Initialize 3D scene
    initScene();

    // Build UI sections
    initProjectsGrid();
    initSkillConstellation();
    initExperienceTimeline();
    initContact();

    // Scroll timeline
    initScrollTimeline();

    // Hero entrance
    animateHeroIn();
  });
}

boot();
