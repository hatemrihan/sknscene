/* eslint-disable @typescript-eslint/no-explicit-any, no-unused-expressions */
'use client';

import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import React, { useEffect, useRef } from 'react';
import {
  ACESFilmicToneMapping, AmbientLight, Clock, Color, InstancedMesh,
  MathUtils, MeshPhysicalMaterial, Object3D, PerspectiveCamera, Plane,
  PMREMGenerator, PointLight, Raycaster, Scene, ShaderChunk, SphereGeometry,
  SRGBColorSpace, Vector2, Vector3, WebGLRenderer, WebGLRendererParameters
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

gsap.registerPlugin(Observer);

interface XConfig { canvas?: HTMLCanvasElement; id?: string; rendererOptions?: Partial<WebGLRendererParameters>; size?: 'parent' | { width: number; height: number }; }
interface SizeData { width: number; height: number; wWidth: number; wHeight: number; ratio: number; pixelRatio: number; }

class X {
  #config: XConfig; #postprocessing: any; #resizeObserver?: ResizeObserver; #intersectionObserver?: IntersectionObserver;
  #resizeTimer?: number; #animationFrameId: number = 0; #clock: Clock = new Clock();
  #animationState = { elapsed: 0, delta: 0 }; #isAnimating: boolean = false; #isVisible: boolean = false;
  canvas!: HTMLCanvasElement; camera!: PerspectiveCamera; cameraMinAspect?: number; cameraMaxAspect?: number;
  cameraFov!: number; maxPixelRatio?: number; minPixelRatio?: number; scene!: Scene; renderer!: WebGLRenderer;
  size: SizeData = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  render: () => void = this.#render.bind(this);
  onBeforeRender: (state: { elapsed: number; delta: number }) => void = () => {};
  onAfterRender: (state: { elapsed: number; delta: number }) => void = () => {};
  onAfterResize: (size: SizeData) => void = () => {};
  isDisposed: boolean = false;

  constructor(config: XConfig) {
    this.#config = { ...config }; this.#initCamera(); this.#initScene(); this.#initRenderer(); this.resize(); this.#initObservers();
  }
  #initCamera() { this.camera = new PerspectiveCamera(); this.cameraFov = this.camera.fov; }
  #initScene() { this.scene = new Scene(); }
  #initRenderer() {
    if (this.#config.canvas) { this.canvas = this.#config.canvas; }
    else if (this.#config.id) { const e = document.getElementById(this.#config.id); if (e instanceof HTMLCanvasElement) this.canvas = e; }
    this.canvas!.style.display = 'block';
    this.renderer = new WebGLRenderer({ canvas: this.canvas, powerPreference: 'high-performance', ...(this.#config.rendererOptions ?? {}) });
    this.renderer.outputColorSpace = SRGBColorSpace;
  }
  #initObservers() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener('resize', this.#onResize.bind(this));
      if (this.#config.size === 'parent' && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this)); this.#resizeObserver.observe(this.canvas.parentNode as Element);
      }
    }
    this.#intersectionObserver = new IntersectionObserver(this.#onIntersection.bind(this), { root: null, rootMargin: '0px', threshold: 0 });
    this.#intersectionObserver.observe(this.canvas);
    document.addEventListener('visibilitychange', this.#onVisibilityChange.bind(this));
  }
  #onResize() { if (this.#resizeTimer) clearTimeout(this.#resizeTimer); this.#resizeTimer = window.setTimeout(this.resize.bind(this), 100); }
  resize() {
    let w: number, h: number;
    if (this.#config.size instanceof Object) { w = this.#config.size.width; h = this.#config.size.height; }
    else if (this.#config.size === 'parent' && this.canvas.parentNode) { w = (this.canvas.parentNode as HTMLElement).offsetWidth; h = (this.canvas.parentNode as HTMLElement).offsetHeight; }
    else { w = window.innerWidth; h = window.innerHeight; }
    this.size.width = w; this.size.height = h; this.size.ratio = w / h;
    this.#updateCamera(); this.#updateRenderer(); this.onAfterResize(this.size);
  }
  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) this.#adjustFov(this.cameraMinAspect);
      else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) this.#adjustFov(this.cameraMaxAspect);
      else this.camera.fov = this.cameraFov;
    }
    this.camera.updateProjectionMatrix(); this.updateWorldSize();
  }
  #adjustFov(aspect: number) { const t = Math.tan(MathUtils.degToRad(this.cameraFov / 2)); this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(t / (this.camera.aspect / aspect))); }
  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) { const f = (this.camera.fov * Math.PI) / 180; this.size.wHeight = 2 * Math.tan(f / 2) * this.camera.position.length(); this.size.wWidth = this.size.wHeight * this.camera.aspect; }
  }
  #updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height); this.#postprocessing?.setSize(this.size.width, this.size.height);
    let pr = window.devicePixelRatio;
    if (this.maxPixelRatio && pr > this.maxPixelRatio) pr = this.maxPixelRatio;
    else if (this.minPixelRatio && pr < this.minPixelRatio) pr = this.minPixelRatio;
    this.renderer.setPixelRatio(pr); this.size.pixelRatio = pr;
  }
  get postprocessing() { return this.#postprocessing; }
  set postprocessing(v: any) { this.#postprocessing = v; this.render = v.render.bind(v); }
  #onIntersection(entries: IntersectionObserverEntry[]) { this.#isAnimating = entries[0].isIntersecting; this.#isAnimating ? this.#startAnimation() : this.#stopAnimation(); }
  #onVisibilityChange() { if (this.#isAnimating) { document.hidden ? this.#stopAnimation() : this.#startAnimation(); } }
  #startAnimation() {
    if (this.#isVisible) return;
    const animate = () => { this.#animationFrameId = requestAnimationFrame(animate); this.#animationState.delta = this.#clock.getDelta(); this.#animationState.elapsed += this.#animationState.delta; this.onBeforeRender(this.#animationState); this.render(); this.onAfterRender(this.#animationState); };
    this.#isVisible = true; this.#clock.start(); animate();
  }
  #stopAnimation() { if (this.#isVisible) { cancelAnimationFrame(this.#animationFrameId); this.#isVisible = false; this.#clock.stop(); } }
  #render() { this.renderer.render(this.scene, this.camera); }
  clear() { this.scene.traverse(o => { if ((o as any).isMesh) { const m = (o as any).material; if (m && typeof m === 'object') { Object.keys(m).forEach(k => { if (m[k]?.dispose) m[k].dispose(); }); m.dispose(); (o as any).geometry.dispose(); } } }); this.scene.clear(); }
  dispose() { this.#onResizeCleanup(); this.#stopAnimation(); this.clear(); this.#postprocessing?.dispose(); this.renderer.dispose(); this.renderer.forceContextLoss(); this.isDisposed = true; }
  #onResizeCleanup() { window.removeEventListener('resize', this.#onResize.bind(this)); this.#resizeObserver?.disconnect(); this.#intersectionObserver?.disconnect(); document.removeEventListener('visibilitychange', this.#onVisibilityChange.bind(this)); }
}

interface WConfig { count: number; maxX: number; maxY: number; maxZ: number; maxSize: number; minSize: number; size0: number; gravity: number; friction: number; wallBounce: number; maxVelocity: number; controlSphere0?: boolean; followCursor?: boolean; }

class W {
  config: WConfig; positionData: Float32Array; velocityData: Float32Array; sizeData: Float32Array; center: Vector3 = new Vector3();
  constructor(config: WConfig) {
    this.config = config; this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0); this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new Vector3(); this.#initializePositions(); this.setSizes();
  }
  #initializePositions() {
    const { config, positionData } = this; this.center.toArray(positionData, 0);
    for (let i = 1; i < config.count; i++) { const idx = 3 * i; positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX); positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY); positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ); }
  }
  setSizes() { const { config, sizeData } = this; sizeData[0] = config.size0; for (let i = 1; i < config.count; i++) sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize); }
  update(deltaInfo: { delta: number }) {
    const { config, center, positionData, sizeData, velocityData } = this;
    let startIdx = 0;
    if (config.controlSphere0) { startIdx = 1; new Vector3().fromArray(positionData, 0).lerp(center, 0.1).toArray(positionData, 0); new Vector3(0, 0, 0).toArray(velocityData, 0); }
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx; const vel = new Vector3().fromArray(velocityData, base);
      vel.y -= deltaInfo.delta * config.gravity * sizeData[idx]; vel.multiplyScalar(config.friction); vel.clampLength(0, config.maxVelocity);
      new Vector3().fromArray(positionData, base).add(vel).toArray(positionData, base); vel.toArray(velocityData, base);
    }
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx; const pos = new Vector3().fromArray(positionData, base); const vel = new Vector3().fromArray(velocityData, base); const radius = sizeData[idx];
      for (let jdx = idx + 1; jdx < config.count; jdx++) {
        const ob = 3 * jdx; const op = new Vector3().fromArray(positionData, ob); const ov = new Vector3().fromArray(velocityData, ob);
        const diff = new Vector3().copy(op).sub(pos); const dist = diff.length(); const sr = radius + sizeData[jdx];
        if (dist < sr) { const o = sr - dist; const c = diff.normalize().multiplyScalar(0.5 * o); pos.sub(c); vel.sub(c.clone().multiplyScalar(Math.max(vel.length(), 1))); pos.toArray(positionData, base); vel.toArray(velocityData, base); op.add(c); ov.add(c.clone().multiplyScalar(Math.max(ov.length(), 1))); op.toArray(positionData, ob); ov.toArray(velocityData, ob); }
      }
      if (config.controlSphere0) { const d2 = new Vector3().copy(new Vector3().fromArray(positionData, 0)).sub(pos); const d = d2.length(); const sr0 = radius + sizeData[0]; if (d < sr0) { const c = d2.normalize().multiplyScalar(sr0 - d); pos.sub(c); vel.sub(c.clone().multiplyScalar(Math.max(vel.length(), 2))); } }
      if (Math.abs(pos.x) + radius > config.maxX) { pos.x = Math.sign(pos.x) * (config.maxX - radius); vel.x = -vel.x * config.wallBounce; }
      if (config.gravity === 0) { if (Math.abs(pos.y) + radius > config.maxY) { pos.y = Math.sign(pos.y) * (config.maxY - radius); vel.y = -vel.y * config.wallBounce; } }
      else if (pos.y - radius < -config.maxY) { pos.y = -config.maxY + radius; vel.y = -vel.y * config.wallBounce; }
      const mb = Math.max(config.maxZ, config.maxSize); if (Math.abs(pos.z) + radius > mb) { pos.z = Math.sign(pos.z) * (config.maxZ - radius); vel.z = -vel.z * config.wallBounce; }
      pos.toArray(positionData, base); vel.toArray(velocityData, base);
    }
  }
}

