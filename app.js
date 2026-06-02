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

const FACE_ACCENTS = [
  '#555555',  // 0 Home       — neutral
  '#2DBB6B',  // 1 About      — green
  '#F06B20',  // 2 Skills     — orange
  '#C49B00',  // 3 Experience — amber
  '#E8293A',  // 4 Projects   — red
  '#2979F2',  // 5 Contact    — blue
];

/* ══════════════════════════════════════════════════════════════
   FACE ROTATION MAP
   Index 0 shows the white (+y) face toward camera.
   ══════════════════════════════════════════════════════════════ */
const FACE_ROTATIONS = [
  { euler: [ Math.PI / 2, 0, 0],  label: 'Home'       }, // +y (white)  → front
  { euler: [0, 0, 0],             label: 'About'      }, // +z (green)  → front
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

// Continuous scroll-driven state
let scrollFacePos      = 0;
let scrollVelocity     = 0;
let scrollSettleTimer  = null;
let settleRevealTimer  = null;
const SCROLL_SENS      = 1 / 2500;
const SCROLL_FRICTION  = 0.85;
const SETTLE_MS        = 400;
const HOME_SCALE       = 1.9;

/* ══════════════════════════════════════════════════════════════
   THREE.JS GLOBALS
   ══════════════════════════════════════════════════════════════ */
let renderer, scene, camera;
let cubeGroup;
let mouseTarget  = { x: 0, y: 0 };
let mouseSmooth  = { x: 0, y: 0 };
let mouseClientX = 0;
let mouseClientY = 0;

let glbReady = false;
let onGlbReady = null;

/* ══════════════════════════════════════════════════════════════
   POSITION HELPERS
   ══════════════════════════════════════════════════════════════ */
function getCubeTargetX(faceIdx) {
  if (faceIdx === 0) return 0;
  return faceIdx % 2 === 1 ? -2.2 : 2.2;
}

function getCubeTargetY(faceIdx) {
  return faceIdx === 0 ? -2.4 : 0;
}

function getCubeTargetScale(faceIdx) {
  return faceIdx === 0 ? HOME_SCALE : 1;
}

function getPanelClass(faceIdx) {
  return faceIdx % 2 === 1 ? 'on-right' : 'on-left';
}

function nearAngle(from, to) {
  const d = ((to - from) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
  return from + d;
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
  loadGLB();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('mousemove', e => {
    mouseTarget.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    mouseClientX  = e.clientX;
    mouseClientY  = e.clientY;
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
   GLB LOADER
   ══════════════════════════════════════════════════════════════ */
function loadGLB() {
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  const signalReady = () => {
    glbReady = true;
    const cb = onGlbReady;
    onGlbReady = null;
    cb?.();
  };

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

    const newGroup = new THREE.Group();
    newGroup.add(model);
    newGroup.rotation.set(...FACE_ROTATIONS[0].euler);
    newGroup.position.set(0, getCubeTargetY(0), 0);
    newGroup.scale.setScalar(0);
    scene.add(newGroup);
    cubeGroup = newGroup;

    signalReady();
  }, undefined, err => {
    console.warn('GLB failed to load:', err.message);
    signalReady();
  });
}

/* ══════════════════════════════════════════════════════════════
   RENDER LOOP
   ══════════════════════════════════════════════════════════════ */
function renderLoop() {
  requestAnimationFrame(renderLoop);

  if (currentState === 'SCROLLING' && cubeGroup) {
    scrollVelocity *= SCROLL_FRICTION;
    scrollFacePos  += scrollVelocity;
    updateChrome(getNearestFace(scrollFacePos));
    const [rx, ry, rz] = getScrollRotation(scrollFacePos);
    cubeGroup.rotation.x = rx;
    cubeGroup.rotation.y = ry;
    cubeGroup.rotation.z = rz;
  }

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

  const xStart = faceIdx % 2 === 1 ? 50 : -50;
  gsap.fromTo(panel,
    { x: xStart, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
  );

  if (face) {
    const eyebrow   = face.querySelector('.panel-eyebrow');
    const title     = face.querySelector('.panel-title');
    const accentBar = face.querySelector('.panel-accent-bar');
    const remaining = Array.from(face.children).filter(c =>
      !c.classList.contains('panel-eyebrow') &&
      !c.classList.contains('panel-title')   &&
      !c.classList.contains('panel-accent-bar')
    );

    if (eyebrow) {
      gsap.fromTo(eyebrow,
        { opacity: 0, y: 7 },
        { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out', delay: 0.1 }
      );
    }
    if (title) {
      gsap.fromTo(title,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.17 }
      );
    }
    if (accentBar) {
      gsap.fromTo(accentBar,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.72, ease: 'power3.out', delay: 0.32 }
      );
    }
    if (remaining.length) {
      gsap.fromTo(remaining,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.52, stagger: 0.07, ease: 'power3.out', delay: 0.38 }
      );
    }
  }
}

function hidePanel(onComplete) {
  const panel = document.getElementById('side-panel');
  const xOut  = panel.classList.contains('on-right') ? 60 : -60;
  gsap.to(panel, {
    x: xOut, opacity: 0, duration: 0.28, ease: 'power2.in',
    onComplete: () => {
      gsap.set(panel, { x: 0 });
      document.querySelectorAll('.panel-face').forEach(f => {
        f.style.opacity       = '0';
        f.style.pointerEvents = 'none';
      });
      onComplete?.();
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   CHROME UPDATE
   ══════════════════════════════════════════════════════════════ */
function updateChrome(idx) {
  const faceText = document.getElementById('face-tag-text');
  const faceIdx  = document.getElementById('face-tag-idx');
  if (faceText) faceText.textContent = CONFIG.faces[idx];
  if (faceIdx)  faceIdx.textContent  = String(idx + 1).padStart(2, '0');

  document.querySelectorAll('.nav-label').forEach((d, i) => d.classList.toggle('active', i === idx));
  gsap.to('#page-name', { opacity: idx === 0 ? 0 : 1, duration: 0.35, ease: 'power2.out' });

  document.documentElement.style.setProperty('--accent-global', FACE_ACCENTS[idx]);
}

/* ══════════════════════════════════════════════════════════════
   CONTINUOUS SCROLL HELPERS
   ══════════════════════════════════════════════════════════════ */
function getScrollRotation(facePos) {
  const total = FACE_ROTATIONS.length;
  const norm  = ((facePos % total) + total) % total;
  const i     = Math.floor(norm);
  const frac  = norm - i;
  const from  = FACE_ROTATIONS[i].euler;
  const to    = FACE_ROTATIONS[(i + 1) % total].euler;
  return [
    from[0] + (nearAngle(from[0], to[0]) - from[0]) * frac,
    from[1] + (nearAngle(from[1], to[1]) - from[1]) * frac,
    from[2] + (nearAngle(from[2], to[2]) - from[2]) * frac,
  ];
}

function getNearestFace(facePos) {
  const total = FACE_ROTATIONS.length;
  return Math.round(((facePos % total) + total) % total) % total;
}

function beginScrolling() {
  if (isTransitioning) return;
  if (currentState === 'SCROLLING') return;
  if (currentState === 'HIDING') return;

  if (currentState === 'SETTLING') {
    gsap.killTweensOf(cubeGroup.rotation);
    gsap.killTweensOf(cubeGroup.position);
    gsap.killTweensOf(cubeGroup.scale);
    gsap.to(cubeGroup.position, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
    gsap.to(cubeGroup.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'power2.out' });
    currentState = 'SCROLLING';
    return;
  }

  if (currentState === 'REVEALING') {
    clearTimeout(settleRevealTimer);
    if (currentFaceIdx === 0) {
      hideHomeOverlay();
    } else {
      hidePanel();
    }
    gsap.to(cubeGroup.position, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
    gsap.to(cubeGroup.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' });
    scrollFacePos = currentFaceIdx;
    currentState  = 'SCROLLING';
    return;
  }

  if (currentState !== State.IDLE) return;

  currentState  = 'HIDING';
  scrollFacePos = currentFaceIdx;

  const onHideComplete = () => {
    if (currentState !== 'HIDING') return;
    gsap.killTweensOf(cubeGroup.rotation);
    gsap.to(cubeGroup.position, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
    gsap.to(cubeGroup.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' });
    currentState = 'SCROLLING';
    scheduleSettle();
  };

  if (currentFaceIdx === 0) {
    hideHomeOverlay(onHideComplete);
  } else {
    hidePanel(onHideComplete);
  }
}

function scheduleSettle() {
  clearTimeout(scrollSettleTimer);
  scrollSettleTimer = setTimeout(beginSettling, SETTLE_MS);
}

function beginSettling() {
  if (currentState !== 'SCROLLING') return;
  currentState   = 'SETTLING';
  scrollVelocity = 0;

  const nearFace    = getNearestFace(scrollFacePos);
  const target      = FACE_ROTATIONS[nearFace].euler;
  const targetX     = getCubeTargetX(nearFace);
  const targetY     = getCubeTargetY(nearFace);
  const targetScale = getCubeTargetScale(nearFace);

  gsap.to(cubeGroup.rotation, {
    x: nearAngle(cubeGroup.rotation.x, target[0]),
    y: nearAngle(cubeGroup.rotation.y, target[1]),
    z: 0,
    duration: 0.7,
    ease: 'power3.out',
  });

  gsap.to(cubeGroup.scale, {
    x: targetScale, y: targetScale, z: targetScale,
    duration: 0.7, ease: 'power3.out',
  });

  gsap.to(cubeGroup.position, {
    x: targetX,
    y: targetY,
    duration: 0.7,
    ease: 'power3.out',
    onComplete: () => {
      cubeGroup.rotation.set(...target);
      cubeGroup.position.set(targetX, targetY, 0);
      cubeGroup.scale.setScalar(targetScale);
      mouseSmooth.x = 0;
      mouseSmooth.y = 0;

      currentFaceIdx = nearFace;
      scrollFacePos  = nearFace;

      updateChrome(nearFace);
      currentState = 'REVEALING';

      if (nearFace === 0) {
        showHomeOverlay(false);
      } else {
        showPanel(nearFace);
      }

      settleRevealTimer = setTimeout(() => { currentState = State.IDLE; }, 550);
    },
  });
}

function snapToFace(targetIdx) {
  if (currentState === 'SCROLLING' || currentState === 'SETTLING' || currentState === 'REVEALING') {
    clearTimeout(scrollSettleTimer);
    clearTimeout(settleRevealTimer);
    gsap.killTweensOf(cubeGroup.rotation);
    gsap.killTweensOf(cubeGroup.position);
    scrollFacePos = targetIdx;
    currentState  = 'SCROLLING';
    beginSettling();
    return;
  }
  transitionToFace(targetIdx);
}

/* ══════════════════════════════════════════════════════════════
   STATE MACHINE — TRANSITION
   ══════════════════════════════════════════════════════════════ */
function transitionToFace(nextIdx) {
  if (isTransitioning || currentState === 'SCROLLING' || currentState === 'SETTLING' || currentState === 'REVEALING') return;
  if (nextIdx === currentFaceIdx) return;
  if (nextIdx < 0 || nextIdx >= FACE_ROTATIONS.length) return;

  isTransitioning = true;
  currentState    = State.HIDE_CONTENT;

  const blocker = document.getElementById('transition-blocker');
  if (blocker) blocker.classList.add('active');

  pulseActiveStickers(0.04);

  const onHideComplete = () => {
    currentState = State.ROTATE;

    const target      = FACE_ROTATIONS[nextIdx].euler;
    const targetX     = getCubeTargetX(nextIdx);
    const targetY     = getCubeTargetY(nextIdx);
    const targetScale = getCubeTargetScale(nextIdx);

    gsap.to(camera.position, { z: 9.0, duration: 0.25, ease: 'power2.in' });
    gsap.to(cubeGroup.position, { x: targetX, y: targetY, duration: 1.3, ease: 'power3.inOut' });
    gsap.to(cubeGroup.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 1.3, ease: 'power3.inOut' });

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
    cubeGroup.scale.setScalar(getCubeTargetScale(nextIdx));
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
  function onWheel(e) {
    const delta = e.deltaY || e.deltaX;
    if (Math.abs(delta) < 2) return;
    if (currentFaceIdx !== 0) {
      const panel = document.getElementById('side-panel');
      const rect  = panel.getBoundingClientRect();
      if (mouseClientX >= rect.left && mouseClientX <= rect.right &&
          mouseClientY >= rect.top  && mouseClientY <= rect.bottom) {
        return;
      }
    }
    beginScrolling();
    if (currentState !== 'SCROLLING' && currentState !== 'HIDING') return;
    scrollVelocity += delta * SCROLL_SENS;
    if (currentState === 'SCROLLING') scheduleSettle();
  }
  window.addEventListener('wheel', onWheel, { passive: true });
  document.getElementById('main-canvas').addEventListener('wheel', onWheel, { passive: true });

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'j') transitionToFace(currentFaceIdx + 1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'k') transitionToFace(currentFaceIdx - 1);
  });

  let touchY0 = 0;
  window.addEventListener('touchstart', e => { touchY0 = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', e => {
    const dy = touchY0 - e.touches[0].clientY;
    if (Math.abs(dy) < 3) return;
    touchY0 = e.touches[0].clientY;
    onWheel({ deltaY: dy, deltaX: 0 });
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', () => { scheduleSettle(); });

  document.querySelectorAll('.nav-label').forEach(dot => {
    dot.addEventListener('click', () => snapToFace(parseInt(dot.dataset.idx)));
  });
}

/* ═════════════════════════════════════════════════════════════
   PRELOADER
   ═════════════════════════════════════════════════════════════ */
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

  function fadeOut() {
    setTimeout(() => {
      gsap.to('#preloader', {
        opacity: 0, duration: 0.65, ease: 'power2.inOut',
        onComplete: () => {
          document.getElementById('preloader').style.display = 'none';
          onDone();
        }
      });
    }, 300);
  }

  function finish() {
    if (done) return;
    done = true;
    clearInterval(dotTimer);
    bar.style.width = '100%';
    lbl.textContent = 'Ready';
    if (glbReady) {
      fadeOut();
    } else {
      onGlbReady = fadeOut;
    }
  }

  const START = Date.now(), DUR = 2200;
  const timer = setInterval(() => {
    prog = Math.min((Date.now() - START) / DUR, 1);
    bar.style.width = (prog * 100) + '%';
    drawCube(prog);
    if (prog >= 1) { clearInterval(timer); finish(); }
  }, 16);

  // Safety: if GLB never loads, unblock after 12s
  setTimeout(() => {
    if (!glbReady) {
      glbReady = true;
      const cb = onGlbReady;
      onGlbReady = null;
      cb?.();
    }
    finish();
  }, 12000);

  canvas.parentElement.addEventListener('click', finish, { once: true });
  document.addEventListener('keydown', finish, { once: true });
}

/* ══════════════════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════════════════ */
function boot() {
  // Start loading Three.js + GLB immediately, in parallel with the preloader
  initThree();

  runPreloader(() => {
    gsap.to('#scene', { opacity: 1, duration: 0.7, ease: 'power2.out' });

    initInput();
    updateChrome(0);

    if (cubeGroup) {
      cubeGroup.position.y = getCubeTargetY(0);
      cubeGroup.scale.set(0, 0, 0);
      gsap.to(cubeGroup.scale, { x: HOME_SCALE, y: HOME_SCALE, z: HOME_SCALE, duration: 1.1, ease: 'back.out(1.4)' });
    }
    setTimeout(() => {
      showHomeOverlay(true);
      currentState = State.IDLE;
    }, 280);
  });
}

boot();
