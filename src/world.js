import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export function createWorld(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: window.innerWidth > 760,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    console.warn('WebGL unavailable; the CSS fallback remains visible.', error);
    document.documentElement.classList.add('no-webgl');
    return { setStage() {}, setScrollProgress() {}, destroy() {} };
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.2 : 1.55));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.15, 10.5);

  scene.add(new THREE.HemisphereLight(0xd9edff, 0x111827, 1.15));
  const key = new THREE.DirectionalLight(0xb6e9ff, 3.2);
  key.position.set(4, 6, 8);
  scene.add(key);
  const edgeLight = new THREE.DirectionalLight(0x9d91ff, 1.6);
  edgeLight.position.set(-5, -2, 3);
  scene.add(edgeLight);

  const rig = new THREE.Group();
  rig.position.set(1.55, 0.05, 0);
  rig.rotation.set(-0.06, -0.38, 0.02);
  scene.add(rig);

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x101827,
    metalness: 0.58,
    roughness: 0.56,
  });
  const moduleMaterial = new THREE.MeshStandardMaterial({
    color: 0x172238,
    metalness: 0.48,
    roughness: 0.5,
  });
  const activeMaterial = new THREE.MeshStandardMaterial({
    color: 0x5bd5ef,
    emissive: 0x183b4a,
    emissiveIntensity: 0.55,
    metalness: 0.35,
    roughness: 0.38,
  });

  const base = new THREE.Mesh(new RoundedBoxGeometry(4.9, 4.15, 0.28, 4, 0.12), baseMaterial);
  base.position.z = -0.72;
  rig.add(base);

  const shelfGeometry = new RoundedBoxGeometry(4.35, 0.12, 0.5, 3, 0.05);
  [1.05, 0.05, -0.95].forEach((y, index) => {
    const shelf = new THREE.Mesh(shelfGeometry, moduleMaterial);
    shelf.position.set(0, y, -0.48);
    shelf.rotation.x = index === 1 ? 0.015 : 0;
    rig.add(shelf);
  });

  const sideRailGeometry = new RoundedBoxGeometry(0.12, 3.55, 0.48, 3, 0.04);
  [-2.05, 2.05].forEach((x) => {
    const rail = new THREE.Mesh(sideRailGeometry, baseMaterial);
    rail.position.set(x, 0.05, -0.46);
    rig.add(rail);
  });

  const moduleGeometry = new RoundedBoxGeometry(0.72, 0.68, 0.42, 3, 0.09);
  const slots = [
    [-1.62, 1.05], [-0.82, 1.05], [0.02, 1.05], [0.86, 1.05], [1.58, 1.05],
    [-1.62, 0.05], [-0.82, 0.05], [0.02, 0.05], [0.86, 0.05], [1.58, 0.05],
    [-1.62, -0.95], [-0.82, -0.95], [0.02, -0.95], [0.86, -0.95], [1.58, -0.95],
  ];
  const modules = new THREE.InstancedMesh(moduleGeometry, moduleMaterial, slots.length);
  const matrix = new THREE.Matrix4();
  slots.forEach(([x, y], index) => {
    matrix.makeTranslation(x, y, 0.05 + (index % 3) * 0.025);
    modules.setMatrixAt(index, matrix);
  });
  modules.instanceMatrix.needsUpdate = true;
  rig.add(modules);

  const statusGeometry = new RoundedBoxGeometry(0.48, 0.055, 0.025, 2, 0.018);
  const statusMeshes = [];
  [[-0.82, 1.05], [0.86, 0.05], [-1.62, -0.95], [1.58, 1.05], [0.02, -0.95]].forEach(([x, y], index) => {
    const status = new THREE.Mesh(statusGeometry, activeMaterial);
    status.position.set(x, y - 0.19, 0.29);
    status.rotation.z = index % 2 ? -0.01 : 0.01;
    statusMeshes.push(status);
    rig.add(status);
  });

  const seamMaterial = new THREE.LineBasicMaterial({
    color: 0x73dff4,
    transparent: true,
    opacity: 0.16,
  });
  const seamGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-2.35, 1.62, 0.2),
    new THREE.Vector3(2.35, 1.62, 0.2),
  ]);
  [-1.55, 1.55].forEach((y) => {
    const seam = new THREE.Line(seamGeometry.clone(), seamMaterial);
    seam.position.y = y - 0.03;
    rig.add(seam);
  });

  const dustCount = window.innerWidth < 700 ? 110 : 260;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 10;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({ color: 0x91b8d2, size: 0.012, transparent: true, opacity: 0.4 }),
  );
  scene.add(dust);

  const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 };
  const stageColors = [0x5bd5ef, 0x9b8cff, 0x7bd8c4, 0xf1aa78];
  const targetColor = new THREE.Color(stageColors[0]);
  const state = { stageProgress: 0, targetX: 1.55, targetY: 0.05, targetScale: 1 };
  let visible = true;
  let destroyed = false;

  function setStage(index) {
    const stage = Math.max(0, Math.min(3, Number(index) || 0));
    targetColor.setHex(stageColors[stage]);
    state.targetX = [1.55, 1.75, -1.15, 0.8][stage];
    state.targetY = [0.05, 0.28, -0.12, 0.18][stage];
    state.targetScale = [1, 1.06, 0.92, 1.02][stage];
  }

  function setScrollProgress(progress) {
    state.stageProgress = Math.max(0, Math.min(1, Number(progress) || 0));
  }

  function onPointer(event) {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.2 : 1.55));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    rig.position.x = window.innerWidth < 700 ? 0.15 : 1.55;
    rig.scale.setScalar(window.innerWidth < 700 ? 0.72 : 1);
  }

  const onVisibility = () => { visible = !document.hidden; };
  const canvasObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting !== false && !document.hidden; }, { rootMargin: '120px' })
    : null;
  canvasObserver?.observe(canvas);

  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    document.documentElement.classList.add('no-webgl');
  });

  const timer = new THREE.Timer();
  renderer.setAnimationLoop(() => {
    if (destroyed || !visible) return;
    timer.update();
    const delta = Math.min(timer.getDelta(), 0.04);

    if (!reducedMotion) {
      pointer.currentX += (pointer.x - pointer.currentX) * 0.025;
      pointer.currentY += (pointer.y - pointer.currentY) * 0.025;
      rig.rotation.y += ((-0.38 + pointer.currentX * 0.045 + state.stageProgress * 0.04) - rig.rotation.y) * 0.018;
      rig.rotation.x += ((-0.06 + pointer.currentY * 0.035) - rig.rotation.x) * 0.018;
      rig.position.x += (state.targetX + pointer.currentX * 0.025 - rig.position.x) * 0.018;
      rig.position.y += (state.targetY - rig.position.y) * 0.018;
      rig.scale.lerp(new THREE.Vector3(state.targetScale, state.targetScale, state.targetScale), 0.018);
      statusMeshes.forEach((status, index) => {
        status.position.y += Math.sin(timer.getElapsed() * 0.65 + index * 1.4) * delta * 0.012;
      });
      dust.rotation.y += delta * 0.006;
    }

    activeMaterial.color.lerp(targetColor, 0.018);
    activeMaterial.emissive.lerp(targetColor.clone().multiplyScalar(0.3), 0.018);
    renderer.render(scene, camera);
  });

  onResize();

  return {
    setStage,
    setScrollProgress,
    destroy() {
      destroyed = true;
      renderer.setAnimationLoop(null);
      canvasObserver?.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (object.material) {
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
    },
  };
}
