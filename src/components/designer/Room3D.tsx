import React, { useRef, useMemo, useState } from 'react';
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

type CabinetType = 'doors' | 'drawers' | 'open' | 'sliding' | 'oven' | 'plate-rack' | 'drawer-doors';

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
  customH3d?: number;
  cabinetType?: CabinetType;
  doorCount?: number;
  drawerCount?: number;
  shelfCount?: number;
  shelfPositions?: string;
  ovenHeight?: number;
  countertopColor?: string;
  customMountedAt?: number;
}

type RoomCorner = 'tr' | 'br' | 'bl' | 'tl';

interface RoomData {
  width: number;
  height: number;
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  floorTexture?: string;
  wallTexture?: string;
  ceilTexture?: string;
  notchW?: number;
  notchH?: number;
  notchCorner?: RoomCorner;
}

interface Door3D { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; fromEnd?: boolean; }
interface Window3D { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; fromEnd?: boolean; winHeight?: number; winSill?: number; }
interface Niche3D { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; depth: number; }

interface PendingItem3D {
  w: number; h: number; color: string; templateId: string;
}

interface Room3DProps {
  room: RoomData;
  items: Item3D[];
  doors?: Door3D[];
  windows?: Window3D[];
  niches?: Niche3D[];
  ceilingHeight?: number;
  pendingItem?: PendingItem3D;
  onFloorClick?: (xMm: number, zMm: number) => void;
  selectedItemId?: string;
  onSelectItem?: (id: string | null) => void;
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

// ── Realistic furniture sub-meshes ───────────────────────────────────────────

interface FMProps {
  iw: number; itemH: number; id: number;
  ix: number; iy: number; iz: number;
  rotY: number; color: string;
  roughness: number; metalness: number;
  cabinetType?: CabinetType;
  doorCount?: number;
  drawerCount?: number;
  shelfCount?: number;
  shelfPositions?: string;
  ovenHeight?: number;
  countertopColor?: string;
}

function parseShelfPositions(str: string | undefined, H: number): number[] | null {
  if (!str?.trim()) return null;
  const vals = str.split(',').map(s => parseFloat(s.trim()) * MM).filter(v => !isNaN(v) && v > 0.01 && v < H - 0.01);
  return vals.length > 0 ? vals : null;
}

function WardrobeMesh({ iw, itemH, id, ix, iy, iz, rotY, color, roughness, metalness, cabinetType = 'doors', doorCount, drawerCount, shelfCount, shelfPositions }: FMProps) {
  const DT = 0.018;
  const g = 0.002;
  const T = 0.018;

  const body = (
    <mesh>
      <boxGeometry args={[iw, itemH, id]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );

  if (cabinetType === 'open' || cabinetType === 'plate-rack') {
    const customPos = parseShelfPositions(shelfPositions, itemH);
    const shelves = shelfCount ?? Math.max(2, Math.floor(itemH / 0.35));
    const spacing = itemH / (shelves + 1);
    const shelfYs: number[] = customPos
      ? customPos.map(p => -itemH / 2 + p)
      : Array.from({ length: shelves - 1 }, (_, i) => -itemH / 2 + spacing * (i + 1));

    return (
      <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
        <mesh position={[-iw / 2 + T / 2, 0, 0]}><boxGeometry args={[T, itemH, id]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>
        <mesh position={[iw / 2 - T / 2, 0, 0]}><boxGeometry args={[T, itemH, id]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>
        <mesh position={[0, itemH / 2 - T / 2, 0]}><boxGeometry args={[iw, T, id]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>
        <mesh position={[0, -itemH / 2 + T / 2, 0]}><boxGeometry args={[iw, T, id]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>
        <mesh position={[0, 0, -id / 2 + T / 2]}><boxGeometry args={[iw - T * 2, itemH - T * 2, T]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>
        {shelfYs.map((sy, i) => (
          <mesh key={i} position={[0, sy, 0]}>
            <boxGeometry args={[iw - T * 2, T, id - T]} /><meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
        ))}
        {cabinetType === 'plate-rack' && shelfYs.map((sy, si) => {
          const divCount = Math.max(3, Math.round((iw - T * 2) / 0.085));
          const dSpacing = (iw - T * 2) / (divCount + 1);
          return Array.from({ length: divCount }, (_, di) => (
            <mesh key={`${si}-${di}`} position={[-iw / 2 + T + dSpacing * (di + 1), sy + 0.09, 0]}>
              <boxGeometry args={[0.006, 0.18, id - T * 2]} />
              <meshStandardMaterial color="#9ca3af" roughness={0.4} metalness={0.5} />
            </mesh>
          ));
        })}
      </group>
    );
  }

  if (cabinetType === 'drawers') {
    const drawers = drawerCount ?? Math.max(2, Math.floor(itemH / 0.22));
    const dh = itemH / drawers;
    return (
      <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
        {body}
        {Array.from({ length: drawers }, (_, i) => (
          <group key={i} position={[0, -itemH / 2 + dh * (i + 0.5), id / 2 + 0.009]}>
            <mesh><boxGeometry args={[iw - g * 2, dh - g * 2, 0.016]} /><meshStandardMaterial color={color} roughness={roughness} metalness={metalness} /></mesh>
            <mesh position={[0, 0, 0.013]}>
              <boxGeometry args={[iw * 0.22, 0.012, 0.008]} /><meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (cabinetType === 'sliding') {
    const panelW = iw / 2 + 0.01;
    return (
      <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
        {body}
        <mesh position={[-iw * 0.12, 0, id / 2 + DT / 2 + 0.001]}>
          <boxGeometry args={[panelW - g, itemH - g * 2, DT]} />
          <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
        </mesh>
        <mesh position={[iw * 0.12, 0, id / 2 + DT + 0.003]}>
          <boxGeometry args={[panelW - g, itemH - g * 2, DT]} />
          <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
        </mesh>
        <mesh position={[0, 0, id / 2 + DT * 1.5 + 0.005]}>
          <boxGeometry args={[iw, 0.008, 0.005]} /><meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    );
  }

  // default: doors
  const doors = doorCount ?? Math.max(1, Math.round(iw / 0.55));
  const dw = iw / doors;
  const numShelves = shelfCount ?? 0;
  const doorShelfPos = parseShelfPositions(shelfPositions, itemH);
  const shelfYsDoors: number[] = doorShelfPos
    ? doorShelfPos.map(p => -itemH / 2 + p)
    : numShelves > 0 ? Array.from({ length: numShelves }, (_, i) => -itemH / 2 + itemH / (numShelves + 1) * (i + 1)) : [];
  return (
    <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <mesh position={[-iw / 2 + T / 2, 0, 0]}><boxGeometry args={[T, itemH, id]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      <mesh position={[iw / 2 - T / 2, 0, 0]}><boxGeometry args={[T, itemH, id]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      <mesh position={[0, itemH / 2 - T / 2, 0]}><boxGeometry args={[iw, T, id]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      <mesh position={[0, -itemH / 2 + T / 2, 0]}><boxGeometry args={[iw, T, id]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      <mesh position={[0, 0, -id / 2 + T / 2]}><boxGeometry args={[iw - T * 2, itemH - T * 2, T]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      {shelfYsDoors.map((sy, i) => (
        <mesh key={i} position={[0, sy, 0]}>
          <boxGeometry args={[iw - T * 2, T, id - T]} /><meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
      ))}
      {Array.from({ length: doors }, (_, i) => (
        <group key={i} position={[-iw / 2 + dw * (i + 0.5), 0, id / 2 + DT / 2 + 0.001]}>
          <mesh>
            <boxGeometry args={[dw - g, itemH - g * 2, DT]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[i < doors / 2 ? dw * 0.3 : -dw * 0.3, -itemH * 0.04, DT / 2 + 0.005]}>
            <boxGeometry args={[0.01, 0.1, 0.008]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BookcaseMesh({ iw, itemH, id, ix, iy, iz, rotY, color, shelfCount }: FMProps) {
  const shelves = shelfCount ?? Math.max(2, Math.floor(itemH / 0.35));
  const spacing = itemH / (shelves + 1);
  const T = 0.018;
  return (
    <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <mesh position={[-iw / 2 + T / 2, 0, 0]}><boxGeometry args={[T, itemH, id]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>
      <mesh position={[iw / 2 - T / 2, 0, 0]}><boxGeometry args={[T, itemH, id]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>
      <mesh position={[0, itemH / 2 - T / 2, 0]}><boxGeometry args={[iw, T, id]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>
      <mesh position={[0, -itemH / 2 + T / 2, 0]}><boxGeometry args={[iw, T, id]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>
      <mesh position={[0, 0, -id / 2 + T / 2]}><boxGeometry args={[iw - T * 2, itemH - T * 2, T]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>
      {Array.from({ length: shelves - 1 }, (_, i) => (
        <mesh key={i} position={[0, -itemH / 2 + spacing * (i + 1), 0]}>
          <boxGeometry args={[iw - T * 2, T, id - T]} /><meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function TableMesh({ iw, itemH, id, ix, iy, iz, rotY, color, roughness, metalness }: FMProps) {
  const topT = 0.038;
  const legS = Math.min(0.06, iw * 0.08);
  const legH = itemH - topT;
  const pad = 0.07;
  return (
    <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <mesh position={[0, itemH / 2 - topT / 2, 0]}>
        <boxGeometry args={[iw, topT, id]} /><meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
      </mesh>
      {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]).map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (iw / 2 - pad), -itemH / 2 + legH / 2, sz * (id / 2 - pad)]}>
          <boxGeometry args={[legS, legH, legS]} /><meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

function SofaMesh({ iw, itemH, id, ix, iy, iz, rotY, color }: FMProps) {
  const sH = itemH * 0.44;
  const bH = itemH * 0.56;
  const aW = Math.min(0.1, iw * 0.09);
  return (
    <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <mesh position={[0, -itemH / 2 + sH / 2, id * 0.1]}>
        <boxGeometry args={[iw, sH, id * 0.64]} /><meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, -itemH / 2 + sH + bH / 2, -id * 0.27]}>
        <boxGeometry args={[iw, bH, id * 0.22]} /><meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s * (iw / 2 - aW / 2), -itemH / 2 + sH * 0.78, id * 0.1]}>
          <boxGeometry args={[aW, sH * 0.82, id * 0.64]} /><meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function BedMesh({ iw, itemH, id, ix, iy, iz, rotY, color }: FMProps) {
  const frameH = itemH * 0.5;
  const mattH  = itemH * 0.38;
  const headT  = 0.06;
  return (
    <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <mesh position={[0, -itemH / 2 + frameH / 2, 0]}>
        <boxGeometry args={[iw, frameH, id]} /><meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, -itemH / 2 + frameH + mattH / 2, 0]}>
        <boxGeometry args={[iw * 0.94, mattH, id * 0.92]} /><meshStandardMaterial color="#f0ece8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, -id / 2 + headT / 2]}>
        <boxGeometry args={[iw, itemH, headT]} /><meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  );
}

function DresserMesh({ iw, itemH, id, ix, iy, iz, rotY, color, roughness, metalness }: FMProps) {
  const drawers = Math.max(2, Math.floor(itemH / 0.18));
  const dh = itemH / drawers;
  const g = 0.003;
  return (
    <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[iw, itemH, id]} /><meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {Array.from({ length: drawers }, (_, i) => (
        <group key={i} position={[0, -itemH / 2 + dh * (i + 0.5), id / 2 + 0.009]}>
          <mesh><boxGeometry args={[iw - g * 2, dh - g * 2, 0.016]} /><meshStandardMaterial color={color} roughness={roughness} metalness={metalness} /></mesh>
          <mesh position={[0, 0, 0.013]}>
            <boxGeometry args={[iw * 0.22, 0.012, 0.008]} /><meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function KitchenBaseMesh({ iw, itemH, id, ix, iy, iz, rotY, color, roughness, metalness, cabinetType = 'doors', doorCount, drawerCount, shelfCount, shelfPositions, ovenHeight, countertopColor = '#6b7280' }: FMProps) {
  const ctT = 0.04;
  const bodyH = itemH - ctT;
  const ovh = 0.02;
  const g = 0.003;

  let facade: React.ReactNode;
  if (cabinetType === 'drawers') {
    const drawers = drawerCount ?? Math.max(2, Math.floor(bodyH / 0.18));
    const dh = bodyH / drawers;
    facade = Array.from({ length: drawers }, (_, i) => (
      <group key={i} position={[0, -itemH / 2 + dh * (i + 0.5), id / 2 + 0.01]}>
        <mesh><boxGeometry args={[iw - g * 2, dh - g * 2, 0.016]} /><meshStandardMaterial color={color} roughness={roughness} metalness={metalness} /></mesh>
        <mesh position={[0, 0, 0.013]}><boxGeometry args={[iw * 0.25, 0.01, 0.008]} /><meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.8} /></mesh>
      </group>
    ));
  } else if (cabinetType === 'open') {
    const T = 0.018;
    const customPos = parseShelfPositions(shelfPositions, bodyH);
    const numShelves = shelfCount ?? Math.max(1, Math.floor(bodyH / 0.22));
    const shelfYs = customPos
      ? customPos.map(p => -itemH / 2 + p)
      : Array.from({ length: numShelves - 1 }, (_, i) => -itemH / 2 + bodyH / numShelves * (i + 1));
    const bY = -itemH / 2 + bodyH / 2;
    facade = (
      <>
        {/* Frame panels instead of solid body */}
        <mesh position={[-iw / 2 + T / 2, bY, 0]}><boxGeometry args={[T, bodyH, id]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
        <mesh position={[iw / 2 - T / 2, bY, 0]}><boxGeometry args={[T, bodyH, id]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
        <mesh position={[0, -itemH / 2 + T / 2, 0]}><boxGeometry args={[iw, T, id]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
        <mesh position={[0, 0, -id / 2 + T / 2]}><boxGeometry args={[iw - T * 2, bodyH - T * 2, T]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
        {shelfYs.map((sy, i) => (
          <mesh key={i} position={[0, sy, 0]}>
            <boxGeometry args={[iw - T * 2, T, id - T]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
        ))}
      </>
    );
  } else if (cabinetType === 'oven') {
    // Bottom: 1–N drawers; top: open oven cavity
    const numDrawers = drawerCount ?? 1;
    const ovenH_mm = ovenHeight ? ovenHeight * MM : undefined;
    const drawerZoneH = ovenH_mm
      ? Math.max(0.05, bodyH - ovenH_mm)
      : Math.min(bodyH * 0.28, numDrawers * 0.22);
    const dh = drawerZoneH / numDrawers;
    const ovenH = ovenH_mm ?? (bodyH - drawerZoneH);
    facade = (
      <>
        {/* Drawer(s) at the bottom */}
        {Array.from({ length: numDrawers }, (_, i) => (
          <group key={i} position={[0, -itemH / 2 + dh * (i + 0.5), id / 2 + 0.01]}>
            <mesh><boxGeometry args={[iw - g * 2, dh - g * 2, 0.016]} /><meshStandardMaterial color={color} roughness={roughness} metalness={metalness} /></mesh>
            <mesh position={[0, 0, 0.013]}><boxGeometry args={[iw * 0.25, 0.01, 0.008]} /><meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.8} /></mesh>
          </group>
        ))}
        {/* Oven cavity face — flush with drawer fronts */}
        <mesh position={[0, -itemH / 2 + drawerZoneH + ovenH / 2, id / 2 + 0.01]}>
          <boxGeometry args={[iw - g * 2, ovenH - g * 2, 0.016]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>
      </>
    );
  } else if (cabinetType === 'drawer-doors') {
    // Top drawer + doors below
    const drawerH = Math.min(bodyH * 0.25, 0.22);
    const doorsH = bodyH - drawerH;
    const numDoors = doorCount ?? Math.max(1, Math.round(iw / 0.55));
    const dw = iw / numDoors;
    const DT = 0.016;
    const g2 = 0.003;
    facade = (
      <>
        {/* Top drawer */}
        <group position={[0, -itemH / 2 + drawerH / 2, id / 2 + 0.01]}>
          <mesh><boxGeometry args={[iw - g * 2, drawerH - g * 2, DT]} /><meshStandardMaterial color={color} roughness={roughness} metalness={metalness} /></mesh>
          <mesh position={[0, 0, DT / 2 + 0.005]}><boxGeometry args={[iw * 0.25, 0.01, 0.008]} /><meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.8} /></mesh>
        </group>
        {/* Doors below */}
        {Array.from({ length: numDoors }, (_, i) => (
          <group key={i} position={[-iw / 2 + dw * (i + 0.5), -itemH / 2 + drawerH + doorsH / 2, id / 2 + 0.01]}>
            <mesh><boxGeometry args={[dw - g2 * 2, doorsH - g2 * 2, DT]} /><meshStandardMaterial color={color} roughness={roughness} metalness={metalness} /></mesh>
            <mesh position={[i < numDoors / 2 ? dw * 0.28 : -dw * 0.28, 0, DT / 2 + 0.005]}>
              <boxGeometry args={[0.008, doorsH * 0.38, 0.006]} /><meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>
        ))}
      </>
    );
  } else {
    // doors — with optional interior shelves
    const T = 0.018;
    const numDoors = doorCount ?? Math.max(1, Math.round(iw / 0.55));
    const dw = iw / numDoors;
    const DT = 0.016;
    const numShelves = shelfCount ?? 0;
    const customPos = parseShelfPositions(shelfPositions, bodyH);
    const shelfYs = customPos
      ? customPos.map(p => -itemH / 2 + p)
      : numShelves > 0 ? Array.from({ length: numShelves }, (_, i) => -itemH / 2 + bodyH / (numShelves + 1) * (i + 1)) : [];
    facade = (
      <>
        {shelfYs.map((sy, i) => (
          <mesh key={`shelf-${i}`} position={[0, sy, 0]}>
            <boxGeometry args={[iw - T * 2, T, id - T]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
        ))}
        {Array.from({ length: numDoors }, (_, i) => (
          <group key={i} position={[-iw / 2 + dw * (i + 0.5), -itemH / 2 + bodyH * 0.5, id / 2 + 0.01]}>
            <mesh>
              <boxGeometry args={[dw - g * 2, bodyH - 0.08, DT]} />
              <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
            </mesh>
            <mesh position={[i < numDoors / 2 ? dw * 0.28 : -dw * 0.28, 0, DT / 2 + 0.005]}>
              <boxGeometry args={[0.008, bodyH * 0.38, 0.006]} />
              <meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>
        ))}
      </>
    );
  }

  return (
    <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      {cabinetType !== 'open' && (
        <mesh position={[0, -itemH / 2 + bodyH / 2, 0]}>
          <boxGeometry args={[iw, bodyH, id]} /><meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
      )}
      <mesh position={[0, -itemH / 2 + bodyH + ctT / 2, 0]}>
        <boxGeometry args={[iw + ovh, ctT, id + ovh]} /><meshStandardMaterial color={countertopColor} roughness={0.3} metalness={countertopColor === '#c4c2c0' ? 0.7 : 0.08} />
      </mesh>
      {facade}
    </group>
  );
}

function SinkMesh({ iw, itemH, id, ix, iy, iz, rotY, color, countertopColor = '#6b7280' }: FMProps) {
  const ctT = 0.04;
  const bodyH = itemH - ctT;
  const ovh = 0.02;
  const bW = iw * 0.82;
  const bD = id * 0.72;
  const topY = -itemH / 2 + bodyH + ctT;
  return (
    <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <mesh position={[0, -itemH / 2 + bodyH / 2, 0]}>
        <boxGeometry args={[iw, bodyH, id]} /><meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <mesh position={[0, -itemH / 2 + bodyH + ctT / 2, 0]}>
        <boxGeometry args={[iw + ovh, ctT, id + ovh]} /><meshStandardMaterial color={countertopColor} roughness={0.3} metalness={countertopColor === '#c4c2c0' ? 0.7 : 0.08} />
      </mesh>
      {/* Sink basin */}
      <mesh position={[0, topY + 0.003, 0]}>
        <boxGeometry args={[bW, 0.006, bD]} /><meshStandardMaterial color="#c8cdd3" roughness={0.15} metalness={0.65} />
      </mesh>
      {/* Drain */}
      <mesh position={[bW * 0.22, topY + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.008, 16]} /><meshStandardMaterial color="#4b5563" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Faucet body */}
      <mesh position={[-bW * 0.3, topY + 0.05, -bD * 0.32]}>
        <cylinderGeometry args={[0.014, 0.016, 0.1, 8]} /><meshStandardMaterial color="#9ca3af" roughness={0.15} metalness={0.75} />
      </mesh>
      {/* Faucet spout */}
      <mesh position={[-bW * 0.3, topY + 0.11, -bD * 0.32 + 0.035]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.09, 8]} /><meshStandardMaterial color="#9ca3af" roughness={0.15} metalness={0.75} />
      </mesh>
    </group>
  );
}

function FridgeMesh({ iw, itemH, id, ix, iy, iz, rotY, color, roughness, metalness }: FMProps) {
  const DT = 0.018;
  const freezerH = itemH * 0.32;
  const fridgeH = itemH - freezerH;
  return (
    <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[iw, itemH, id]} />
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.1} />
      </mesh>
      <mesh position={[0, itemH / 2 - freezerH / 2, id / 2 + DT / 2 + 0.001]}>
        <boxGeometry args={[iw - 0.008, freezerH - 0.004, DT]} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
      </mesh>
      <mesh position={[0, -itemH / 2 + fridgeH / 2, id / 2 + DT / 2 + 0.001]}>
        <boxGeometry args={[iw - 0.008, fridgeH - 0.004, DT]} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
      </mesh>
      <mesh position={[iw * 0.28, itemH / 2 - freezerH / 2, id / 2 + DT + 0.009]}>
        <boxGeometry args={[0.012, freezerH * 0.4, 0.009]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[iw * 0.28, -itemH / 2 + fridgeH * 0.6, id / 2 + DT + 0.009]}>
        <boxGeometry args={[0.012, fridgeH * 0.42, 0.009]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

function HoodMesh({ iw, itemH, id, ix, iy, iz, rotY }: FMProps) {
  const T = 0.016;
  return (
    <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[iw, itemH, id]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[0, -itemH / 2 + 0.03, id / 2 + T / 2 + 0.001]}>
        <boxGeometry args={[iw - 0.01, 0.06, T]} />
        <meshStandardMaterial color="#6b7280" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, -itemH / 2 + 0.012, id / 2 + T + 0.002]}>
        <boxGeometry args={[iw * 0.35, 0.008, 0.006]} />
        <meshStandardMaterial color="#fef9c3" roughness={0.1} metalness={0.1} emissive="#fef3c7" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function CooktopMesh({ iw, itemH, id, ix, iy, iz, rotY, color }: FMProps) {
  const burnerR = Math.min(iw, id) * 0.12;
  return (
    <group position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[iw, itemH, id]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.3} />
      </mesh>
      {[-id * 0.22, id * 0.22].map((bz, i) => (
        <mesh key={i} position={[0, itemH / 2 + 0.001, bz]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[burnerR * 0.7, burnerR, 32]} />
          <meshStandardMaterial color="#374151" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function FurnitureMesh({ item }: { item: Item3D }) {
  const heights = FURNITURE_3D_HEIGHTS[item.templateId];
  const itemH = (item.customH3d ?? heights?.h ?? 800) * MM;
  const mountedAt = (item.customMountedAt ?? heights?.mountedAt ?? 0) * MM;
  const facade = FACADE_OPTIONS.find(f => f.id === item.facadeStyle) ?? FACADE_OPTIONS[0];

  // item.w/h already swapped when user rotates in 2D — use them for center position.
  // For 3D geometry, un-swap so rotation in 3D matches 2D footprint exactly.
  const iw = item.w * MM;
  const id = item.h * MM;
  const ix = item.x * MM + iw / 2;
  const iz = item.y * MM + id / 2;
  const iy = mountedAt + itemH / 2;
  const rotY = -item.rotation * (Math.PI / 180);
  const rot90 = item.rotation % 180 !== 0;
  const geoW = rot90 ? id : iw;
  const geoD = rot90 ? iw : id;

  const props: FMProps = { iw: geoW, itemH, id: geoD, ix, iy, iz, rotY, color: item.color, roughness: facade.roughness, metalness: facade.metalness, cabinetType: item.cabinetType, doorCount: item.doorCount, drawerCount: item.drawerCount, shelfCount: item.shelfCount, shelfPositions: item.shelfPositions, ovenHeight: item.ovenHeight, countertopColor: item.countertopColor };
  const tid = item.templateId;

  if (tid.includes('bookshelf') || tid.includes('bookcase'))  return <BookcaseMesh {...props} />;
  if (tid.includes('wardrobe') || tid.includes('coat-rack') || tid.startsWith('k-wall')) return <WardrobeMesh {...props} />;
  if (tid.includes('dresser') || tid.includes('nightstand') || tid.includes('buffet') || tid === 'l-tv' || tid === 'h-console' || tid === 'o-cabinet') return <DresserMesh {...props} />;
  if (tid.includes('desk') || tid.startsWith('d-table') || tid === 'k-island') return <TableMesh {...props} />;
  if (tid.startsWith('l-sofa') || tid === 'l-armchair')       return <SofaMesh {...props} />;
  if (tid.includes('bed'))                                     return <BedMesh {...props} />;
  if (tid === 'k-hood') return <HoodMesh {...props} />;
  if (tid === 'k-cooktop-2') return <CooktopMesh {...props} />;
  if (tid === 'k-sink' || tid === 'k-sink-68') return <SinkMesh {...props} />;
  if (tid.startsWith('k-base') || tid === 'k-stove' || tid === 'k-dishwasher' || tid === 'k-corner') return <KitchenBaseMesh {...props} />;
  if (tid === 'k-fridge') return <FridgeMesh {...props} />;

  return (
    <mesh position={[ix, iy, iz]} rotation={[0, rotY, 0]}>
      <boxGeometry args={[geoW, itemH, geoD]} />
      <meshStandardMaterial color={item.color} roughness={facade.roughness} metalness={facade.metalness} />
    </mesh>
  );
}

function NicheMesh({ niche, room, H }: { niche: Niche3D; room: RoomData; H: number }) {
  const W = room.width * MM;
  const D = room.height * MM;
  const sz  = niche.size  * MM;
  const dp  = niche.depth * MM;
  const p   = niche.pos   * MM;
  const col = room.wallColor;

  type Panel = { pos: [number, number, number]; rot: [number, number, number]; pw: number; ph: number };
  const panels: Panel[] = [];

  // Each wall: niche cavity extends OUTSIDE the room by dp.
  // We render back + 2 sides + top + floor of the cavity.
  if (niche.wall === 'top') {
    panels.push({ pos: [p + sz / 2, H / 2, -dp],      rot: [0, 0, 0],              pw: sz, ph: H  }); // back
    panels.push({ pos: [p,          H / 2, -dp / 2],   rot: [0, Math.PI / 2, 0],   pw: dp, ph: H  }); // left side
    panels.push({ pos: [p + sz,     H / 2, -dp / 2],   rot: [0, Math.PI / 2, 0],   pw: dp, ph: H  }); // right side
    panels.push({ pos: [p + sz / 2, H,     -dp / 2],   rot: [Math.PI / 2, 0, 0],   pw: sz, ph: dp }); // ceiling
    panels.push({ pos: [p + sz / 2, 0,     -dp / 2],   rot: [Math.PI / 2, 0, 0],   pw: sz, ph: dp }); // floor
  }
  if (niche.wall === 'bottom') {
    panels.push({ pos: [p + sz / 2, H / 2, D + dp],     rot: [0, 0, 0],            pw: sz, ph: H  });
    panels.push({ pos: [p,          H / 2, D + dp / 2],  rot: [0, Math.PI / 2, 0], pw: dp, ph: H  });
    panels.push({ pos: [p + sz,     H / 2, D + dp / 2],  rot: [0, Math.PI / 2, 0], pw: dp, ph: H  });
    panels.push({ pos: [p + sz / 2, H,     D + dp / 2],  rot: [Math.PI / 2, 0, 0], pw: sz, ph: dp });
    panels.push({ pos: [p + sz / 2, 0,     D + dp / 2],  rot: [Math.PI / 2, 0, 0], pw: sz, ph: dp });
  }
  if (niche.wall === 'left') {
    panels.push({ pos: [-dp,     H / 2, p + sz / 2],  rot: [0, Math.PI / 2, 0], pw: sz, ph: H  });
    panels.push({ pos: [-dp / 2, H / 2, p],            rot: [0, 0, 0],           pw: dp, ph: H  });
    panels.push({ pos: [-dp / 2, H / 2, p + sz],       rot: [0, 0, 0],           pw: dp, ph: H  });
    panels.push({ pos: [-dp / 2, H,     p + sz / 2],   rot: [Math.PI / 2, 0, 0], pw: dp, ph: sz });
    panels.push({ pos: [-dp / 2, 0,     p + sz / 2],   rot: [Math.PI / 2, 0, 0], pw: dp, ph: sz });
  }
  if (niche.wall === 'right') {
    panels.push({ pos: [W + dp,     H / 2, p + sz / 2], rot: [0, Math.PI / 2, 0], pw: sz, ph: H  });
    panels.push({ pos: [W + dp / 2, H / 2, p],           rot: [0, 0, 0],           pw: dp, ph: H  });
    panels.push({ pos: [W + dp / 2, H / 2, p + sz],      rot: [0, 0, 0],           pw: dp, ph: H  });
    panels.push({ pos: [W + dp / 2, H,     p + sz / 2],  rot: [Math.PI / 2, 0, 0], pw: dp, ph: sz });
    panels.push({ pos: [W + dp / 2, 0,     p + sz / 2],  rot: [Math.PI / 2, 0, 0], pw: dp, ph: sz });
  }

  return (
    <group>
      {panels.map((panel, i) => (
        <mesh key={i} position={panel.pos} rotation={panel.rot}>
          <planeGeometry args={[panel.pw, panel.ph]} />
          <meshStandardMaterial color={col} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

const GRID_MM = 100;

function FloorPlacer({ W, D, pendingItem, onFloorClick }: {
  W: number; D: number;
  pendingItem: PendingItem3D;
  onFloorClick: (xMm: number, zMm: number) => void;
}) {
  const [ghostPos, setGhostPos] = useState<[number,number,number] | null>(null);
  const heights = FURNITURE_3D_HEIGHTS[pendingItem.templateId];
  const itemH = (heights?.h ?? 800) * MM;
  const mountedAt = (heights?.mountedAt ?? 0) * MM;
  const iw = pendingItem.w * MM;
  const id = pendingItem.h * MM;

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[W / 2, 0.003, D / 2]}
        onPointerMove={e => {
          e.stopPropagation();
          const x = Math.max(iw / 2, Math.min(W - iw / 2, e.point.x));
          const z = Math.max(id / 2, Math.min(D - id / 2, e.point.z));
          setGhostPos([x, mountedAt + itemH / 2, z]);
        }}
        onPointerLeave={() => setGhostPos(null)}
        onPointerDown={e => {
          e.stopPropagation();
          const rawX = Math.max(iw / 2, Math.min(W - iw / 2, e.point.x));
          const rawZ = Math.max(id / 2, Math.min(D - id / 2, e.point.z));
          const xMm = Math.round(rawX / MM / GRID_MM) * GRID_MM;
          const zMm = Math.round(rawZ / MM / GRID_MM) * GRID_MM;
          onFloorClick(xMm, zMm);
        }}
      >
        <planeGeometry args={[W, D]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {ghostPos && (
        <group position={ghostPos}>
          <mesh>
            <boxGeometry args={[iw, itemH, id]} />
            <meshStandardMaterial color={pendingItem.color} transparent opacity={0.5} />
          </mesh>
          {/* Обводка */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(iw, itemH, id)]} />
            <lineBasicMaterial color="#2563eb" />
          </lineSegments>
        </group>
      )}
    </>
  );
}

function RoomScene({ room, items, doors = [], windows = [], niches = [], ceilingHeight = 2500, pendingItem, onFloorClick, selectedItemId, onSelectItem }: Room3DProps) {
  const W = room.width  * MM;
  const D = room.height * MM;
  const H = ceilingHeight * MM;

  // Build wall holes from doors + windows + niches
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
      const wallW    = isHoriz ? W  : D;
      const rawPos   = (op.fromEnd ? wallLen - op.pos - op.size : op.pos) * MM;
      const sz       = op.size * MM;
      const holeX    = isHoriz ? rawPos : (wallW - rawPos - sz);
      const winH = op.isWindow ? (op.winHeight ?? 1000) * MM : DOOR_HEIGHT;
      const winY = op.isWindow ? (op.winSill   ??  900) * MM : 0;
      result[op.wall].push({ x: holeX, y: winY, w: sz, h: winH, isWindow: op.isWindow });
    }

    // Niches cut a full-height opening in the wall plane
    for (const n of niches) {
      const isHoriz = n.wall === 'top' || n.wall === 'bottom';
      const wallW   = isHoriz ? W : D;
      const rawPos  = n.pos  * MM;
      const sz      = n.size * MM;
      const holeX   = isHoriz ? rawPos : (wallW - rawPos - sz);
      result[n.wall].push({ x: holeX, y: 0, w: sz, h: H, isWindow: false });
    }

    return result;
  }, [doors, windows, niches, room.width, room.height, W, D, H]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Build L-shape floor/ceiling geometry when notch is set.
  // Rotation [-PI/2, 0, 0] maps shape: X→world X, Y→world -Z+D/2
  // So shape Y=+D/2 → world Z=0 (2D "top"), shape Y=-D/2 → world Z=D (2D "bottom").
  const floorGeo = useMemo(() => {
    const nW = (room.notchW ?? 0) * MM;
    const nH = (room.notchH ?? 0) * MM;
    if (!nW || !nH) return null;
    const corner = room.notchCorner ?? 'br';
    const shape = new THREE.Shape();
    // 'br' notch = 2D bottom-right = world X∈[W-nW,W] Z∈[D-nH,D]
    //            = shape X∈[W/2-nW,W/2], Y∈[-D/2,-D/2+nH]
    if (corner === 'br') {
      shape.moveTo(-W/2,-D/2); shape.lineTo(W/2-nW,-D/2);
      shape.lineTo(W/2-nW,-D/2+nH); shape.lineTo(W/2,-D/2+nH);
      shape.lineTo(W/2,D/2); shape.lineTo(-W/2,D/2);
    } else if (corner === 'bl') {
      // 'bl' = 2D bottom-left = shape X∈[-W/2,-W/2+nW], Y∈[-D/2,-D/2+nH]
      shape.moveTo(-W/2+nW,-D/2); shape.lineTo(W/2,-D/2);
      shape.lineTo(W/2,D/2); shape.lineTo(-W/2,D/2);
      shape.lineTo(-W/2,-D/2+nH); shape.lineTo(-W/2+nW,-D/2+nH);
    } else if (corner === 'tr') {
      // 'tr' = 2D top-right = shape X∈[W/2-nW,W/2], Y∈[D/2-nH,D/2]
      shape.moveTo(-W/2,-D/2); shape.lineTo(W/2,-D/2);
      shape.lineTo(W/2,D/2-nH); shape.lineTo(W/2-nW,D/2-nH);
      shape.lineTo(W/2-nW,D/2); shape.lineTo(-W/2,D/2);
    } else { // tl
      // 'tl' = 2D top-left = shape X∈[-W/2,-W/2+nW], Y∈[D/2-nH,D/2]
      shape.moveTo(-W/2,-D/2); shape.lineTo(W/2,-D/2);
      shape.lineTo(W/2,D/2); shape.lineTo(-W/2+nW,D/2);
      shape.lineTo(-W/2+nW,D/2-nH); shape.lineTo(-W/2,D/2-nH);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [W, D, room.notchW, room.notchH, room.notchCorner]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute wall segments for L-shaped rooms
  const wallSegments = useMemo(() => {
    const nW = (room.notchW ?? 0) * MM;
    const nH = (room.notchH ?? 0) * MM;
    const corner = room.notchCorner ?? 'br';

    type WallSeg = {
      pos: [number,number,number]; rot?: [number,number,number];
      planeW: number; planeH: number;
      nx: number; ny: number; nz: number;
      side: 'H'|'V'; holes: WallHole[];
    };

    if (!nW || !nH) {
      return [
        { pos:[W/2,H/2,0]  as [number,number,number], planeW:W, planeH:H, nx:0,ny:0,nz:-1, side:'H' as const, holes:wallHoles.top },
        { pos:[W/2,H/2,D]  as [number,number,number], planeW:W, planeH:H, nx:0,ny:0,nz:1,  side:'H' as const, holes:wallHoles.bottom },
        { pos:[0,H/2,D/2]  as [number,number,number], rot:[0,Math.PI/2,0] as [number,number,number], planeW:D, planeH:H, nx:-1,ny:0,nz:0, side:'V' as const, holes:wallHoles.left },
        { pos:[W,H/2,D/2]  as [number,number,number], rot:[0,Math.PI/2,0] as [number,number,number], planeW:D, planeH:H, nx:1, ny:0,nz:0, side:'V' as const, holes:wallHoles.right },
      ] as WallSeg[];
    }

    const segs: WallSeg[] = [];

    if (corner === 'br') {
      // back (z=0): full width
      segs.push({ pos:[W/2,H/2,0], planeW:W, planeH:H, nx:0,ny:0,nz:-1, side:'H', holes:wallHoles.top });
      // front (z=D): shortened x=[0..W-nW]
      segs.push({ pos:[(W-nW)/2,H/2,D], planeW:W-nW, planeH:H, nx:0,ny:0,nz:1, side:'H', holes:wallHoles.bottom });
      // left (x=0): full depth
      segs.push({ pos:[0,H/2,D/2], rot:[0,Math.PI/2,0], planeW:D, planeH:H, nx:-1,ny:0,nz:0, side:'V', holes:wallHoles.left });
      // right (x=W): shortened z=[0..D-nH]
      segs.push({ pos:[W,H/2,(D-nH)/2], rot:[0,Math.PI/2,0], planeW:D-nH, planeH:H, nx:1,ny:0,nz:0, side:'V', holes:wallHoles.right });
      // inner step: z=D-nH, x=[W-nW..W] — нормаль в сторону ниши (+Z), чтоб из комнаты была непрозрачной
      segs.push({ pos:[W-nW/2,H/2,D-nH], planeW:nW, planeH:H, nx:0,ny:0,nz:1, side:'H', holes:[] });
      // inner step: x=W-nW, z=[D-nH..D]
      segs.push({ pos:[W-nW,H/2,D-nH/2], rot:[0,Math.PI/2,0], planeW:nH, planeH:H, nx:1,ny:0,nz:0, side:'V', holes:[] });
    } else if (corner === 'bl') {
      segs.push({ pos:[W/2,H/2,0], planeW:W, planeH:H, nx:0,ny:0,nz:-1, side:'H', holes:wallHoles.top });
      segs.push({ pos:[nW+(W-nW)/2,H/2,D], planeW:W-nW, planeH:H, nx:0,ny:0,nz:1, side:'H', holes:wallHoles.bottom });
      segs.push({ pos:[0,H/2,(D-nH)/2], rot:[0,Math.PI/2,0], planeW:D-nH, planeH:H, nx:-1,ny:0,nz:0, side:'V', holes:wallHoles.left });
      segs.push({ pos:[W,H/2,D/2], rot:[0,Math.PI/2,0], planeW:D, planeH:H, nx:1,ny:0,nz:0, side:'V', holes:wallHoles.right });
      segs.push({ pos:[nW/2,H/2,D-nH], planeW:nW, planeH:H, nx:0,ny:0,nz:1, side:'H', holes:[] });
      segs.push({ pos:[nW,H/2,D-nH/2], rot:[0,Math.PI/2,0], planeW:nH, planeH:H, nx:-1,ny:0,nz:0, side:'V', holes:[] });
    } else if (corner === 'tr') {
      segs.push({ pos:[(W-nW)/2,H/2,0], planeW:W-nW, planeH:H, nx:0,ny:0,nz:-1, side:'H', holes:wallHoles.top });
      segs.push({ pos:[W/2,H/2,D], planeW:W, planeH:H, nx:0,ny:0,nz:1, side:'H', holes:wallHoles.bottom });
      segs.push({ pos:[0,H/2,D/2], rot:[0,Math.PI/2,0], planeW:D, planeH:H, nx:-1,ny:0,nz:0, side:'V', holes:wallHoles.left });
      segs.push({ pos:[W,H/2,nH+(D-nH)/2], rot:[0,Math.PI/2,0], planeW:D-nH, planeH:H, nx:1,ny:0,nz:0, side:'V', holes:wallHoles.right });
      // inner step: z=nH, нормаль в сторону ниши (-Z), чтоб из комнаты (z>nH) была непрозрачной
      segs.push({ pos:[W-nW/2,H/2,nH], planeW:nW, planeH:H, nx:0,ny:0,nz:-1, side:'H', holes:[] });
      segs.push({ pos:[W-nW,H/2,nH/2], rot:[0,Math.PI/2,0], planeW:nH, planeH:H, nx:1,ny:0,nz:0, side:'V', holes:[] });
    } else { // tl
      segs.push({ pos:[nW+(W-nW)/2,H/2,0], planeW:W-nW, planeH:H, nx:0,ny:0,nz:-1, side:'H', holes:wallHoles.top });
      segs.push({ pos:[W/2,H/2,D], planeW:W, planeH:H, nx:0,ny:0,nz:1, side:'H', holes:wallHoles.bottom });
      segs.push({ pos:[0,H/2,nH+(D-nH)/2], rot:[0,Math.PI/2,0], planeW:D-nH, planeH:H, nx:-1,ny:0,nz:0, side:'V', holes:wallHoles.left });
      segs.push({ pos:[W,H/2,D/2], rot:[0,Math.PI/2,0], planeW:D, planeH:H, nx:1,ny:0,nz:0, side:'V', holes:wallHoles.right });
      segs.push({ pos:[nW/2,H/2,nH], planeW:nW, planeH:H, nx:0,ny:0,nz:-1, side:'H', holes:[] });
      segs.push({ pos:[nW,H/2,nH/2], rot:[0,Math.PI/2,0], planeW:nH, planeH:H, nx:-1,ny:0,nz:0, side:'V', holes:[] });
    }

    return segs;
  }, [W, D, H, room.notchW, room.notchH, room.notchCorner, wallHoles]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[W * 0.5, H * 2.5, D * 0.8]} intensity={0.8} />
      <pointLight position={[W * 0.5, H * 0.7, D * 0.5]} intensity={0.25} color="#fff8ee" />

      {/* Floor */}
      {floorGeo ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, D / 2]} geometry={floorGeo}>
          <meshStandardMaterial color={floorMat.tex ? '#ffffff' : room.floorColor} map={floorMat.tex ?? undefined} roughness={floorMat.roughness} metalness={floorMat.metalness} side={THREE.DoubleSide} />
        </mesh>
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, D / 2]}>
          <planeGeometry args={[W, D]} />
          <meshStandardMaterial color={floorMat.tex ? '#ffffff' : room.floorColor} map={floorMat.tex ?? undefined} roughness={floorMat.roughness} metalness={floorMat.metalness} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Walls (4 for rectangular, 6 for L-shaped) */}
      {wallSegments.map((seg, i) => (
        <SmartWall
          key={i}
          position={seg.pos}
          rotation={seg.rot}
          planeW={seg.planeW} planeH={seg.planeH}
          color={room.wallColor}
          nx={seg.nx} ny={seg.ny} nz={seg.nz}
          holes={seg.holes}
          map={seg.side === 'H' ? wallMat.texH : wallMat.texV}
          roughness={wallMat.roughness} metalness={wallMat.metalness}
        />
      ))}

      {/* Ceiling */}
      {floorGeo ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, H, D / 2]} geometry={floorGeo}>
          <meshStandardMaterial color={ceilMat.tex ? '#ffffff' : room.ceilingColor} map={ceilMat.tex ?? undefined} roughness={ceilMat.roughness} metalness={ceilMat.metalness} side={THREE.DoubleSide} />
        </mesh>
      ) : (
        <SmartWall position={[W/2, H, D/2]} rotation={[Math.PI/2, 0, 0]} planeW={W} planeH={D} color={room.ceilingColor} roughness={ceilMat.roughness} metalness={ceilMat.metalness} map={ceilMat.tex} nx={0} ny={1} nz={0} />
      )}

      {niches.map(n => <NicheMesh key={n.id} niche={n} room={room} H={H} />)}

      {items.map(item => (
        <group
          key={item.id}
          onClick={e => { e.stopPropagation(); onSelectItem?.(item.id); }}
          onPointerMissed={() => onSelectItem?.(null)}
        >
          <FurnitureMesh item={item} />
          {/* Рамка выбранного предмета */}
          {item.id === selectedItemId && (() => {
            const heights = FURNITURE_3D_HEIGHTS[item.templateId];
            const itemH = (item.customH3d ?? heights?.h ?? 800) * MM;
            const mountedAt = (item.customMountedAt ?? heights?.mountedAt ?? 0) * MM;
            const rot90 = item.rotation % 180 !== 0;
            const iw = item.w * MM; const id = item.h * MM;
            const geoW = rot90 ? id : iw; const geoD = rot90 ? iw : id;
            const rotY = -item.rotation * (Math.PI / 180);
            return (
              <group position={[item.x * MM + iw / 2, mountedAt + itemH / 2, item.y * MM + id / 2]} rotation={[0, rotY, 0]}>
                <lineSegments>
                  <edgesGeometry args={[new THREE.BoxGeometry(geoW + 0.01, itemH + 0.01, geoD + 0.01)]} />
                  <lineBasicMaterial color="#2563eb" />
                </lineSegments>
              </group>
            );
          })()}
        </group>
      ))}

      {pendingItem && onFloorClick && (
        <FloorPlacer W={W} D={D} pendingItem={pendingItem} onFloorClick={onFloorClick} />
      )}
    </>
  );
}

export default function Room3D({ room, items, doors = [], windows = [], niches = [], ceilingHeight = 2500, pendingItem, onFloorClick, selectedItemId, onSelectItem }: Room3DProps) {
  const W = room.width  * MM;
  const D = room.height * MM;
  const H = ceilingHeight * MM;
  const maxDim = Math.max(W, D, H);

  const camPos: [number, number, number] = [W * 1.2, maxDim * 1.4, D * 1.6];
  const target: [number, number, number] = [W / 2, H / 4, D / 2];

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden" style={{ cursor: pendingItem ? 'crosshair' : 'default' }}>
      <Canvas
        camera={{ position: camPos, fov: 45, near: 0.01, far: 200 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <RoomScene
          room={room} items={items} doors={doors} windows={windows} niches={niches} ceilingHeight={ceilingHeight}
          pendingItem={pendingItem} onFloorClick={onFloorClick} selectedItemId={selectedItemId} onSelectItem={onSelectItem}
        />
        <OrbitControls
          enabled={!pendingItem}
          target={target}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI * 0.82}
          minDistance={0.5}
          maxDistance={maxDim * 4}
        />
      </Canvas>
      <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/40 px-2 py-1 rounded pointer-events-none">
        {pendingItem
          ? '🖱️ Кликните на пол для размещения · Esc — отмена'
          : '🖱️ ЛКМ — вращать · Колёсико — зум · ПКМ — панорама'}
      </div>
    </div>
  );
}