class Y extends MeshPhysicalMaterial {
  uniforms: { [key: string]: { value: any } } = { thicknessDistortion: { value: 0.1 }, thicknessAmbient: { value: 0 }, thicknessAttenuation: { value: 0.1 }, thicknessPower: { value: 2 }, thicknessScale: { value: 10 } };
  defines: { USE_UV: string };
  onBeforeCompile2?: (shader: any) => void;
  constructor(params: any) {
    super(params); this.defines = { USE_UV: '' };
    this.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader = `uniform float thicknessPower;\nuniform float thicknessScale;\nuniform float thicknessDistortion;\nuniform float thicknessAmbient;\nuniform float thicknessAttenuation;\n` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('void main() {',
        `void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }
        void main() {`);
      const lc = ShaderChunk.lights_fragment_begin.replaceAll(
        'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
        `RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);`);
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lc);
      if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
    };
  }
}

const DefaultConfig = { count: 200, colors: [0, 0, 0], ambientColor: 0xffffff, ambientIntensity: 1, lightIntensity: 200, materialParams: { metalness: 0.5, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.15 }, minSize: 0.5, maxSize: 1, size0: 1, gravity: 0.5, friction: 0.9975, wallBounce: 0.95, maxVelocity: 0.15, maxX: 5, maxY: 5, maxZ: 2, controlSphere0: false, followCursor: true };
const U = new Object3D();
let globalPointerActive = false;
const pointerPosition = new Vector2();
interface PointerData { position: Vector2; nPosition: Vector2; hover: boolean; touching: boolean; onEnter: (d: PointerData) => void; onMove: (d: PointerData) => void; onClick: (d: PointerData) => void; onLeave: (d: PointerData) => void; dispose?: () => void; }
const pointerMap = new Map<HTMLElement, PointerData>();

