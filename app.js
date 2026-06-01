/**
 * CUBE PORTFOLIO — SPLIT-SCREEN STATE MACHINE
 *
 * Home:   cube centered, name above, hint below
 * Scroll: cube slides left, panel slides in from right
 * Next:   cube slides right, panel slides in from left
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
   CONFIG
   ══════════════════════════════════════════════════════════════ */
const CONFIG = {
  faces: ['Home', 'About', 'Skills', 'Experience', 'Projects', 'Contact'],
};

/* ══════════════════════════════════════════════════════════════
   FACE ROTATION MAP
   Index 0 shows the white (+y) face toward camera.
   ══════════════════════════════════════════════════════════════ */
const FACE_ROTATIONS = [
  { euler: [0, 0, 0],             label: 'Home'       }, // +z (blue)   → front
  { euler: [ Math.PI / 2, 0, 0],  label: 'About'      }, // +y (white)  → front
  { euler: [0,  Math.PI / 2, 0],  label: 'Skills'     }, // -x (red)    → front
  { euler: [-Math.PI / 2, 0, 0],  label: 'Experience' }, // -y (yellow) → front
  { euler: [0, -Math.PI / 2, 0],  label: 'Projects'   }, // +x (orange) → front
  { euler: [0, -Math.PI, 0],      label: 'Contact'    }, // -z (green)  → front
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
let currentState    = State.IDLE;
let currentFaceIdx  = 0;
let isTransitioning = false;

/* ══════════════════════════════════════════════════════════════
   THREE.JS GLOBALS
   ══════════════════════════════════════════════════════════════ */
let renderer, scene, camera;
let cubeGroup;
let mouseTarget = { x: 0, y: 0 };
let mouseSmooth = { x: 0, y: 0 };

/* ══════════════════════════════════════════════════════════════
   POSITION HELPERS
   ══════════════════════════════════════════════════════════════ */
function getCubeTargetX(faceIdx) {
  if (faceIdx === 0) return 0;
  return faceIdx % 2 === 1 ? -2.2 : 2.2;
}

function getCubeTargetY(faceIdx) {
  return faceIdx === 0 ? -0.8 : 0;
}

function getPanelClass(faceIdx) {
  return faceIdx % 2 === 1 ? 'on-right' : 'on-left';
}

/* ══════════════════════════════════════════════════════════════
   SCENE SETUP
   ══════════════════════════════════════════════════════════════ */
function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF7F6F2);

  camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9.5);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('main-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  buildLights();
  buildCube();
  loadGLB();

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
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(5, 7, 8);
  key.castShadow = true;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, 0.55);
  fill.position.set(-5, -2, 4);
  scene.add(fill);

  const top = new THREE.DirectionalLight(0xfff8f0, 0.4);
  top.position.set(0, 8, 2);
  scene.add(top);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
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
    color: 0x111111, metalness: 0.85, roughness: 0.1,
    reflectivity: 0.95, clearcoat: 1.0, clearcoatRoughness: 0.05,
  });

  const faceColors = {
    '+x': 0xF06B20, '-x': 0xE8293A,
    '+y': 0xE8E8E0, '-y': 0xF5C842,
    '+z': 0x2979F2, '-z': 0x2DBB6B,
  };

  const stickerMats = {};
  for (const [dir, col] of Object.entries(faceColors)) {
    stickerMats[dir] = new THREE.MeshStandardMaterial({
      color: col, emissive: col, emissiveIntensity: 0.12,
      roughness: 0.45, metalness: 0.0,
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
    newGroup.position.set(cubeGroup.position.x, getCubeTargetY(currentFaceIdx), 0);
    scene.add(newGroup);
    cubeGroup = newGroup;
  }, undefined, err => {
    console.warn('GLB not found, using procedural cube:', err.message);
  });
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

  renderer.render(scene, camera);
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
   HOME OVERLAY
   ══════════════════════════════════════════════════════════════ */
function showHomeOverlay(isFirst) {
  const el    = document.getElementById('Home-overlay');
  const items = el.querySelectorAll('.Home-name, .Home-hint');
  gsap.fromTo(el,    { opacity: 0, y: isFirst ? 0 : 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  gsap.fromTo(items, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.1 });
}

function hideHomeOverlay(onComplete) {
  const el = document.getElementById('Home-overlay');
  gsap.to(el, { opacity: 0, y: -18, duration: 0.3, ease: 'power2.in', onComplete });
}

/* ══════════════════════════════════════════════════════════════
   SIDE PANEL
   ══════════════════════════════════════════════════════════════ */
function showPanel(faceIdx) {
  const panel = document.getElementById('side-panel');

  document.querySelectorAll('.panel-face').forEach(f => {
    f.style.opacity       = '0';
    f.style.pointerEvents = 'none';
  });

  const face = document.getElementById(`panel-${faceIdx}`);
  if (face) {
    face.style.opacity       = '1';
    face.style.pointerEvents = 'auto';
  }

  panel.className = getPanelClass(faceIdx);

  const xStart = faceIdx % 2 === 1 ? 60 : -60;
  gsap.fromTo(panel,
    { x: xStart, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
  );

  if (face) {
    const children = Array.from(face.children);
    gsap.fromTo(children,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out', delay: 0.12 }
    );
  }
}

function hidePanel(onComplete) {
  const panel = document.getElementById('side-panel');
  const xOut  = panel.classList.contains('on-right') ? 60 : -60;
  gsap.to(panel, {
    x: xOut, opacity: 0, duration: 0.28, ease: 'power2.in',
    onComplete: () => { gsap.set(panel, { x: 0 }); onComplete?.(); }
  });
}

/* ══════════════════════════════════════════════════════════════
   CHROME UPDATE
   ══════════════════════════════════════════════════════════════ */
function updateChrome(idx) {
  document.getElementById('face-tag-text').textContent = CONFIG.faces[idx];
  document.querySelectorAll('.nav-label').forEach((d, i) => d.classList.toggle('active', i === idx));
  document.getElementById('nav-prev').disabled = idx === 0;
  document.getElementById('nav-next').disabled = idx === FACE_ROTATIONS.length - 1;
  gsap.to('#page-name', { opacity: idx === 0 ? 0 : 1, duration: 0.35, ease: 'power2.out' });
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

  pulseActiveStickers(0.04);

  const onHideComplete = () => {
    currentState = State.ROTATE;

    const target  = FACE_ROTATIONS[nextIdx].euler;
    const targetX = getCubeTargetX(nextIdx);
    const targetY = getCubeTargetY(nextIdx);

    gsap.to(camera.position, { z: 9.0, duration: 0.25, ease: 'power2.in' });
    gsap.to(cubeGroup.position, { x: targetX, y: targetY, duration: 1.3, ease: 'power3.inOut' });

    // Rotate via the shortest angular path to the target face
    function nearAngle(from, to) {
      const d = ((to - from) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
      return from + d;
    }

    gsap.to(cubeGroup.rotation, {
      x: nearAngle(cubeGroup.rotation.x, target[0]),
      y: nearAngle(cubeGroup.rotation.y, target[1]),
      z: 0,
      duration: 1.3,
      ease: 'power2.inOut',
      onComplete: onRotateComplete,
    });
  };

  if (currentFaceIdx === 0) {
    hideHomeOverlay(onHideComplete);
  } else {
    hidePanel(onHideComplete);
  }

  function onRotateComplete() {
    cubeGroup.rotation.set(...FACE_ROTATIONS[nextIdx].euler);
    mouseSmooth.x = 0;
    mouseSmooth.y = 0;

    gsap.to(camera.position, { z: 9.5, duration: 0.35, ease: 'power2.out' });

    currentFaceIdx = nextIdx;
    updateChrome(currentFaceIdx);

    currentState = State.PAUSE;
    setTimeout(() => {
      currentState = State.REVEAL;
      pulseActiveStickers(0.2);

      if (nextIdx === 0) {
        showHomeOverlay(false);
      } else {
        showPanel(nextIdx);
      }

      setTimeout(() => {
        currentState    = State.IDLE;
        isTransitioning = false;
        if (blocker) blocker.classList.remove('active');
      }, 600);
    }, 300);
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
    setTimeout(() => { wheelCooldown = false; }, 950);
    if (e.deltaY > 2 || e.deltaX > 2)       transitionToFace(currentFaceIdx + 1);
    else if (e.deltaY < -2 || e.deltaX < -2) transitionToFace(currentFaceIdx - 1);
  }
  window.addEventListener('wheel', onWheel, { passive: true });
  document.getElementById('main-canvas').addEventListener('wheel', onWheel, { passive: true });

  window.addEventListener('keydown', e => {
    if (isTransitioning) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'j') transitionToFace(currentFaceIdx + 1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'k') transitionToFace(currentFaceIdx - 1);
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
}

/* ══════════════════════════════════════════════════════════════
   PRELOADER
   ══════════════════════════════════════════════════════════════ */
function runPreloader(onDone) {
  const canvas = document.getElementById('pre-canvas');
  canvas.width  = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  const bar = document.getElementById('pre-bar');
  const lbl = document.getElementById('pre-label');

  const dots = ['', '.', '..', '...'];
  let dotIdx = 0;
  const dotTimer = setInterval(() => {
    dotIdx = (dotIdx + 1) % 4;
    lbl.textContent = 'Loading' + dots[dotIdx];
  }, 380);

  let prog = 0, done = false;

  function drawCube(t) {
    ctx.clearRect(0, 0, 100, 100);
    const cx = 50, cy = 50;
    const s  = Math.min(t, 1);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * Math.PI * 1.4);
    ctx.scale(s * 0.88, s * 0.88);
    // Top face
    ctx.beginPath(); ctx.moveTo(0,-28); ctx.lineTo(24,-15); ctx.lineTo(0,-2); ctx.lineTo(-24,-15); ctx.closePath();
    ctx.fillStyle = '#1968D2'; ctx.fill();
    // Left face
    ctx.beginPath(); ctx.moveTo(-24,-15); ctx.lineTo(0,-2); ctx.lineTo(0,22); ctx.lineTo(-24,9); ctx.closePath();
    ctx.fillStyle = '#2B8A57'; ctx.fill();
    // Right face
    ctx.beginPath(); ctx.moveTo(0,-2); ctx.lineTo(24,-15); ctx.lineTo(24,9); ctx.lineTo(0,22); ctx.closePath();
    ctx.fillStyle = '#D93A2F'; ctx.fill();
    // Edges
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0,-28); ctx.lineTo(24,-15); ctx.lineTo(0,-2); ctx.lineTo(-24,-15); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-2); ctx.lineTo(0,22); ctx.moveTo(-24,-15); ctx.lineTo(-24,9); ctx.moveTo(24,-15); ctx.lineTo(24,9); ctx.stroke();
    ctx.restore();
  }

  function finish() {
    if (done) return;
    done = true;
    clearInterval(dotTimer);
    bar.style.width  = '100%';
    lbl.textContent  = 'Ready';
    setTimeout(() => {
      gsap.to('#preloader', {
        opacity: 0, duration: 0.65, ease: 'power2.inOut',
        onComplete: () => {
          document.getElementById('preloader').style.display = 'none';
          onDone();
        }
      });
    }, 180);
  }

  const START = Date.now(), DUR = 1800;
  const timer = setInterval(() => {
    prog = Math.min((Date.now() - START) / DUR, 1);
    bar.style.width = (prog * 100) + '%';
    drawCube(prog);
    if (prog >= 1) { clearInterval(timer); finish(); }
  }, 16);

  setTimeout(finish, 2600);
  canvas.parentElement.addEventListener('click', finish, { once: true });
  document.addEventListener('keydown', finish, { once: true });
}

/* ══════════════════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════════════════ */
function boot() {
  runPreloader(() => {
    gsap.to('#scene', { opacity: 1, duration: 0.7, ease: 'power2.out' });

    initThree();
    initInput();

    requestAnimationFrame(() => {
      updateChrome(0);

      setTimeout(() => {
        if (cubeGroup) {
          cubeGroup.position.y = getCubeTargetY(0);
          cubeGroup.scale.set(0, 0, 0);
          gsap.to(cubeGroup.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'back.out(1.4)' });
        }
        setTimeout(() => {
          showHomeOverlay(true);
          currentState = State.IDLE;
        }, 280);
      }, 100);
    });
  });
}

boot();
