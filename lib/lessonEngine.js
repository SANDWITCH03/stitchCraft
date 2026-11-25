// The 3D lesson player. Builds a three.js scene (cutting mat, two fabric
// pieces, pins, chalk line and a sewing machine) and animates a seam being
// sewn. The scene state is a pure function of time t, so scrubbing works.
//
// Later, the real AI will output a lesson plan (pieces, steps, seam
// allowances) and this engine will render it the same way.
import * as THREE from 'three';
import { PROJECTS } from './projects';
import { DUR, START, TOTAL, fmt, stepAt, seamAllowance } from './lesson';

const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;

const SEAMZ = -0.85;
const XS = Array.from({ length: 30 }, (_, i) => -1.45 + i * 0.1);
const PINX = [-1.0, -0.35, 0.3, 0.95];

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function fabricTex(kind, color, back) {
  const t = canvasTex(256, 256, (g, w, h) => {
    if (kind === 'gingham') {
      g.fillStyle = '#f7f1ea'; g.fillRect(0, 0, w, h);
      g.fillStyle = color; g.globalAlpha = 0.5;
      for (let x = 0; x < w; x += 64) { g.fillRect(x, 0, 32, h); g.fillRect(0, x, w, 32); }
      g.globalAlpha = 1;
    } else {
      g.fillStyle = color; g.fillRect(0, 0, w, h);
      if (kind === 'denim') {
        g.strokeStyle = 'rgba(255,255,255,.13)'; g.lineWidth = 2;
        for (let i = -h; i < w; i += 6) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); }
      } else {
        for (let i = 0; i < w; i += 4) {
          g.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.06})`; g.fillRect(i, 0, 1, h);
          g.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.05})`; g.fillRect(0, i, w, 1);
        }
      }
    }
    if (back) { g.fillStyle = 'rgba(255,255,255,.42)'; g.fillRect(0, 0, w, h); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(kind === 'gingham' ? 3 : 4, kind === 'gingham' ? 2 : 3);
  return t;
}

function matTex() {
  return canvasTex(1152, 896, (g, w, h) => {
    g.fillStyle = '#6e1c28'; g.fillRect(0, 0, w, h);
    for (let x = 0; x <= w; x += 32) {
      const major = x % 160 === 0;
      g.strokeStyle = major ? 'rgba(240,200,110,.55)' : 'rgba(235,245,230,.16)'; g.lineWidth = major ? 2.5 : 1;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke();
    }
    for (let y = 0; y <= h; y += 32) {
      const major = y % 160 === 0;
      g.strokeStyle = major ? 'rgba(240,200,110,.55)' : 'rgba(235,245,230,.16)'; g.lineWidth = major ? 2.5 : 1;
      g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    }
    g.fillStyle = 'rgba(240,210,130,.8)'; g.font = '600 18px monospace';
    for (let x = 160, n = 1; x < w; x += 160, n++) g.fillText(String(n * 5), x + 5, 22);
    g.strokeStyle = 'rgba(240,200,110,.4)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.6, h - w * 0.6); g.stroke();
  });
}

/**
 * @param {object} o
 * @param {HTMLElement} o.stage      wrapper that sets the canvas size
 * @param {HTMLCanvasElement} o.canvas
 * @param {HTMLElement} o.label      floating 3D label
 * @param {HTMLInputElement} o.scrub range input
 * @param {HTMLElement} o.timeEl     "0:00 / 0:25"
 * @param {() => 'cm'|'in'} o.getUnits
 * @param {(i:number)=>void} o.onStep      called when the step changes
 * @param {(v:boolean)=>void} o.onPlaying  called when play state changes
 * @param {(v:string)=>void} o.onView      called when dragging switches to free camera
 * @param {boolean} o.reduceMotion
 */
