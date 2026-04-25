import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FURNITURE_3D_HEIGHTS, FACADE_OPTIONS } from './colorSchemes';
import type { FacadeStyle } from './colorSchemes';
import { FLOOR_TEXTURES, WALL_TEXTURES, CEIL_TEXTURES, getTextureMeta } from './texturePresets';

// ── Canvas texture helpers ────────────────────────────────────────────────────

const TILE_M: Record<string, [number, number]> = {
  'wood-light':      [0.18, 0.9],
  'wood-dark':       [0.18, 0.9],
  'parquet':         [0.4,  0.4],
  'marble-white':    [0.9,  0.9],
  'marble-dark':     [0.9,  0.9],
  'tile-white':      [0.3,  0.3],
  'tile-terracotta': [0.3,  0.3],
  'concrete':        [1.5,  1.5],
  'carpet-beige':    [0.32, 0.32],
  'carpet-gray':     [0.32, 0.32],
  'tile-metro':      [0.4,  0.2],
  'marble':          [0.9,  0.9],
  'wood-panel':      [0.6,  2.5],
  'wood-beam':       [0.6,  2.5],
  'brick':           [0.25, 0.065],
  'wallpaper-light': [0.5,  0.5],
  'plaster':         [1.5,  1.5],
};

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1,3),16)||0, parseInt(hex.slice(3,5),16)||0, parseInt(hex.slice(5,7),16)||0];
}
function clamp8(v: number) { return Math.max(0, Math.min(255, Math.round(v))); }
function shadeHex(hex: string, f: number): string {
  const [r,g,b] = hexToRgb(hex);
  return `rgb(${clamp8(r*(1+f))},${clamp8(g*(1+f))},${clamp8(b*(1+f))})`;
}
function drawVeins(ctx: CanvasRenderingContext2D, S: number, color: string, n: number) {
  ctx.strokeStyle = color;
  for (let i = 0; i < n; i++) {
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    let cx = Math.random()*S, cy = Math.random()*S;
    ctx.moveTo(cx, cy);
    for (let j = 0; j < 5; j++) {
      const nx = cx+(Math.random()-.5)*90, ny = cy+(Math.random()-.5)*90;
      ctx.quadraticCurveTo(cx+(Math.random()-.5)*40, cy+(Math.random()-.5)*40, nx, ny);
      cx = nx; cy = ny;
    }
    ctx.stroke();
  }
}

