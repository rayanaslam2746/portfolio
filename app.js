/**
 * CUBE PORTFOLIO v3 — SPLIT-SCREEN STATE MACHINE
 *
 * Hero:    cube centered, name above, hint below
 * Scroll:  cube slides left, panel slides in from right
 * Next:    cube slides right, panel slides in from left
 * Pattern: cube alternates sides, content always on opposite side
 *
 * STATE MACHINE:
 * IDLE → HIDE_CONTENT → ROTATE → LOCK → PAUSE → REVEAL → IDLE
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const gsap = window.gsap;

/* ══════════════════════════════════════════════════════════════
   CONTENT CONFIG
   ══════════════════════════════════════════════════════════════ */
const CONFIG = {
  faces: ['Hero', 'About', 'Projects', 'Architecture', 'Experience', 'Contact'],

  projects: [
    { title: 'Portfolio',    tags: ['Three.js','GSAP','WebGL'],        color: '#2979F2', problem: 'How do you stand out in a sea of static resume sites?',        solution: 'A face-based 3D narrative — the cube IS the interface.' },
    { title: 'AI Research',  tags: ['Python','PyTorch','NLP'],          color: '#2DBB6B', problem: 'Placeholder — describe your research problem.',                 solution: 'Placeholder — describe your approach and results.' },
    { title: 'Startup',      tags: ['React','FastAPI','PostgreSQL'],    color: '#F5C842', problem: 'Placeholder — describe the user problem you solved.',           solution: 'Placeholder — describe the system and outcome.' },
    { title: 'Web App',      tags: ['Next.js','TypeScript','Prisma'],   color: '#E8293A', problem: 'Placeholder — add your project description.',                  solution: 'Placeholder — add architecture details.' },
    { title: 'Data Viz',     tags: ['D3.js','Python','Pandas'],         color: '#F06B20', problem: 'Placeholder — add your project description.',                  solution: 'Placeholder — add architecture details.' },
    { title: 'Hackathon',    tags: ['React','Node.js','API'],           color: '#4F98A3', problem: 'Placeholder — add your hackathon challenge.',                  solution: 'Placeholder — add what you built.' },
    { title: 'Automation',   tags: ['Python','Selenium','AWS'],         color: '#2979F2', problem: 'Placeholder — describe the automation challenge.',             solution: 'Placeholder — describe what you automated.' },
    { title: 'ML Tool',      tags: ['PyTorch','ONNX','FastAPI'],        color: '#2DBB6B', problem: 'Placeholder — describe your ML problem.',                      solution: 'Placeholder — describe the model and deployment.' },
    { title: 'Open Source',  tags: ['TypeScript','CLI','npm'],          color: '#E8293A', problem: 'Placeholder — describe the open source need.',                 solution: 'Placeholder — describe your contribution.' },
  ],

  skills: {
    frontend: ['React', 'TypeScript', 'Next.js', 'Three.js', 'CSS / GSAP'],
    ai:       ['PyTorch', 'Python', 'Pandas', 'Transformers', 'Scikit-Learn'],
    backend:  ['FastAPI', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
  },

  experience: [
    { date: '2024 — Present', role: 'Software Engineering Intern', org: 'Placeholder Company',  desc: 'Placeholder — describe your role, team, and impact.',       tags: ['React','Python','AWS'] },
    { date: '2023 — 2024',   role: 'AI Research Assistant',       org: 'Rutgers University',    desc: 'Placeholder — describe your research project and methods.',  tags: ['PyTorch','NLP','Research'] },
    { date: '2023',           role: 'Full-Stack Developer',         org: 'Freelance',             desc: 'Placeholder — describe freelance projects you shipped.',     tags: ['React','Node.js','PostgreSQL'] },
    { date: '2022 — 2023',   role: 'Technical Lead',               org: 'Student Organization', desc: 'Placeholder — describe your leadership role and outcomes.',  tags: ['Leadership','Full-Stack'] },
    { date: '2021 — Present', role: 'B.S. Computer Science',        org: 'Rutgers University',    desc: 'Coursework: Data Structures, Algorithms, ML, Systems.',     tags: ['CS','AI/ML','Systems'] },
  ],

  contact: [
    { label: 'GitHub',   href: 'https://github.com/',                primary: false },
    { label: 'LinkedIn', href: 'https://linkedin.com/',               primary: false },
    { label: 'Resume',   href: '#',                                    primary: true  },
    { label: 'Email',    href: 'mailto:rra98@scarletmail.rutgers.edu', primary: false },
  ],
};

/* ══════════════════════════════════════════════════════════════
   FACE ROTATION MAP
   Index 0 shows the white (+y) face toward camera.
   ══════════════════════════════════════════════════════════════ */
const FACE_ROTATIONS = [
  { euler: [ Math.PI / 2, 0, 0],          label: 'Hero'         }, // +y (white) → front
  { euler: [0, 0, 0],                     label: 'About'        }, // +z (blue)  → front
  { euler: [0, -Math.PI / 2, 0],          label: 'Projects'     }, // +x (orange)→ front
  { euler: [0, -Math.PI, 0],              label: 'Architecture'  }, // -z (green) → front
  { euler: [0,  Math.PI / 2, 0],          label: 'Experience'   }, // -x (red)   → front
  { euler: [-Math.PI / 2, 0, 0],          label: 'Contact'      }, // -y (yellow)→ front
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
let currentState   = State.IDLE;
let currentFaceIdx = 0;
let isTransitioning = false;

/* ══════════════════════════════════════════════════════════════
   THREE.JS GLOBALS
   ══════════════════════════════════════════════════════════════ */
let renderer, scene, camera;
let cubeGroup;
let clock;
let mouseTarget = { x: 0, y: 0 };
let mouseSmooth = { x: 0, y: 0 };

/* ══════════════════════════════════════════════════════════════
   CUBE POSITION HELPERS
   Odd faces: cube on left (x = -1.5), panel on right
   Even faces (non-zero): cube on right (x = +1.5), panel on left
   ══════════════════════════════════════════════════════════════ */
function getCubeTargetX(faceIdx) {
  if (faceIdx === 0) return 0;
  return faceIdx % 2 === 1 ? -1.5 : 1.5;
}

function getPanelClass(faceIdx) {
  return faceIdx % 2 === 1 ? 'on-right' : 'on-left';
}

/* ══════════════════════════════════════════════════════════════
   SCENE SETUP
   ══════════════════════════════════════════════════════════════ */
function initThree() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070707);
  scene.fog = new THREE.FogExp2(0x070707, 0.028);

  camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9.5);
  camera.lookAt(0, 0, 0);

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
  buildParticles();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('mousemove', e => {
    mouseTarget.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  renderLoop();
}

function buildLights() {
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(5, 7, 8);
  key.castShadow = true;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x4F98A3, 0.8);
  rim.position.set(-6, 1, -5);
  scene.add(rim);

  const fill = new THREE.AmbientLight(0xffffff, 0.18);
  scene.add(fill);

  const warm = new THREE.PointLight(0xF5C842, 0.5, 14);
  warm.position.set(3, -3, 4);
  scene.add(warm);
}

