/**
 * ══════════════════════════════════════════════════════════════
 *  CUBE PORTFOLIO v2 — FACE-AS-INTERFACE STATE MACHINE
 *  Architecture: Discrete chapter system. The cube IS the UI.
 *  No scrolling overlay. No background decoration.
 *  Each face = one chapter. Content lives ON the cube surface.
 * ══════════════════════════════════════════════════════════════
 *
 *  STATE MACHINE FLOW:
 *  IDLE → [scroll] → HIDE_CONTENT → ROTATE → LOCK → PAUSE → REVEAL → IDLE
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const gsap = window.gsap;

/* ══════════════════════════════════════════════════════════════
   CONTENT CONFIG — Fill in your own data
   ══════════════════════════════════════════════════════════════ */
const CONFIG = {

  faces: ['Hero', 'About', 'Projects', 'Skills', 'Experience', 'Contact'],

  projects: [
    { title: 'Portfolio',    tags: ['Three.js','GSAP','WebGL'],          color: '#2979F2', problem: 'How do you stand out in a sea of static resume sites?',           solution: 'A face-based 3D narrative — the cube IS the interface.' },
    { title: 'AI Research',  tags: ['Python','PyTorch','NLP'],            color: '#2DBB6B', problem: 'Placeholder — describe your research problem.',                   solution: 'Placeholder — describe your approach and results.' },
    { title: 'Startup',      tags: ['React','FastAPI','PostgreSQL'],      color: '#F5C842', problem: 'Placeholder — describe the user problem you solved.',             solution: 'Placeholder — describe the system and outcome.' },
    { title: 'Web App',      tags: ['Next.js','TypeScript','Prisma'],     color: '#E8293A', problem: 'Placeholder — add your project description.',                    solution: 'Placeholder — add architecture details.' },
    { title: 'Data Viz',     tags: ['D3.js','Python','Pandas'],           color: '#F06B20', problem: 'Placeholder — add your project description.',                    solution: 'Placeholder — add architecture details.' },
    { title: 'Hackathon',    tags: ['React','Node.js','API'],             color: '#4F98A3', problem: 'Placeholder — add your hackathon challenge.',                    solution: 'Placeholder — add what you built.' },
    { title: 'Automation',   tags: ['Python','Selenium','AWS'],           color: '#2979F2', problem: 'Placeholder — describe the automation challenge.',               solution: 'Placeholder — describe what you automated.' },
    { title: 'ML Tool',      tags: ['PyTorch','ONNX','FastAPI'],          color: '#2DBB6B', problem: 'Placeholder — describe your ML problem.',                        solution: 'Placeholder — describe the model and deployment.' },
    { title: 'Open Source',  tags: ['TypeScript','CLI','npm'],            color: '#E8293A', problem: 'Placeholder — describe the open source need.',                   solution: 'Placeholder — describe your contribution.' },
  ],

  skills: {
    frontend: ['React', 'TypeScript', 'Next.js', 'Three.js', 'CSS / GSAP'],
    ai:       ['PyTorch', 'Python', 'Pandas', 'Transformers', 'Scikit-Learn'],
    backend:  ['FastAPI', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
  },

  experience: [
    { date: '2024 — Present', role: 'Software Engineering Intern', org: 'Placeholder Company',    desc: 'Placeholder — describe your role, team, and impact. What systems did you build?', tags: ['React','Python','AWS'] },
    { date: '2023 — 2024',   role: 'AI Research Assistant',       org: 'Rutgers University',      desc: 'Placeholder — describe your research project, methods, and contributions.',        tags: ['PyTorch','NLP','Research'] },
    { date: '2023',           role: 'Full-Stack Developer',         org: 'Freelance',               desc: 'Placeholder — describe freelance or independent projects you shipped.',            tags: ['React','Node.js','PostgreSQL'] },
    { date: '2022 — 2023',   role: 'Technical Lead',               org: 'Student Organization',   desc: 'Placeholder — describe your leadership role. How many people? What did you ship?', tags: ['Leadership','Full-Stack'] },
    { date: '2021 — Present', role: 'B.S. Computer Science',        org: 'Rutgers University',      desc: 'Coursework: Data Structures, Algorithms, ML, Systems, Computer Architecture.',    tags: ['CS','AI/ML','Systems'] },
  ],

  contact: [
    { label: 'GitHub',   href: 'https://github.com/',                          primary: false },
    { label: 'LinkedIn', href: 'https://linkedin.com/',                         primary: false },
    { label: 'Resume',   href: '#',                                              primary: true  },
    { label: 'Email',    href: 'mailto:rra98@scarletmail.rutgers.edu',           primary: false },
  ],
};

/* ══════════════════════════════════════════════════════════════
   FACE ROTATION MAP
   Defines the THREE.Euler target rotation for each face index,
   and the rotation axis/direction for the transition tween.
   The cube always shows face 0 (front face, +Z) toward camera.
   We rotate the group so the correct face faces +Z.
   ══════════════════════════════════════════════════════════════ */
const FACE_ROTATIONS = [
  { euler: [0, 0, 0],                    label: 'Hero'       }, // front face
  { euler: [0, -Math.PI / 2, 0],         label: 'About'      }, // right face → front
  { euler: [0, -Math.PI, 0],             label: 'Projects'   }, // back face  → front
  { euler: [0,  Math.PI / 2, 0],         label: 'Skills'     }, // left face  → front
  { euler: [-Math.PI / 2, 0, 0],         label: 'Experience' }, // top face   → front
  { euler: [ Math.PI / 2, 0, 0],         label: 'Contact'    }, // bottom face→ front
];

/* ══════════════════════════════════════════════════════════════
   STATE MACHINE
   ══════════════════════════════════════════════════════════════ */
const State = {
  IDLE:         'IDLE',
  HIDE_CONTENT: 'HIDE_CONTENT',
  ROTATE:       'ROTATE',
  LOCK:         'LOCK',
  PAUSE:        'PAUSE',
  REVEAL:       'REVEAL',
};
let currentState  = State.IDLE;
let currentFaceIdx = 0;
let isTransitioning = false;

/* ══════════════════════════════════════════════════════════════
   THREE.JS SCENE GLOBALS
   ══════════════════════════════════════════════════════════════ */
let renderer, scene, camera;
let cubeGroup;
let clock;
let mouseTarget = { x: 0, y: 0 };
let mouseSmooth = { x: 0, y: 0 };

/* ══════════════════════════════════════════════════════════════
   THREE.JS — SCENE SETUP
   ══════════════════════════════════════════════════════════════ */
function initThree() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070707);
  // Very subtle atmospheric fog
  scene.fog = new THREE.FogExp2(0x070707, 0.028);

  // Camera — fixed, facing cube front face squarely
  camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9.5);
  camera.lookAt(0, 0, 0);

  // Renderer
  const canvas = document.getElementById('main-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  buildLights();
  buildCube();
  loadGLB();

  // Subtle floating particles
  buildParticles();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    positionFaceContent();
  });

  renderLoop();
}