function createPointerData(options: Partial<PointerData> & { domElement: HTMLElement }): PointerData {
  const d: PointerData = { position: new Vector2(), nPosition: new Vector2(), hover: false, touching: false, onEnter: () => {}, onMove: () => {}, onClick: () => {}, onLeave: () => {}, ...options };
  if (!pointerMap.has(options.domElement)) {
    pointerMap.set(options.domElement, d);
    if (!globalPointerActive) {
      document.body.addEventListener('pointermove', onPointerMove as EventListener); document.body.addEventListener('pointerleave', onPointerLeave as EventListener); document.body.addEventListener('click', onPointerClick as EventListener);
      document.body.addEventListener('touchstart', onTouchStart as EventListener, { passive: false }); document.body.addEventListener('touchmove', onTouchMove as EventListener, { passive: false }); document.body.addEventListener('touchend', onTouchEnd as EventListener, { passive: false }); document.body.addEventListener('touchcancel', onTouchEnd as EventListener, { passive: false });
      globalPointerActive = true;
    }
  }
  d.dispose = () => { pointerMap.delete(options.domElement); if (pointerMap.size === 0) { document.body.removeEventListener('pointermove', onPointerMove as EventListener); document.body.removeEventListener('pointerleave', onPointerLeave as EventListener); document.body.removeEventListener('click', onPointerClick as EventListener); document.body.removeEventListener('touchstart', onTouchStart as EventListener); document.body.removeEventListener('touchmove', onTouchMove as EventListener); document.body.removeEventListener('touchend', onTouchEnd as EventListener); document.body.removeEventListener('touchcancel', onTouchEnd as EventListener); globalPointerActive = false; } };
  return d;
}
function onPointerMove(e: PointerEvent) { pointerPosition.set(e.clientX, e.clientY); processPointerInteraction(); }
function processPointerInteraction() { for (const [elem, data] of pointerMap) { const r = elem.getBoundingClientRect(); if (isInside(r)) { updatePointerData(data, r); if (!data.hover) { data.hover = true; data.onEnter(data); } data.onMove(data); } else if (data.hover && !data.touching) { data.hover = false; data.onLeave(data); } } }
function onTouchStart(e: TouchEvent) { if (e.touches.length > 0) { e.preventDefault(); pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY); for (const [elem, data] of pointerMap) { const r = elem.getBoundingClientRect(); if (isInside(r)) { data.touching = true; updatePointerData(data, r); if (!data.hover) { data.hover = true; data.onEnter(data); } data.onMove(data); } } } }
function onTouchMove(e: TouchEvent) { if (e.touches.length > 0) { e.preventDefault(); pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY); for (const [elem, data] of pointerMap) { const r = elem.getBoundingClientRect(); updatePointerData(data, r); if (isInside(r)) { if (!data.hover) { data.hover = true; data.touching = true; data.onEnter(data); } data.onMove(data); } else if (data.hover && data.touching) { data.onMove(data); } } } }
function onTouchEnd() { for (const [, data] of pointerMap) { if (data.touching) { data.touching = false; if (data.hover) { data.hover = false; data.onLeave(data); } } } }
function onPointerClick(e: PointerEvent) { pointerPosition.set(e.clientX, e.clientY); for (const [elem, data] of pointerMap) { const r = elem.getBoundingClientRect(); updatePointerData(data, r); if (isInside(r)) data.onClick(data); } }
function onPointerLeave() { for (const data of pointerMap.values()) { if (data.hover) { data.hover = false; data.onLeave(data); } } }
function updatePointerData(data: PointerData, rect: DOMRect) { data.position.set(pointerPosition.x - rect.left, pointerPosition.y - rect.top); data.nPosition.set((data.position.x / rect.width) * 2 - 1, (-data.position.y / rect.height) * 2 + 1); }
function isInside(rect: DOMRect) { return pointerPosition.x >= rect.left && pointerPosition.x <= rect.left + rect.width && pointerPosition.y >= rect.top && pointerPosition.y <= rect.top + rect.height; }