/* ══════════════════════════════════════════════════════════════
   PROCEDURAL CUBE
   ══════════════════════════════════════════════════════════════ */
function buildCube() {
  cubeGroup = new THREE.Group();
  scene.add(cubeGroup);

  const SIZE = 0.62;
  const GAP  = 0.03;
  const STEP = SIZE + GAP;

  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x0c0c0c, metalness: 0.9, roughness: 0.08,
    reflectivity: 0.95, clearcoat: 1.0, clearcoatRoughness: 0.04,
  });

  const faceColors = {
    '+x': 0xF06B20, '-x': 0xE8293A,
    '+y': 0xE8E8E0, '-y': 0xF5C842,
    '+z': 0x2979F2, '-z': 0x2DBB6B,
  };

  const stickerMats = {};
  for (const [dir, col] of Object.entries(faceColors)) {
    stickerMats[dir] = new THREE.MeshStandardMaterial({
      color: col, emissive: col, emissiveIntensity: 0.18,
      roughness: 0.5, metalness: 0.0,
    });
  }

  const faces3D = [
    { dir: '+x', rot: [0,  Math.PI/2, 0], pos: [SIZE/2 + 0.004, 0, 0] },
    { dir: '-x', rot: [0, -Math.PI/2, 0], pos: [-SIZE/2 - 0.004, 0, 0] },
    { dir: '+y', rot: [-Math.PI/2, 0, 0], pos: [0,  SIZE/2 + 0.004, 0] },
    { dir: '-y', rot: [ Math.PI/2, 0, 0], pos: [0, -SIZE/2 - 0.004, 0] },
    { dir: '+z', rot: [0, 0, 0],           pos: [0, 0,  SIZE/2 + 0.004] },
    { dir: '-z', rot: [0, Math.PI, 0],     pos: [0, 0, -SIZE/2 - 0.004] },
  ];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const piece = new THREE.Group();
        piece.position.set(x * STEP, y * STEP, z * STEP);

        const geo  = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
        const mesh = new THREE.Mesh(geo, shellMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        piece.add(mesh);

        const stickerGeo = new THREE.PlaneGeometry(SIZE * 0.74, SIZE * 0.74);
        for (const f of faces3D) {
          const exposed =
            (f.dir === '+x' && x === 1)  || (f.dir === '-x' && x === -1) ||
            (f.dir === '+y' && y === 1)  || (f.dir === '-y' && y === -1) ||
            (f.dir === '+z' && z === 1)  || (f.dir === '-z' && z === -1);
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

  // Start showing white face (top) toward camera
  cubeGroup.rotation.set(...FACE_ROTATIONS[0].euler);
}

/* ══════════════════════════════════════════════════════════════
   GLB OVERRIDE
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
        if (c.material) { c.material.metalness = 0.15; c.material.roughness = 0.4; }
      }
    });

    scene.remove(cubeGroup);
    const newGroup = new THREE.Group();
    newGroup.add(model);
    newGroup.rotation.set(...FACE_ROTATIONS[0].euler);
    scene.add(newGroup);
    cubeGroup = newGroup;
  }, undefined, err => {
    console.warn('GLB failed, using procedural cube:', err.message);
  });
}

/* ══════════════════════════════════════════════════════════════
   PARTICLES
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
  const mat = new THREE.PointsMaterial({ color: 0x4F98A3, size: 0.025, transparent: true, opacity: 0.35, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  const origPos = pos.slice();
  let t = 0;
  pts.userData.drift = () => {
    t += 0.0004;
    for (let i = 0; i < N; i++) {
      pts.geometry.attributes.position.array[i*3+1] = origPos[i*3+1] + Math.sin(t + i * 0.7) * 0.15;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  };
  scene.userData.particles = pts;
}

/* ══════════════════════════════════════════════════════════════
   RENDER LOOP
   ══════════════════════════════════════════════════════════════ */
function renderLoop() {
  requestAnimationFrame(renderLoop);

  if (currentState === State.IDLE) {
    mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * 0.04;
    mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * 0.04;

    if (cubeGroup) {
      cubeGroup.rotation.x = THREE.MathUtils.lerp(
        cubeGroup.rotation.x,
        FACE_ROTATIONS[currentFaceIdx].euler[0] - mouseSmooth.y * 0.035,
        0.06
      );
      cubeGroup.rotation.y = THREE.MathUtils.lerp(
        cubeGroup.rotation.y,
        FACE_ROTATIONS[currentFaceIdx].euler[1] + mouseSmooth.x * 0.035,
        0.06
      );
    }
  }

  if (scene.userData.particles?.userData?.drift) {
    scene.userData.particles.userData.drift();
  }

  renderer.render(scene, camera);
}

/* ══════════════════════════════════════════════════════════════
   CONTENT POPULATION
   ══════════════════════════════════════════════════════════════ */
function populateContent() {
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

  ['frontend','ai','backend'].forEach(axis => {
    const el = document.getElementById(`skill-${axis}`);
    CONFIG.skills[axis].forEach(s => {
      const chip = document.createElement('div');
      chip.className = 'skill-chip';
      chip.textContent = s;
      el.appendChild(chip);
    });
  });

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
  document.getElementById('project-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('project-modal').classList.remove('open');
}

/* ══════════════════════════════════════════════════════════════
   STICKER EMISSIVE PULSE
   ══════════════════════════════════════════════════════════════ */
function pulseActiveStickers(intensity) {
  if (!cubeGroup) return;
  cubeGroup.traverse(c => {
    if (c.isMesh && c.userData.isSticker && c.material) {
      gsap.to(c.material, { emissiveIntensity: intensity, duration: 0.6, ease: 'power2.out' });
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   HERO OVERLAY SHOW / HIDE
   ══════════════════════════════════════════════════════════════ */
function showHeroOverlay(isFirst) {
  const el = document.getElementById('hero-overlay');
  const items = el.querySelectorAll('.hero-eyebrow, .hero-name, .hero-school, .hero-hint');
  gsap.fromTo(el,   { opacity: 0, y: isFirst ? 0 : 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  gsap.fromTo(items,{ opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.1 });
}

function hideHeroOverlay(onComplete) {
  const el = document.getElementById('hero-overlay');
  gsap.to(el, { opacity: 0, y: -18, duration: 0.32, ease: 'power2.in', onComplete });
}

/* ══════════════════════════════════════════════════════════════
   SIDE PANEL SHOW / HIDE
   Right panel (odd faces):  enters/exits from the right
   Left panel (even faces):  enters/exits from the left
   ══════════════════════════════════════════════════════════════ */
function showPanel(faceIdx) {
  const panel = document.getElementById('side-panel');

  // Deactivate all faces
  document.querySelectorAll('.panel-face').forEach(f => {
    f.style.opacity      = '0';
    f.style.pointerEvents = 'none';
  });

  // Activate target face
  const face = document.getElementById(`panel-${faceIdx}`);
  if (face) {
    face.style.opacity      = '1';
    face.style.pointerEvents = 'auto';
  }

  // Position panel on correct side
  panel.className = getPanelClass(faceIdx);

  // Slide direction: right panel from right (+), left panel from left (-)
  const xStart = faceIdx % 2 === 1 ? 70 : -70;

  gsap.fromTo(panel,
    { x: xStart, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
  );

  // Stagger children of the face
  if (face) {
    const children = Array.from(face.children);
    gsap.fromTo(children,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out', delay: 0.14 }
    );
  }
}

function hidePanel(onComplete) {
  const panel = document.getElementById('side-panel');
  const xOut  = panel.classList.contains('on-right') ? 70 : -70;

  gsap.to(panel, {
    x: xOut, opacity: 0, duration: 0.3, ease: 'power2.in',
    onComplete: () => {
      gsap.set(panel, { x: 0 });
      onComplete?.();
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   CHROME UPDATE
   ══════════════════════════════════════════════════════════════ */
function updateChrome(idx) {
  document.getElementById('ch-current').textContent = String(idx + 1).padStart(2, '0');
  document.getElementById('face-tag-text').textContent = CONFIG.faces[idx];
  document.querySelectorAll('.nav-label').forEach((d, i) => d.classList.toggle('active', i === idx));
  document.getElementById('nav-prev').disabled = idx === 0;
  document.getElementById('nav-next').disabled = idx === FACE_ROTATIONS.length - 1;
}

/* ══════════════════════════════════════════════════════════════
   STATE MACHINE — TRANSITION
   ══════════════════════════════════════════════════════════════ */
function transitionToFace(nextIdx) {
  if (isTransitioning) return;
  if (nextIdx === currentFaceIdx) return;
  if (nextIdx < 0 || nextIdx >= FACE_ROTATIONS.length) return;

  isTransitioning = true;
  currentState    = State.HIDE_CONTENT;

  const blocker = document.getElementById('transition-blocker');
  if (blocker) blocker.classList.add('active');

  pulseActiveStickers(0.06);

  // STEP 1 — Hide current content
  const onHideComplete = () => {
    currentState = State.ROTATE;

    const target  = FACE_ROTATIONS[nextIdx].euler;
    const targetX = getCubeTargetX(nextIdx);

    // Subtle camera push
    gsap.to(camera.position, { z: 9.0, duration: 0.2, ease: 'power2.in' });

    // Slide cube to new side simultaneously with rotation
    gsap.to(cubeGroup.position, { x: targetX, duration: 1.0, ease: 'power3.inOut' });

    // Rotation sequence: anticipation → main → settle
    const tl = gsap.timeline({ onComplete: onRotateComplete });

    const cur = FACE_ROTATIONS[currentFaceIdx].euler;
    tl.to(cubeGroup.rotation, {
      x: cur[0] - (target[0] - cur[0]) * 0.06,
      y: cur[1] - (target[1] - cur[1]) * 0.06,
      z: cur[2] - (target[2] - cur[2]) * 0.06,
      duration: 0.18, ease: 'power2.in',
    });
    tl.to(cubeGroup.rotation, {
      x: target[0], y: target[1], z: target[2],
      duration: 0.82, ease: 'power4.out',
    });
    tl.to(cubeGroup.rotation, {
      x: target[0], y: target[1], z: target[2],
      duration: 0.22, ease: 'elastic.out(1, 0.6)',
    });
  };

  if (currentFaceIdx === 0) {
    hideHeroOverlay(onHideComplete);
  } else {
    hidePanel(onHideComplete);
  }

  function onRotateComplete() {
    // Snap exactly perpendicular
    cubeGroup.rotation.set(...FACE_ROTATIONS[nextIdx].euler);
    mouseSmooth.x = 0;
    mouseSmooth.y = 0;

    gsap.to(camera.position, { z: 9.5, duration: 0.35, ease: 'power2.out' });

    currentFaceIdx = nextIdx;
    updateChrome(currentFaceIdx);

    // STEP 3 — Brief pause, then reveal
    currentState = State.PAUSE;
    setTimeout(() => {
      currentState = State.REVEAL;
      pulseActiveStickers(0.22);

      if (nextIdx === 0) {
        showHeroOverlay(false);
      } else {
        showPanel(nextIdx);
      }

      setTimeout(() => {
        currentState    = State.IDLE;
        isTransitioning = false;
        if (blocker) blocker.classList.remove('active');
      }, 600);
    }, 320);
  }
}

/* ══════════════════════════════════════════════════════════════
   INPUT
   ══════════════════════════════════════════════════════════════ */
function initInput() {
  let wheelCooldown = false;
  function onWheel(e) {
    if (wheelCooldown || isTransitioning) return;
    wheelCooldown = true;
    setTimeout(() => { wheelCooldown = false; }, 900);
    if (e.deltaY > 2 || e.deltaX > 2)   transitionToFace(currentFaceIdx + 1);
    else if (e.deltaY < -2 || e.deltaX < -2) transitionToFace(currentFaceIdx - 1);
  }
  window.addEventListener('wheel', onWheel, { passive: true });
  document.getElementById('main-canvas').addEventListener('wheel', onWheel, { passive: true });

  window.addEventListener('keydown', e => {
    if (isTransitioning) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'j') transitionToFace(currentFaceIdx + 1);
    else if (e.key === 'ArrowUp'  || e.key === 'ArrowLeft'  || e.key === 'k') transitionToFace(currentFaceIdx - 1);
  });

  let touchY0 = 0;
  window.addEventListener('touchstart', e => { touchY0 = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', e => {
    if (isTransitioning) return;
    const dy = touchY0 - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 40) return;
    transitionToFace(currentFaceIdx + (dy > 0 ? 1 : -1));
  }, { passive: true });

  document.getElementById('nav-prev').addEventListener('click', () => transitionToFace(currentFaceIdx - 1));
  document.getElementById('nav-next').addEventListener('click', () => transitionToFace(currentFaceIdx + 1));

  document.querySelectorAll('.nav-label').forEach(dot => {
    dot.addEventListener('click', () => transitionToFace(parseInt(dot.dataset.idx)));
  });

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
  const dotTimer = setInterval(() => { dotIdx = (dotIdx + 1) % 4; lbl.textContent = 'Initializing System' + dots[dotIdx]; }, 350);

  let prog = 0, done = false;

  function drawCube(t) {
    ctx.clearRect(0, 0, 160, 160);
    const cx = 80, cy = 80, s = Math.min(t, 1);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * Math.PI * 1.4);
    ctx.scale(s * 0.88, s * 0.88);
    ctx.beginPath(); ctx.moveTo(0,-44); ctx.lineTo(38,-24); ctx.lineTo(0,-4); ctx.lineTo(-38,-24); ctx.closePath(); ctx.fillStyle='#2979F2'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-38,-24); ctx.lineTo(0,-4); ctx.lineTo(0,36); ctx.lineTo(-38,16); ctx.closePath(); ctx.fillStyle='#2DBB6B'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,-4); ctx.lineTo(38,-24); ctx.lineTo(38,16); ctx.lineTo(0,36); ctx.closePath(); ctx.fillStyle='#E8293A'; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=0.5;
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
      gsap.to('#preloader', { opacity: 0, duration: 0.7, ease: 'power2.inOut', onComplete: () => {
        document.getElementById('preloader').style.display = 'none';
        onDone();
      }});
    }, 200);
  }

  const START = Date.now(), DUR = 2000;
  const timer = setInterval(() => {
    prog = Math.min((Date.now() - START) / DUR, 1);
    bar.style.width = (prog * 100) + '%';
    drawCube(prog);
    if (prog >= 1) { clearInterval(timer); finish(); }
  }, 16);

  setTimeout(finish, 2800);
  canvas.parentElement.addEventListener('click', finish, { once: true });
  document.addEventListener('keydown', finish, { once: true });
}

/* ══════════════════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════════════════ */
function boot() {
  runPreloader(() => {
    gsap.to('#scene', { opacity: 1, duration: 0.8, ease: 'power2.out' });

    initThree();
    populateContent();
    initInput();

    requestAnimationFrame(() => {
      updateChrome(0);

      setTimeout(() => {
        // Cube entrance
        if (cubeGroup) {
          cubeGroup.scale.set(0, 0, 0);
          gsap.to(cubeGroup.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'back.out(1.4)' });
        }

        // Reveal hero after cube lands
        setTimeout(() => {
          showHeroOverlay(true);
          currentState = State.IDLE;
        }, 300);
      }, 100);
    });
  });
}

boot();