function buildCanvasTex(id: string, color: string): THREE.CanvasTexture | null {
  if (id === 'solid') return null;
  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, S, S);

  switch (id) {
    case 'wood-light': case 'wood-dark': {
      ctx.lineWidth = 0.7;
      for (let y = 0; y < S; y += 4) {
        ctx.strokeStyle = `rgba(0,0,0,${(0.06+Math.random()*0.06).toFixed(2)})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(S/3, y+(Math.random()*3-1.5), 2*S/3, y+(Math.random()*3-1.5), S, y);
        ctx.stroke();
      }
      break;
    }
    case 'parquet': {
      const ts = 64;
      for (let ty = 0; ty < S; ty += ts) for (let tx = 0; tx < S; tx += ts) {
        const alt = (((tx+ty)/ts)|0)%2===0;
        ctx.fillStyle = alt ? color : shadeHex(color, -0.12);
        ctx.fillRect(tx, ty, ts, ts);
        ctx.strokeStyle='rgba(0,0,0,0.18)'; ctx.lineWidth=1;
        ctx.strokeRect(tx+.5, ty+.5, ts-1, ts-1);
        ctx.strokeStyle='rgba(0,0,0,0.07)'; ctx.lineWidth=0.5;
        if (alt) { for (let l=ty+16;l<ty+ts;l+=16){ctx.beginPath();ctx.moveTo(tx,l);ctx.lineTo(tx+ts,l);ctx.stroke();} }
        else     { for (let l=tx+16;l<tx+ts;l+=16){ctx.beginPath();ctx.moveTo(l,ty);ctx.lineTo(l,ty+ts);ctx.stroke();} }
      }
      break;
    }
    case 'marble-white': case 'marble': {
      const g=ctx.createLinearGradient(0,0,S,S);
      g.addColorStop(0,'#f8f8f5'); g.addColorStop(.3,'#e8e4e0');
      g.addColorStop(.6,'#f5f3f0'); g.addColorStop(1,'#ddd8d0');
      ctx.fillStyle=g; ctx.fillRect(0,0,S,S);
      drawVeins(ctx, S, 'rgba(160,150,140,0.3)', 7);
      break;
    }
    case 'marble-dark': {
      drawVeins(ctx, S, 'rgba(255,255,255,0.18)', 6);
      break;
    }
    case 'tile-white': {
      const ts=42,gr=2;
      ctx.fillStyle='#d1d5db'; ctx.fillRect(0,0,S,S);
      for (let ty=0;ty<S;ty+=ts) for (let tx=0;tx<S;tx+=ts){
        ctx.fillStyle='#f5f5f0'; ctx.fillRect(tx+gr,ty+gr,ts-gr*2,ts-gr*2);
      }
      break;
    }
    case 'tile-terracotta': {
      const ts=42,gr=2;
      ctx.fillStyle='#a06040'; ctx.fillRect(0,0,S,S);
      for (let ty=0;ty<S;ty+=ts) for (let tx=0;tx<S;tx+=ts){
        ctx.fillStyle=`hsl(${18+(Math.random()*10|0)},50%,${44+(Math.random()*8|0)}%)`;
        ctx.fillRect(tx+gr,ty+gr,ts-gr*2,ts-gr*2);
      }
      break;
    }
    case 'concrete': {
      const img=ctx.getImageData(0,0,S,S); const [r,g,b]=hexToRgb(color);
      for (let i=0;i<img.data.length;i+=4){
        const n=(Math.random()-.5)*25;
        img.data[i]=clamp8(r+n); img.data[i+1]=clamp8(g+n); img.data[i+2]=clamp8(b+n); img.data[i+3]=255;
      }
      ctx.putImageData(img,0,0);
      break;
    }
    case 'carpet-beige': case 'carpet-gray': {
      ctx.strokeStyle='rgba(0,0,0,0.1)'; ctx.lineWidth=0.4;
      for (let i=-S;i<S*2;i+=5){
        ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+S,S);ctx.stroke();
        ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i-S,S);ctx.stroke();
      }
      break;
    }
    case 'tile-metro': {
      const tw=64,th=32,gr=2;
      ctx.fillStyle='#d4d4ce'; ctx.fillRect(0,0,S,S);
      for (let row=0;row*th<S;row++){
        const off=(row%2)*(tw>>1);
        for (let col=-1;col*tw<S;col++){
          ctx.fillStyle='#f0f0ec';
          ctx.fillRect(col*tw+off+gr, row*th+gr, tw-gr*2, th-gr*2);
        }
      }
      break;
    }
    case 'wood-panel': case 'wood-beam': {
      const pw=64;
      for (let x=0;x<S;x+=pw){
        ctx.fillStyle=((x/pw)|0)%2===0?color:shadeHex(color,-0.14);
        ctx.fillRect(x,0,pw-1,S);
        ctx.strokeStyle='rgba(0,0,0,0.05)'; ctx.lineWidth=0.5;
        for (let gy=0;gy<S;gy+=6){ctx.beginPath();ctx.moveTo(x,gy);ctx.lineTo(x+pw-1,gy+Math.sin(gy*.3+x));ctx.stroke();}
      }
      ctx.strokeStyle='rgba(0,0,0,0.22)'; ctx.lineWidth=1;
      for (let x=pw-1;x<S;x+=pw){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,S);ctx.stroke();}
      break;
    }
    case 'brick': {
      const bw=80,bh=32,gr=3;
      ctx.fillStyle='#8a7060'; ctx.fillRect(0,0,S,S);
      for (let row=0;row*bh<S+bh;row++){
        const off=(row%2)*(bw>>1);
        for (let col=-1;col*bw<S+bw;col++){
          const sh=0.88+Math.random()*.15;
          ctx.fillStyle=`rgb(${clamp8(176*sh)},${clamp8(92*sh)},${clamp8(74*sh)})`;
          ctx.fillRect(col*bw+off+gr, row*bh+gr, bw-gr*2, bh-gr*2);
        }
      }
      break;
    }
    case 'wallpaper-light': {
      ctx.fillStyle='rgba(0,0,0,0.04)';
      for (let i=-S;i<S*2;i+=20){
        ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+S,S);ctx.lineTo(i+S+10,S);ctx.lineTo(i+10,0);
        ctx.closePath();ctx.fill();
      }
      break;
    }
    case 'plaster': {
      const gp=ctx.createRadialGradient(S*.35,S*.4,0,S*.5,S*.5,S*.7);
      gp.addColorStop(0,'#fafafa'); gp.addColorStop(.6,'#f2f2f0'); gp.addColorStop(1,'#e8e8e6');
      ctx.fillStyle=gp; ctx.fillRect(0,0,S,S);
      break;
    }
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

interface Item3D {
  id: string;
  templateId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  color: string;
  facadeStyle: FacadeStyle;
}

interface RoomData {
  width: number;
  height: number;
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  floorTexture?: string;
  wallTexture?: string;
  ceilTexture?: string;
}

interface Door3D { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; fromEnd?: boolean; }
interface Window3D { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; fromEnd?: boolean; winHeight?: number; winSill?: number; }
interface Niche3D { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; depth: number; }

interface Room3DProps {
  room: RoomData;
  items: Item3D[];
  doors?: Door3D[];
  windows?: Window3D[];
  niches?: Niche3D[];
  ceilingHeight?: number;
}

interface WallHole {
  x: number; y: number; w: number; h: number;
  isWindow?: boolean;
}

const MM = 0.001;

const _cam = new THREE.Vector3();
const _pt = new THREE.Vector3();
const _nrm = new THREE.Vector3();

const DOOR_HEIGHT = 2100 * MM;

interface SmartWallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  planeW: number;
  planeH: number;
  color: string;
  roughness?: number;
  metalness?: number;
  map?: THREE.Texture | null;
  nx: number; ny: number; nz: number;
  holes?: WallHole[];
}

function SmartWall({ position, rotation = [0, 0, 0], planeW, planeH, color, roughness = 0.9, metalness = 0, map, nx, ny, nz, holes = [] }: SmartWallProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const { camera } = useThree();

  useFrame(() => {
    if (!matRef.current) return;
    _cam.copy(camera.position);
    _pt.set(...position);
    _nrm.set(nx, ny, nz);
    const dot = _cam.sub(_pt).dot(_nrm);
    const target = dot > 0.05 ? 0.05 : 0.88;
    matRef.current.opacity += (target - matRef.current.opacity) * 0.12;
  });

  const geo = useMemo(() => {
    if (holes.length === 0) return new THREE.PlaneGeometry(planeW, planeH);

    const shape = new THREE.Shape();
    shape.moveTo(-planeW / 2, -planeH / 2);
    shape.lineTo( planeW / 2, -planeH / 2);
    shape.lineTo( planeW / 2,  planeH / 2);
    shape.lineTo(-planeW / 2,  planeH / 2);
    shape.closePath();

    for (const h of holes) {
      const hx = h.x - planeW / 2;
      const hy = h.y - planeH / 2;
      const path = new THREE.Path();
      path.moveTo(hx,       hy);
      path.lineTo(hx + h.w, hy);
      path.lineTo(hx + h.w, hy + h.h);
      path.lineTo(hx,       hy + h.h);
      path.closePath();
      shape.holes.push(path);
    }
    return new THREE.ShapeGeometry(shape);
  }, [planeW, planeH, holes]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo}>
        <meshStandardMaterial ref={matRef} color={map ? '#ffffff' : color} roughness={roughness} metalness={metalness} map={map ?? undefined} transparent opacity={0.88} side={THREE.DoubleSide} />
      </mesh>
      {/* Glass panes inside window openings */}
      {holes.filter(h => h.isWindow).map((h, i) => (
        <mesh key={i} position={[h.x - planeW / 2 + h.w / 2, h.y - planeH / 2 + h.h / 2, 0.003]}>
          <planeGeometry args={[h.w, h.h]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.45} roughness={0.05} metalness={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function FurnitureMesh({ item }: { item: Item3D }) {
  const heights = FURNITURE_3D_HEIGHTS[item.templateId];
  const itemH = (heights?.h ?? 800) * MM;
  const mountedAt = (heights?.mountedAt ?? 0) * MM;
  const facade = FACADE_OPTIONS.find(f => f.id === item.facadeStyle) ?? FACADE_OPTIONS[0];

  const iw = item.w * MM;
  const id = item.h * MM;
  const ix = item.x * MM + iw / 2;
  const iz = item.y * MM + id / 2;
  const iy = mountedAt + itemH / 2;
  const rotY = -item.rotation * (Math.PI / 180);

  return (
    <mesh position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <boxGeometry args={[iw, itemH, id]} />
      <meshStandardMaterial color={item.color} roughness={facade.roughness} metalness={facade.metalness} />
    </mesh>
  );
}

function NicheMesh({ niche, room, H }: { niche: Niche3D; room: RoomData; H: number }) {
  const W = room.width * MM; const D = room.height * MM;
  const sz = niche.size * MM;
  const dp = niche.depth * MM;
  const p = niche.pos * MM;
  const cy = H / 2;

  let pos: [number,number,number] = [0,0,0];
  if (niche.wall === 'top')    { pos = [p + sz/2, cy, dp/2]; }
  if (niche.wall === 'bottom') { pos = [p + sz/2, cy, D - dp/2]; }
  if (niche.wall === 'left')   { pos = [dp/2,     cy, p + sz/2]; }
  if (niche.wall === 'right')  { pos = [W - dp/2, cy, p + sz/2]; }

  const isHoriz = niche.wall === 'top' || niche.wall === 'bottom';
  const bw = isHoriz ? sz : dp;
  const bd = isHoriz ? dp : sz;

  return (
    <mesh position={pos}>
      <boxGeometry args={[bw, H, bd]} />
      <meshStandardMaterial color={room.wallColor} roughness={0.9} />
    </mesh>
  );
}

function RoomScene({ room, items, doors = [], windows = [], niches = [], ceilingHeight = 2500 }: Room3DProps) {
  const W = room.width  * MM;
  const D = room.height * MM;
  const H = ceilingHeight * MM;

  // Build wall holes from doors + windows
  const wallHoles = useMemo(() => {
    const result: Record<'top'|'bottom'|'left'|'right', WallHole[]> = {
      top: [], bottom: [], left: [], right: [],
    };

    type Opening = { wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; fromEnd?: boolean; isWindow: boolean; winHeight?: number; winSill?: number };
    const all: Opening[] = [
      ...doors.map(d => ({ ...d, isWindow: false })),
      ...windows.map(w => ({ ...w, isWindow: true })),
    ];

    const rW = room.width;
    const rH = room.height;

    for (const op of all) {
      const isHoriz = op.wall === 'top' || op.wall === 'bottom';
      const wallLen  = isHoriz ? rW : rH;
      const wallW    = isHoriz ? W  : D;   // wall width in meters
      const rawPos   = (op.fromEnd ? wallLen - op.pos - op.size : op.pos) * MM;
      const sz       = op.size * MM;

      // top/bottom walls: local x = world x (direct)
      // left/right walls: local x = wallW - worldZ - sz (mirrored, because rotation π/2 around Y flips Z→-X)
      const holeX = isHoriz ? rawPos : (wallW - rawPos - sz);

      const winH = op.isWindow ? (op.winHeight ?? 1000) * MM : DOOR_HEIGHT;
      const winY = op.isWindow ? (op.winSill   ??  900) * MM : 0;
      result[op.wall].push({ x: holeX, y: winY, w: sz, h: winH, isWindow: op.isWindow });
    }
    return result;
  }, [doors, windows, room.width, room.height, W, D]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Texture memos ────────────────────────────────────────────────────────────
  const floorMat = useMemo(() => {
    const id = room.floorTexture ?? 'solid';
    const preset = getTextureMeta(id, FLOOR_TEXTURES);
    const tex = buildCanvasTex(id, room.floorColor);
    if (tex) { const [tw,td]=TILE_M[id]??[1,1]; tex.repeat.set(W/tw, D/td); }
    return { tex, roughness: preset.roughness, metalness: preset.metalness };
  }, [room.floorTexture, room.floorColor, W, D]); // eslint-disable-line react-hooks/exhaustive-deps

  const wallMat = useMemo(() => {
    const id = room.wallTexture ?? 'solid';
    const preset = getTextureMeta(id, WALL_TEXTURES);
    const [tw,th] = TILE_M[id] ?? [1,1];
    const makeT = (sw: number, sh: number) => {
      const t = buildCanvasTex(id, room.wallColor);
      if (t) t.repeat.set(sw/tw, sh/th);
      return t;
    };
    return { texH: makeT(W,H), texV: makeT(D,H), roughness: preset.roughness, metalness: preset.metalness };
  }, [room.wallTexture, room.wallColor, W, D, H]); // eslint-disable-line react-hooks/exhaustive-deps

  const ceilMat = useMemo(() => {
    const id = room.ceilTexture ?? 'solid';
    const preset = getTextureMeta(id, CEIL_TEXTURES);
    const tex = buildCanvasTex(id, room.ceilingColor);
    if (tex) { const [tw,td]=TILE_M[id]??[1,1]; tex.repeat.set(W/tw, D/td); }
    return { tex, roughness: preset.roughness, metalness: preset.metalness };
  }, [room.ceilTexture, room.ceilingColor, W, D]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[W * 0.5, H * 2.5, D * 0.8]} intensity={0.8} />
      <pointLight position={[W * 0.5, H * 0.7, D * 0.5]} intensity={0.25} color="#fff8ee" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, D / 2]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={floorMat.tex ? '#ffffff' : room.floorColor} map={floorMat.tex ?? undefined} roughness={floorMat.roughness} metalness={floorMat.metalness} side={THREE.DoubleSide} />
      </mesh>

      {/* Back wall  z=0 (top in 2D),    normal −Z */}
      <SmartWall position={[W/2, H/2, 0]} planeW={W} planeH={H} color={room.wallColor} nx={0} ny={0} nz={-1} holes={wallHoles.top} map={wallMat.texH} roughness={wallMat.roughness} metalness={wallMat.metalness} />
      {/* Front wall z=D (bottom in 2D), normal +Z */}
      <SmartWall position={[W/2, H/2, D]} planeW={W} planeH={H} color={room.wallColor} nx={0} ny={0} nz={1}  holes={wallHoles.bottom} map={wallMat.texH} roughness={wallMat.roughness} metalness={wallMat.metalness} />
      {/* Left wall  x=0 (left in 2D),   normal −X */}
      <SmartWall position={[0,   H/2, D/2]} rotation={[0, Math.PI/2, 0]} planeW={D} planeH={H} color={room.wallColor} nx={-1} ny={0} nz={0} holes={wallHoles.left} map={wallMat.texV} roughness={wallMat.roughness} metalness={wallMat.metalness} />
      {/* Right wall x=W (right in 2D),  normal +X */}
      <SmartWall position={[W,   H/2, D/2]} rotation={[0, Math.PI/2, 0]} planeW={D} planeH={H} color={room.wallColor} nx={1}  ny={0} nz={0} holes={wallHoles.right} map={wallMat.texV} roughness={wallMat.roughness} metalness={wallMat.metalness} />
      {/* Ceiling */}
      <SmartWall position={[W/2, H, D/2]} rotation={[Math.PI/2, 0, 0]} planeW={W} planeH={D} color={room.ceilingColor} roughness={ceilMat.roughness} metalness={ceilMat.metalness} map={ceilMat.tex} nx={0} ny={1} nz={0} />

      {niches.map(n  => <NicheMesh   key={n.id}  niche={n}  room={room} H={H} />)}
      {items.map(item => <FurnitureMesh key={item.id} item={item} />)}
    </>
  );
}

export default function Room3D({ room, items, doors = [], windows = [], niches = [], ceilingHeight = 2500 }: Room3DProps) {
  const W = room.width  * MM;
  const D = room.height * MM;
  const H = ceilingHeight * MM;
  const maxDim = Math.max(W, D, H);

  const camPos: [number, number, number] = [W * 1.2, maxDim * 1.4, D * 1.6];
  const target: [number, number, number] = [W / 2, H / 4, D / 2];

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: camPos, fov: 45, near: 0.01, far: 200 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <RoomScene room={room} items={items} doors={doors} windows={windows} niches={niches} ceilingHeight={ceilingHeight} />
        <OrbitControls
          target={target}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI * 0.82}
          minDistance={0.5}
          maxDistance={maxDim * 4}
        />
      </Canvas>
      <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/40 px-2 py-1 rounded pointer-events-none">
        🖱️ ЛКМ — вращать · Колёсико — зум · ПКМ — панорама
      </div>
    </div>
  );
}