function buildLights() {
  // Key — defines form
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(5, 7, 8);
  key.castShadow = true;
  scene.add(key);

  // Rim — edge definition
  const rim = new THREE.DirectionalLight(0x4F98A3, 0.8);
  rim.position.set(-6, 1, -5);
  scene.add(rim);

  // Fill — prevent crushed shadows
  const fill = new THREE.AmbientLight(0xffffff, 0.18);
  scene.add(fill);

  // Warm accent point
  const warm = new THREE.PointLight(0xF5C842, 0.5, 14);
  warm.position.set(3, -3, 4);
  scene.add(warm);
}

/* ══════════════════════════════════════════════════════════════
   PROCEDURAL PREMIUM CUBE
   matte black shell + beveled edges + emissive colored stickers
   ══════════════════════════════════════════════════════════════ */
function buildCube() {
  cubeGroup = new THREE.Group();
  scene.add(cubeGroup);

  const SIZE  = 0.62;
  const GAP   = 0.03;
  const STEP  = SIZE + GAP;

  const shellMat = new THREE.MeshPhysicalMaterial({
    color:              0x0c0c0c,
    metalness:          0.9,
    roughness:          0.08,
    reflectivity:       0.95,
    clearcoat:          1.0,
    clearcoatRoughness: 0.04,
  });

  // Face direction → sticker color
  const faceColors = {
    '+x': 0xF06B20, '-x': 0xE8293A,
    '+y': 0xE8E8E0, '-y': 0xF5C842,
    '+z': 0x2979F2, '-z': 0x2DBB6B,
  };

  const stickerMats = {};
  for (const [dir, col] of Object.entries(faceColors)) {
    stickerMats[dir] = new THREE.MeshStandardMaterial({
      color:             col,
      emissive:          col,
      emissiveIntensity: 0.18,
      roughness:         0.5,
      metalness:         0.0,
    });
  }

  const faces3D = [
    { dir: '+x', rot: [0,  Math.PI/2, 0],  pos: [SIZE/2 + 0.004, 0, 0] },
    { dir: '-x', rot: [0, -Math.PI/2, 0],  pos: [-SIZE/2 - 0.004, 0, 0] },
    { dir: '+y', rot: [-Math.PI/2, 0, 0],  pos: [0,  SIZE/2 + 0.004, 0] },
    { dir: '-y', rot: [ Math.PI/2, 0, 0],  pos: [0, -SIZE/2 - 0.004, 0] },
    { dir: '+z', rot: [0, 0, 0],            pos: [0, 0,  SIZE/2 + 0.004] },
    { dir: '-z', rot: [0, Math.PI, 0],      pos: [0, 0, -SIZE/2 - 0.004] },
  ];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const piece = new THREE.Group();
        piece.position.set(x * STEP, y * STEP, z * STEP);

        // Shell
        const geo  = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
        const mesh = new THREE.Mesh(geo, shellMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        piece.add(mesh);

        // Stickers on exposed faces
        const stickerGeo = new THREE.PlaneGeometry(SIZE * 0.74, SIZE * 0.74);
        for (const f of faces3D) {
          const exposed =
            (f.dir === '+x' && x === 1)  ||
            (f.dir === '-x' && x === -1) ||
            (f.dir === '+y' && y === 1)  ||
            (f.dir === '-y' && y === -1) ||
            (f.dir === '+z' && z === 1)  ||
            (f.dir === '-z' && z === -1);
          if (!exposed) continue;
          const sticker = new THREE.Mesh(stickerGeo, stickerMats[f.dir]);
          sticker.position.set(...f.pos);
          sticker.rotation.set(...f.rot);
          sticker.userData.isSticker = true;
          piece.add(sticker);
        }

        cubeGroup.add(piece);
      }
    }
  }

  // Store initial rotation target
  cubeGroup.userData.targetEuler = [0, 0, 0];
}