class Z extends InstancedMesh {
  config: typeof DefaultConfig; physics: W; ambientLight: AmbientLight | undefined; light: PointLight | undefined;
  constructor(renderer: WebGLRenderer, params: Partial<typeof DefaultConfig> = {}) {
    const config = { ...DefaultConfig, ...params }; const roomEnv = new RoomEnvironment(); const pmrem = new PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(roomEnv).texture; const geometry = new SphereGeometry();
    const material = new Y({ envMap: envTexture, ...config.materialParams }); material.envMapRotation.x = -Math.PI / 2;
    super(geometry, material, config.count); this.config = config; this.physics = new W(config); this.#setupLights(); this.setColors(config.colors);
  }
  #setupLights() { this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity); this.add(this.ambientLight); this.light = new PointLight(this.config.colors[0], this.config.lightIntensity); this.add(this.light); }
  setColors(colors: number[]) {
    if (Array.isArray(colors) && colors.length > 1) {
      const colorObjects = colors.map(c => new Color(c));
      const getColorAt = (ratio: number) => { const s = Math.max(0, Math.min(1, ratio)) * (colors.length - 1); const i = Math.floor(s); if (i >= colors.length - 1) return colorObjects[i].clone(); const a = s - i; const out = new Color(); out.r = colorObjects[i].r + a * (colorObjects[i + 1].r - colorObjects[i].r); out.g = colorObjects[i].g + a * (colorObjects[i + 1].g - colorObjects[i].g); out.b = colorObjects[i].b + a * (colorObjects[i + 1].b - colorObjects[i].b); return out; };
      for (let i = 0; i < this.count; i++) { this.setColorAt(i, getColorAt(i / this.count)); if (i === 0) this.light!.color.copy(getColorAt(i / this.count)); }
      if (this.instanceColor) this.instanceColor.needsUpdate = true;
    }
  }
  update(deltaInfo: { delta: number }) {
    this.physics.update(deltaInfo);
    for (let i = 0; i < this.count; i++) { U.position.fromArray(this.physics.positionData, 3 * i); if (i === 0 && this.config.followCursor === false) U.scale.setScalar(0); else U.scale.setScalar(this.physics.sizeData[i]); U.updateMatrix(); this.setMatrixAt(i, U.matrix); if (i === 0) this.light!.position.copy(U.position); }
    this.instanceMatrix.needsUpdate = true;
  }
}