export function createLessonEngine(o) {
  const { stage, canvas, label, scrub, timeEl, getUnits, onStep, onPlaying, onView, reduceMotion } = o;

  let renderer = null;
  let ok = true;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
  } catch (e) {
    ok = false;
  }

  let scene, camera, A, B, machine, needleGrp, matsA, matsB, threadMat;
  const pins = [], stitches = [], chalk = [];
  const disposables = [];
  let project = 'tote';

  function buildScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#3a1219');
    scene.fog = new THREE.Fog('#3a1219', 11, 20);
    camera = new THREE.PerspectiveCamera(40, 16 / 10, 0.1, 60);
    // three.js uses physically based light units, so intensities are scaled by PI.
    scene.add(new THREE.HemisphereLight('#fbf1ef', '#2a1014', 0.75 * Math.PI));
    const sun = new THREE.DirectionalLight('#fff6e6', 0.85 * Math.PI);
    sun.position.set(3, 7, 4); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
    sun.shadow.bias = -0.0008;
    scene.add(sun);

    const mat = new THREE.Mesh(new THREE.PlaneGeometry(10, 7.8), new THREE.MeshStandardMaterial({ map: matTex(), roughness: 0.95 }));
    mat.rotation.x = -Math.PI / 2; mat.receiveShadow = true; scene.add(mat);

    const geo = new THREE.PlaneGeometry(3, 2, 40, 28);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, 0.006 * Math.sin(x * 3.1) * Math.cos(z * 2.3));
    }
    geo.computeVertexNormals();
    function piece() {
      const g = new THREE.Group();
      const f = new THREE.MeshStandardMaterial({ roughness: 0.92, side: THREE.FrontSide });
      const b = new THREE.MeshStandardMaterial({ roughness: 0.97, side: THREE.BackSide });
      const m1 = new THREE.Mesh(geo, f), m2 = new THREE.Mesh(geo, b);
      [m1, m2].forEach((m) => { m.castShadow = true; m.receiveShadow = true; g.add(m); });
      return { g, f, b };
    }
    const pa = piece(), pb = piece();
    A = pa.g; B = pb.g; matsA = pa; matsB = pb; scene.add(A, B);

    threadMat = new THREE.MeshStandardMaterial({ color: '#1e3a5f', roughness: 0.6 });
    const sg = new THREE.BoxGeometry(0.065, 0.014, 0.018);
    XS.forEach((x) => { const s = new THREE.Mesh(sg, threadMat); s.position.set(x + 0.05, 0.05, SEAMZ); scene.add(s); stitches.push(s); });
    const cm = new THREE.MeshBasicMaterial({ color: '#eef3ea', transparent: true, opacity: 0.85 });
    const cg = new THREE.BoxGeometry(0.05, 0.004, 0.012);
    XS.forEach((x) => { const s = new THREE.Mesh(cg, cm); s.position.set(x + 0.05, 0.046, SEAMZ); scene.add(s); chalk.push(s); });

    const pinCols = ['#d4475c', '#e9b872', '#4f8fd8', '#e8e8e8'];
    PINX.forEach((x, i) => {
      const g = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.5, 8), new THREE.MeshStandardMaterial({ color: '#c9d1cd', metalness: 0.8, roughness: 0.3 }));
      shaft.rotation.x = Math.PI / 2; g.add(shaft);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshStandardMaterial({ color: pinCols[i], roughness: 0.35 }));
      head.position.z = 0.25; g.add(head);
      g.traverse((obj) => { obj.castShadow = true; });
      g.position.set(x, 0.07, SEAMZ + 0.03); scene.add(g); pins.push(g);
    });

    machine = new THREE.Group();
    const white = new THREE.MeshStandardMaterial({ color: '#e8ece6', roughness: 0.5 });
    const metal = new THREE.MeshStandardMaterial({ color: '#a7b0ad', metalness: 0.75, roughness: 0.3 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.62), white); head.position.y = 1.35; machine.add(head);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 1.6), white); arm.position.set(0, 1.5, -1.05); machine.add(arm);
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.82, 20), new THREE.MeshStandardMaterial({ color: '#e9b872', roughness: 0.4 }));
    dial.rotation.z = Math.PI / 2; dial.position.set(0, 1.42, 0.12); machine.add(dial);
    needleGrp = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.75, 12), metal); bar.position.y = 0.75; needleGrp.add(bar);
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.004, 0.34, 8), metal); needle.position.y = 0.23; needleGrp.add(needle);
    machine.add(needleGrp);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.34), metal); foot.position.y = 0.075; machine.add(foot);
    const footBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.95, 8), metal); footBar.position.set(-0.07, 0.58, 0); machine.add(footBar);
    machine.traverse((obj) => { if (obj.isMesh) obj.castShadow = true; });
    machine.position.z = SEAMZ; scene.add(machine);
    applyProject();
  }

  function applyProject() {
    if (!ok) return;
    const p = PROJECTS[project];
    [matsA, matsB].forEach((m) => {
      if (m.f.map) m.f.map.dispose();
      if (m.b.map) m.b.map.dispose();
      m.f.map = fabricTex(p.fabric, p.color, false);
      m.b.map = fabricTex(p.fabric, p.color, true);
      m.f.needsUpdate = m.b.needsUpdate = true;
    });
    threadMat.color.set(p.thread);
  }

  // ---- scene state at time t ----
  const qz = new THREE.Quaternion(), qx = new THREE.Quaternion(), vtmp = new THREE.Vector3();
  const AXIS_Z = new THREE.Vector3(0, 0, 1), AXIS_X = new THREE.Vector3(1, 0, 0);
  let needleX = -2.6, stepIdx = 0;
  const phase = (t, i) => clamp((t - START[i]) / DUR[i], 0, 1);

  function apply(t) {
    stepIdx = stepAt(t);
    A.position.set(0, 0.012, 0);
    // step 1: flip B onto A
    const p1 = clamp((phase(t, 0) - 0.15) / 0.85, 0, 1), e1 = ease(p1);
    const bx = lerp(3.5, 0, e1), by = 0.014 + Math.sin(Math.PI * e1) * 1.1 + 0.022 * e1;
    qz.setFromAxisAngle(AXIS_Z, Math.PI * e1);
    // step 5: open along the seam
    const a = Math.PI * ease(clamp((phase(t, 4) - 0.05) / 0.6, 0, 1));
    qx.setFromAxisAngle(AXIS_X, -a);
    vtmp.set(0, 0, -SEAMZ).applyQuaternion(qx);
    if (a > 0) B.position.set(0, 0.036 + vtmp.y + 0.015 * Math.sin(a), SEAMZ + vtmp.z);
    else B.position.set(bx, by, 0);
    B.quaternion.copy(qx).multiply(qz);

    // machine path and sewn extent
    let mx = -2.6, lift = 1.2, sewing = false, sewn = -9;
    const u3 = phase(t, 2), u4 = phase(t, 3);
    if (t >= START[2] && t < START[4]) {
      if (t < START[3]) {
        if (u3 < 0.25) { mx = lerp(-2.6, -1.45, ease(u3 / 0.25)); lift = lerp(1.2, 0, ease(u3 / 0.25)); }
        else if (u3 < 0.5) { mx = lerp(-1.45, -1.15, (u3 - 0.25) / 0.25); lift = 0; sewing = true; }
        else if (u3 < 0.72) { mx = lerp(-1.15, -1.42, (u3 - 0.5) / 0.22); lift = 0; sewing = true; }
        else { mx = lerp(-1.42, -1.15, (u3 - 0.72) / 0.28); lift = 0; sewing = true; }
        sewn = u3 < 0.25 ? -9 : (u3 < 0.5 ? mx : -1.15);
      } else if (u4 < 0.8) { mx = lerp(-1.15, 1.45, u4 / 0.8); sewn = mx; sewing = true; lift = 0; }
      else if (u4 < 0.93) {
        const v = (u4 - 0.8) / 0.13;
        mx = v < 0.5 ? lerp(1.45, 1.2, v * 2) : lerp(1.2, 1.45, (v - 0.5) * 2);
        sewn = 1.45; sewing = true; lift = 0;
      } else {
        const v = (u4 - 0.93) / 0.07;
        mx = lerp(1.45, 2.8, ease(v)); lift = lerp(0, 1.2, ease(v)); sewn = 1.45;
      }
    } else if (t >= START[4]) { sewn = 1.45; mx = 2.8; lift = 1.2; }
    machine.visible = t >= START[2] - 0.2 && t < START[4] + 0.4;
    machine.position.set(mx, lift, SEAMZ);
    needleGrp.position.y = sewing ? 0.06 * (Math.sin(t * 44) + 1) / 2 - 0.02 : 0.08;
    needleX = mx;
    stitches.forEach((s, i) => { s.visible = XS[i] + 0.08 <= sewn + 0.001; });
    const chalkOn = t >= START[1] - 0.3 && t < START[4];
    chalk.forEach((c, i) => { c.visible = chalkOn && XS[i] + 0.05 > sewn; });

    // pins drop in, then lift out as the needle reaches them
    const u2 = phase(t, 1);
    pins.forEach((p, i) => {
      const appear = clamp((u2 - i * 0.2) / 0.25, 0, 1);
      let y = lerp(0.7, 0.07, ease(appear)), s = appear > 0 ? 1 : 0;
      if (t >= START[3]) {
        const r = clamp((needleX - (PINX[i] - 0.35)) / 0.2, 0, 1);
        if (t >= START[4]) s = 0; else { y += r * 0.6; s = 1 - r; }
      }
      p.visible = s > 0.02; p.position.y = y; p.scale.setScalar(Math.max(s, 0.001));
    });
  }

  // ---- camera ----
  const cam = { th: 0.25, ph: 0.95, r: 7.6, tx: 1.2, ty: 0, tz: 0 };
  let view = 'auto', dragging = false;
  function desired() {
    if (view === 'top') return { th: 0, ph: 0.08, r: 7.4, tx: 0.4, ty: 0, tz: -0.5 };
    if (view === 'side') return { th: 1.25, ph: 1.2, r: 6, tx: 0, ty: 0.1, tz: -0.6 };
    if (view === 'close') return { th: 0.55, ph: 0.92, r: 2.8, tx: clamp(needleX, -1.5, 1.5), ty: 0.1, tz: SEAMZ };
    return [
      { th: 0.2, ph: 0.92, r: 7.6, tx: 1.3, ty: 0, tz: -0.2 },
      { th: -0.15, ph: 0.72, r: 5.4, tx: 0, ty: 0, tz: -0.55 },
      { th: 0.6, ph: 0.95, r: 3.1, tx: -1.2, ty: 0.12, tz: SEAMZ },
      { th: 0.5, ph: 0.95, r: 3.7, tx: clamp(needleX, -1.2, 1.4), ty: 0.12, tz: SEAMZ },
      { th: -0.25, ph: 0.68, r: 6.6, tx: 0, ty: 0, tz: -1.1 },
    ][stepIdx];
  }
  function updateCam(dt, snap) {
    if (view !== 'free') {
      const d = desired(), k = snap ? 1 : 1 - Math.exp(-dt * 2.6);
      for (const key in d) cam[key] += (d[key] - cam[key]) * k;
    }
    const s = Math.sin(cam.ph);
    camera.position.set(cam.tx + cam.r * s * Math.sin(cam.th), cam.ty + cam.r * Math.cos(cam.ph), cam.tz + cam.r * s * Math.cos(cam.th));
    camera.lookAt(cam.tx, cam.ty, cam.tz);
  }

  let px = 0, py = 0;
  const onDown = (e) => {
    dragging = true; px = e.clientX; py = e.clientY;
    if (view !== 'free') { view = 'free'; onView && onView('free'); }
    canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!dragging) return;
    cam.th -= (e.clientX - px) * 0.008;
    cam.ph = clamp(cam.ph - (e.clientY - py) * 0.006, 0.08, 1.45);
    px = e.clientX; py = e.clientY;
  };
  const onUp = () => { dragging = false; };

  // ---- floating label ----
  const projV = new THREE.Vector3();
  function updateLabel(t) {
    const SA = seamAllowance(getUnits());
    let txt, p;
    if (stepIdx === 0) { txt = phase(t, 0) < 0.55 ? 'Right side up' : 'Right sides together'; p = [B.position.x, B.position.y + 0.05, 0.2]; }
    else if (stepIdx === 1) { txt = 'Chalk line · ' + SA + ' in'; p = [1.5, 0.05, SEAMZ]; }
    else if (stepIdx < 4) { txt = SA + ' seam allowance'; p = [-1.5, 0.05, -0.93]; }
    else { txt = phase(t, 4) > 0.6 ? 'Seam pressed open' : 'Opening the seam'; p = [0, 0.06, SEAMZ]; }
    projV.set(p[0], p[1], p[2]).project(camera);
    const w = stage.clientWidth, h = stage.clientHeight;
    const x = (projV.x + 1) / 2 * w, y = (1 - projV.y) / 2 * h;
    if (label.textContent !== txt) label.textContent = txt;
    label.style.left = clamp(x, 70, w - 70) + 'px';
    label.style.top = clamp(y, 40, h - 90) + 'px';
    label.style.opacity = projV.z < 1 ? 1 : 0;
  }

  // ---- playback ----
  let t = reduceMotion ? 17 : 0, playing = !reduceMotion, speed = 1, generating = false, hold = 0, lastStep = -1, raf = 0;
  let last = performance.now();

  function setPlaying(v) { playing = v; onPlaying && onPlaying(v); }

  function resize() {
    if (!ok) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function updateUI() {
    const tt = Math.min(t, TOTAL);
    scrub.value = String(Math.round(tt / TOTAL * 1000));
    timeEl.textContent = fmt(tt) + ' / ' + fmt(TOTAL);
    if (stepIdx !== lastStep) { lastStep = stepIdx; onStep && onStep(stepIdx); }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (playing && !generating && !document.hidden) {
      if (t < TOTAL) t = Math.min(TOTAL, t + dt * speed);
      else { hold += dt; if (hold > 2) { hold = 0; t = 0; } }
    }
    const tt = Math.min(t, TOTAL);
    if (ok) { apply(tt); updateCam(dt); renderer.render(scene, camera); updateLabel(tt); }
    else stepIdx = stepAt(tt);
    updateUI();
    raf = requestAnimationFrame(frame);
  }

  let ro = null;
  if (ok) {
    buildScene();
    ro = new ResizeObserver(resize); ro.observe(stage); resize();
    apply(t); updateCam(0, true);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
  }
  onPlaying && onPlaying(playing);
  raf = requestAnimationFrame(frame);

  return {
    webgl: ok,
    togglePlay() { if (t >= TOTAL) t = 0; setPlaying(!playing); },
    setPlaying,
    setSpeed(v) { speed = v; },
    setView(v) { view = v; },
    seekFraction(f) { t = f * TOTAL; },
    seekStep(i) { t = START[i] + 0.01; if (view === 'free') { view = 'auto'; onView && onView('auto'); } },
    setGenerating(v) { generating = v; },
    refreshCaption() { lastStep = -1; },
    loadProject(key) {
      project = key; applyProject();
      t = 0; lastStep = -1; view = 'auto'; onView && onView('auto');
      setPlaying(true);
    },
    destroy() {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      if (scene) {
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            const ms = Array.isArray(obj.material) ? obj.material : [obj.material];
            ms.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
          }
        });
      }
      if (renderer) renderer.dispose();
      disposables.length = 0;
    },
  };
}