/* ══════════════════════════════════════════════════════════════
   OPTIONAL GLB OVERRIDE
   ══════════════════════════════════════════════════════════════ */
function loadGLB() {
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  loader.load('./assets/rubiks_cube.glb', gltf => {
    const model = gltf.scene;
    const box   = new THREE.Box3().setFromObject(model);
    const size  = box.getSize(new THREE.Vector3());
    const maxD  = Math.max(size.x, size.y, size.z);
    const scale = 3.0 / maxD;
    model.scale.setScalar(scale);
    model.position.sub(box.getCenter(new THREE.Vector3()).multiplyScalar(scale));

    model.traverse(c => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) {
          c.material.metalness = 0.15;
          c.material.roughness = 0.4;
        }
      }
    });

    // Swap groups
    scene.remove(cubeGroup);
    const newGroup = new THREE.Group();
    newGroup.add(model);
    newGroup.userData.targetEuler = [0, 0, 0];
    scene.add(newGroup);
    cubeGroup = newGroup;
    console.log('GLB loaded');
  }, undefined, err => {
    console.warn('GLB failed, using procedural cube:', err.message);
  });
}

/* ══════════════════════════════════════════════════════════════
   FLOATING PARTICLES
   ══════════════════════════════════════════════════════════════ */
function buildParticles() {
  const N   = 120;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - .5) * 20;
    pos[i*3+1] = (Math.random() - .5) * 20;
    pos[i*3+2] = (Math.random() - .5) * 20;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x4F98A3,
    size: 0.025,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  // Slowly drift
  const origPos = pos.slice();
  let t = 0;
  function driftParticles() {
    t += 0.0004;
    for (let i = 0; i < N; i++) {
      pts.geometry.attributes.position.array[i*3+1] = origPos[i*3+1] + Math.sin(t + i * 0.7) * 0.15;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  }
  // attach to render loop via userData
  pts.userData.drift = driftParticles;
  scene.userData.particles = pts;
}