interface CreateBallpitReturn { three: X; spheres: Z; setCount: (c: number) => void; togglePause: () => void; dispose: () => void; }

function createBallpit(canvas: HTMLCanvasElement, config: any = {}): CreateBallpitReturn {
  const t = new X({ canvas, size: 'parent', rendererOptions: { antialias: true, alpha: true } });
  let spheres: Z; t.renderer.toneMapping = ACESFilmicToneMapping; t.camera.position.set(0, 0, 20); t.camera.lookAt(0, 0, 0); t.cameraMaxAspect = 1.5; t.resize();
  initialize(config);
  const raycaster = new Raycaster(); const plane = new Plane(new Vector3(0, 0, 1), 0); const intersectionPoint = new Vector3(); let isPaused = false;
  canvas.style.touchAction = 'none'; canvas.style.userSelect = 'none'; (canvas.style as any).webkitUserSelect = 'none';
  const pd = createPointerData({ domElement: canvas, onMove() { raycaster.setFromCamera(pd.nPosition, t.camera); t.camera.getWorldDirection(plane.normal); raycaster.ray.intersectPlane(plane, intersectionPoint); spheres.physics.center.copy(intersectionPoint); spheres.config.controlSphere0 = true; }, onLeave() { spheres.config.controlSphere0 = false; } });
  function initialize(cfg: any) { if (spheres) { t.clear(); t.scene.remove(spheres); } spheres = new Z(t.renderer, cfg); t.scene.add(spheres); }
  t.onBeforeRender = d => { if (!isPaused) spheres.update(d); };
  t.onAfterResize = s => { spheres.config.maxX = s.wWidth / 2; spheres.config.maxY = s.wHeight / 2; };
  return { three: t, get spheres() { return spheres; }, setCount(c: number) { initialize({ ...spheres.config, count: c }); }, togglePause() { isPaused = !isPaused; }, dispose() { pd.dispose?.(); t.dispose(); } };
}

interface BallpitProps { className?: string; followCursor?: boolean; [key: string]: any; }

const Ballpit: React.FC<BallpitProps> = ({ className = '', followCursor = true, ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ref = useRef<CreateBallpitReturn | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    let disposed = false;
    const frameId = requestAnimationFrame(() => {
      if (disposed || !canvas.isConnected) return;
      try {
        ref.current = createBallpit(canvas, { followCursor, ...props });
      } catch (e) {
        console.warn('[Ballpit] Init failed:', e);
      }
    });
    return () => { disposed = true; cancelAnimationFrame(frameId); ref.current?.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <canvas className={`${className} w-full h-full`} ref={canvasRef} />;
};

export default Ballpit;