/* ══════════════════════════════════════════════════════════════
   RENDER LOOP — camera is MOSTLY FIXED, minimal parallax
   ══════════════════════════════════════════════════════════════ */
function renderLoop() {
  requestAnimationFrame(renderLoop);
  const elapsed = clock.getElapsedTime();

  // Very subtle mouse parallax — ONLY when IDLE (never during transitions)
  if (currentState === State.IDLE) {
    mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * 0.03;
    mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * 0.03;

    // Micro parallax on cube — max ±2.5° — this is NOT constant rotation
    // It is a static offset that tracks the cursor position
    if (cubeGroup) {
      cubeGroup.rotation.x = THREE.MathUtils.lerp(
        cubeGroup.rotation.x,
        FACE_ROTATIONS[currentFaceIdx].euler[0] - mouseSmooth.y * 0.04,
        0.06
      );
      cubeGroup.rotation.y = THREE.MathUtils.lerp(
        cubeGroup.rotation.y,
        FACE_ROTATIONS[currentFaceIdx].euler[1] + mouseSmooth.x * 0.04,
        0.06
      );
    }
  }

  // Particle drift
  if (scene.userData.particles?.userData?.drift) {
    scene.userData.particles.userData.drift();
  }

  renderer.render(scene, camera);
}

/* ══════════════════════════════════════════════════════════════
   CONTENT SYSTEM — populate dynamic faces
   ══════════════════════════════════════════════════════════════ */
function populateContent() {

  // PROJECTS
  const pm = document.getElementById('project-modules');
  CONFIG.projects.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'proj-module';
    el.style.setProperty('--proj-color', p.color);
    el.innerHTML = `
      <div class="proj-num">${String(i+1).padStart(2,'0')}</div>
      <div class="proj-title">${p.title}</div>
      <div class="proj-tags">${p.tags.map(t => `<span class="ptag">${t}</span>`).join('')}</div>
      <div class="proj-arrow">Open →</div>
    `;
    el.addEventListener('click', () => openModal(p));
    pm.appendChild(el);
  });

  // SKILLS
  ['frontend','ai','backend'].forEach(axis => {
    const el = document.getElementById(`skill-${axis}`);
    CONFIG.skills[axis].forEach(s => {
      const chip = document.createElement('div');
      chip.className = 'skill-chip';
      chip.textContent = s;
      el.appendChild(chip);
    });
  });

  // TIMELINE
  const tm = document.getElementById('timeline-modules');
  CONFIG.experience.forEach(e => {
    const el = document.createElement('div');
    el.className = 'tm-entry';
    el.innerHTML = `
      <div class="tm-date">${e.date}</div>
      <div class="tm-role">${e.role}</div>
      <div class="tm-org">${e.org}</div>
      <div class="tm-desc">${e.desc}</div>
      <div class="tm-tags">${e.tags.map(t=>`<span class="ttag">${t}</span>`).join('')}</div>
    `;
    tm.appendChild(el);
  });

  // CONTACT CTAs
  const ctaRow = document.getElementById('contact-cta-row');
  CONFIG.contact.forEach(c => {
    const a = document.createElement('a');
    a.className = `cta-link${c.primary ? ' primary' : ''}`;
    a.href = c.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = c.label;
    ctaRow.appendChild(a);
  });

  // Contact form
  document.getElementById('contact-form').addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('.cf-submit');
    btn.textContent = 'Sent ✓';
    setTimeout(() => { btn.textContent = 'Send →'; e.target.reset(); }, 3000);
  });
}

/* ══════════════════════════════════════════════════════════════
   PROJECT MODAL
   ══════════════════════════════════════════════════════════════ */
function openModal(p) {
  const modal = document.getElementById('project-modal');
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-title">${p.title}</div>
    <div class="modal-tags">${p.tags.map(t=>`<span class="modal-tag">${t}</span>`).join('')}</div>
    <div class="modal-sec">Problem</div>
    <div class="modal-text">${p.problem}</div>
    <div class="modal-sec">Solution</div>
    <div class="modal-text">${p.solution}</div>
    <div class="modal-links">
      <a class="modal-link" href="#" target="_blank">GitHub →</a>
      <a class="modal-link" href="#" target="_blank">Live Demo →</a>
    </div>
  `;
  modal.classList.add('open');
}
function closeModal() {
  document.getElementById('project-modal').classList.remove('open');
}

/* ══════════════════════════════════════════════════════════════
   FACE CONTENT — POSITION & SIZE
   The #face-content div maps pixel-perfectly to the cube face.
   When the cube is facing the camera squarely, the face's
   screen-space size is calculated and matched.
   ══════════════════════════════════════════════════════════════ */
function positionFaceContent() {
  // The cube's front face spans from -1.03 to +1.03 world units (3×3 pieces)
  const cubeHalfWorldSize = 1.03; // half the full cube edge
  // Project two points to screen space
  const v1 = new THREE.Vector3(-cubeHalfWorldSize, -cubeHalfWorldSize, cubeHalfWorldSize);
  const v2 = new THREE.Vector3( cubeHalfWorldSize,  cubeHalfWorldSize, cubeHalfWorldSize);
  v1.project(camera);
  v2.project(camera);
  const x1 = (v1.x + 1) / 2 * window.innerWidth;
  const x2 = (v2.x + 1) / 2 * window.innerWidth;
  const y1 = (1 - v1.y) / 2 * window.innerHeight;
  const y2 = (1 - v2.y) / 2 * window.innerHeight;
  const faceScreenSize = Math.min(Math.abs(x2 - x1), Math.abs(y1 - y2));

  const fc = document.getElementById('face-content');
  // Slightly smaller than the cube face for a "painted on" feel
  const contentSize = faceScreenSize * 0.92;
  fc.style.width  = contentSize + 'px';
  fc.style.height = contentSize + 'px';
  // Remove CSS var override — let it use exact pixel value
  document.documentElement.style.setProperty('--face-size', contentSize + 'px');
}

/* ══════════════════════════════════════════════════════════════
   CHROME — Update HUD
   ══════════════════════════════════════════════════════════════ */
function updateChrome(idx) {
  document.getElementById('ch-current').textContent = String(idx + 1).padStart(2, '0');
  document.getElementById('face-tag-text').textContent = CONFIG.faces[idx];
  document.querySelectorAll('.nav-label').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
  // Prev/next arrows
  document.getElementById('nav-prev').disabled = idx === 0;
  document.getElementById('nav-next').disabled = idx === FACE_ROTATIONS.length - 1;
}

/* ══════════════════════════════════════════════════════════════
   FACE CONTENT REVEAL
   Children animate in sequentially — feel physically attached
   to the cube surface (lift out, not float in from side)
   ══════════════════════════════════════════════════════════════ */
function revealFaceContent(idx) {
  const face = document.getElementById(`face-${idx}`);
  if (!face) return;

  // Show container
  face.style.opacity   = '1';
  face.style.pointerEvents = 'auto';

  // Get direct children to animate in
  const children = Array.from(face.children);
  gsap.set(children, { opacity: 0, y: 8, scale: 0.97 });

  gsap.to(children, {
    opacity:  1,
    y:        0,
    scale:    1,
    duration: 0.5,
    stagger:  0.06,
    ease:     'power3.out',
    delay:    0.08,
  });
}

function hideFaceContent(idx, onComplete) {
  const face = document.getElementById(`face-${idx}`);
  if (!face) { onComplete?.(); return; }

  const children = Array.from(face.children);
  gsap.to(children, {
    opacity:  0,
    y:        -6,
    scale:    0.96,
    duration: 0.28,
    stagger:  0.03,
    ease:     'power2.in',
    onComplete: () => {
      face.style.opacity = '0';
      face.style.pointerEvents = 'none';
      onComplete?.();
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   CUBE FACE STICKER EMISSIVE — pulse on active face
   ══════════════════════════════════════════════════════════════ */
function pulseActiveStickers(intensity) {
  if (!cubeGroup) return;
  cubeGroup.traverse(c => {
    if (c.isMesh && c.userData.isSticker && c.material) {
      gsap.to(c.material, {
        emissiveIntensity: intensity,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   CORE STATE MACHINE — TRANSITION SEQUENCE
   ══════════════════════════════════════════════════════════════

   Flow:
   1. HIDE_CONTENT   — content collapses off the face
   2. ROTATE         — cube rotates with anticipation → overshoot → settle
   3. LOCK           — cube perfectly perpendicular, no motion
   4. PAUSE          — 400ms of silence (anticipation)
   5. REVEAL         — content loads onto the new face
   6. Back to IDLE

   ══════════════════════════════════════════════════════════════ */
function transitionToFace(nextIdx) {
  if (isTransitioning) return;
  if (nextIdx === currentFaceIdx) return;
  if (nextIdx < 0 || nextIdx >= FACE_ROTATIONS.length) return;

  isTransitioning = true;
  currentState    = State.HIDE_CONTENT;

  // Block interaction during transition
  const blocker = document.getElementById('transition-blocker');
  if (blocker) blocker.classList.add('active');

  // Dim stickers slightly — cube is "empty" during rotation
  pulseActiveStickers(0.08);

  // STEP 1 — Hide current face content
  hideFaceContent(currentFaceIdx, () => {

    currentState = State.ROTATE;

    // Camera very subtle push in during rotation — cinematic, not dramatic
    gsap.to(camera.position, {
      z: 9.0,
      duration: 0.2,
      ease: 'power2.in',
    });

    // STEP 2 — Rotate the cube
    // Determine target Euler for next face
    const target = FACE_ROTATIONS[nextIdx].euler;

    // Calculate shortest path for Y rotation
    // (avoid spinning the wrong way around)
    const tl = gsap.timeline({
      onComplete: () => {
        currentState = State.LOCK;
        onRotateComplete();
      }
    });

    // Anticipation: tiny counter-motion before the big rotate
    tl.to(cubeGroup.rotation, {
      x: FACE_ROTATIONS[currentFaceIdx].euler[0] - (target[0] - FACE_ROTATIONS[currentFaceIdx].euler[0]) * 0.06,
      y: FACE_ROTATIONS[currentFaceIdx].euler[1] - (target[1] - FACE_ROTATIONS[currentFaceIdx].euler[1]) * 0.06,
      z: FACE_ROTATIONS[currentFaceIdx].euler[2] - (target[2] - FACE_ROTATIONS[currentFaceIdx].euler[2]) * 0.06,
      duration: 0.18,
      ease: 'power2.in',
    });

    // Main rotation — expo out with slight overshoot via power4.out
    tl.to(cubeGroup.rotation, {
      x: target[0],
      y: target[1],
      z: target[2],
      duration: 0.82,
      ease: 'power4.out',
    });

    // Microscopic settle — the overshoot correction
    tl.to(cubeGroup.rotation, {
      x: target[0],
      y: target[1],
      z: target[2],
      duration: 0.22,
      ease: 'elastic.out(1, 0.6)',
    });
  });

  function onRotateComplete() {
    // Snap cube exactly perpendicular — zero drift
    cubeGroup.rotation.set(...FACE_ROTATIONS[nextIdx].euler);
    mouseSmooth.x = 0;
    mouseSmooth.y = 0;

    // Camera returns to nominal position
    gsap.to(camera.position, {
      z: 9.5,
      duration: 0.35,
      ease: 'power2.out',
    });

    currentFaceIdx = nextIdx;
    updateChrome(currentFaceIdx);

    // STEP 3 — Locked. Brief silence before content appears.
    currentState = State.PAUSE;
    setTimeout(() => {

      // STEP 4 — Reveal content
      currentState = State.REVEAL;
      pulseActiveStickers(0.22);
      revealFaceContent(currentFaceIdx);

      // Brief delay then return to IDLE
      setTimeout(() => {
        currentState    = State.IDLE;
        isTransitioning = false;
        if (blocker) blocker.classList.remove('active');
      }, 600);

    }, 380); // pause duration — cinematic silence
  }
}

/* ══════════════════════════════════════════════════════════════
   INPUT SYSTEM
   Discrete chapter progression — no scroll scrubbing
   ══════════════════════════════════════════════════════════════ */
function initInput() {
  // Wheel — advance one face per discrete scroll
  // Listen on multiple targets to catch sandboxed iframe delivery differences
  let wheelCooldown = false;
  function onWheel(e) {
    if (wheelCooldown || isTransitioning) return;
    wheelCooldown = true;
    setTimeout(() => { wheelCooldown = false; }, 900); // long enough to not double-fire
    if (e.deltaY > 2 || e.deltaX > 2) {
      transitionToFace(currentFaceIdx + 1);
    } else if (e.deltaY < -2 || e.deltaX < -2) {
      transitionToFace(currentFaceIdx - 1);
    }
  }
  window.addEventListener('wheel', onWheel, { passive: true });
  document.getElementById('main-canvas').addEventListener('wheel', onWheel, { passive: true });
  document.getElementById('face-content').addEventListener('wheel', onWheel, { passive: true });

  // Keyboard — arrow keys / j/k
  window.addEventListener('keydown', e => {
    if (isTransitioning) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'j') {
      transitionToFace(currentFaceIdx + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'k') {
      transitionToFace(currentFaceIdx - 1);
    }
  });

  // Touch swipe
  let touchY0 = 0;
  window.addEventListener('touchstart', e => { touchY0 = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', e => {
    if (isTransitioning) return;
    const dy = touchY0 - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 40) return;
    transitionToFace(currentFaceIdx + (dy > 0 ? 1 : -1));
  }, { passive: true });

  // Nav arrows
  document.getElementById('nav-prev').addEventListener('click', () => {
    transitionToFace(currentFaceIdx - 1);
  });
  document.getElementById('nav-next').addEventListener('click', () => {
    transitionToFace(currentFaceIdx + 1);
  });

  // Navigation labels — click to jump
  document.querySelectorAll('.nav-label').forEach(dot => {
    dot.addEventListener('click', () => {
      transitionToFace(parseInt(dot.dataset.idx));
    });
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('project-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('project-modal')) closeModal();
  });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ══════════════════════════════════════════════════════════════
   PRELOADER
   ══════════════════════════════════════════════════════════════ */
function runPreloader(onDone) {
  const canvas = document.getElementById('pre-canvas');
  canvas.width = 160; canvas.height = 160;
  const ctx = canvas.getContext('2d');
  const bar = document.getElementById('pre-bar');
  const lbl = document.getElementById('pre-label');

  const dots = ['', '.', '..', '...'];
  let dotIdx = 0;
  const dotTimer = setInterval(() => {
    dotIdx = (dotIdx + 1) % 4;
    lbl.textContent = 'Initializing System' + dots[dotIdx];
  }, 350);

  let prog = 0;
  let done = false;

  function drawCube(t) {
    ctx.clearRect(0, 0, 160, 160);
    const cx = 80, cy = 80;
    const s  = Math.min(t, 1);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * Math.PI * 1.4);
    ctx.scale(s * 0.88, s * 0.88);
    // top face
    ctx.beginPath();
    ctx.moveTo(0, -44); ctx.lineTo(38, -24); ctx.lineTo(0, -4); ctx.lineTo(-38, -24);
    ctx.closePath();
    ctx.fillStyle = '#2979F2'; ctx.fill();
    // left face
    ctx.beginPath();
    ctx.moveTo(-38, -24); ctx.lineTo(0, -4); ctx.lineTo(0, 36); ctx.lineTo(-38, 16);
    ctx.closePath();
    ctx.fillStyle = '#2DBB6B'; ctx.fill();
    // right face
    ctx.beginPath();
    ctx.moveTo(0, -4); ctx.lineTo(38, -24); ctx.lineTo(38, 16); ctx.lineTo(0, 36);
    ctx.closePath();
    ctx.fillStyle = '#E8293A'; ctx.fill();
    // edges
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0,-44); ctx.lineTo(38,-24); ctx.lineTo(0,-4); ctx.lineTo(-38,-24); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-4); ctx.lineTo(0,36); ctx.moveTo(-38,-24); ctx.lineTo(-38,16); ctx.moveTo(38,-24); ctx.lineTo(38,16); ctx.stroke();
    ctx.restore();
  }

  function finish() {
    if (done) return;
    done = true;
    clearInterval(dotTimer);
    bar.style.width = '100%';
    lbl.textContent = 'System Ready';
    setTimeout(() => {
      gsap.to('#preloader', {
        opacity: 0, duration: 0.7, ease: 'power2.inOut',
        onComplete: () => {
          document.getElementById('preloader').style.display = 'none';
          onDone();
        }
      });
    }, 200);
  }

  // Timer-based (works in all environments)
  const START = Date.now();
  const DUR   = 2000;
  const timer = setInterval(() => {
    prog = Math.min((Date.now() - START) / DUR, 1);
    bar.style.width = (prog * 100) + '%';
    drawCube(prog);
    if (prog >= 1) { clearInterval(timer); finish(); }
  }, 16);

  // Safety net
  setTimeout(finish, 2800);

  // Skip on click/key
  canvas.parentElement.addEventListener('click', finish, { once: true });
  document.addEventListener('keydown', finish, { once: true });
}

/* ══════════════════════════════════════════════════════════════
   BOOT SEQUENCE
   ══════════════════════════════════════════════════════════════ */
function boot() {
  runPreloader(() => {

    // Fade in scene
    gsap.to('#scene', { opacity: 1, duration: 0.8, ease: 'power2.out' });

    // Init Three.js
    initThree();

    // Populate dynamic content
    populateContent();

    // Setup input
    initInput();

    // Wait one frame for Three to render, then measure cube on screen
    requestAnimationFrame(() => {
      positionFaceContent();
      updateChrome(0);

      // Reveal face 0 — HERO
      // Small delay so Three.js has drawn at least one frame
      setTimeout(() => {
        // Cube entrance — scale in from zero with spring
        if (cubeGroup) {
          cubeGroup.scale.set(0, 0, 0);
          gsap.to(cubeGroup.scale, {
            x: 1, y: 1, z: 1,
            duration: 1.1,
            ease: 'back.out(1.4)',
          });
        }

        // Reveal hero face content after cube lands
        setTimeout(() => {
          revealFaceContent(0);
          currentState = State.IDLE;
        }, 700);
      }, 100);
    });
  });
}

boot();
