import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FURNITURE_3D_HEIGHTS, FACADE_OPTIONS } from './colorSchemes';
import type { FacadeStyle } from './colorSchemes';

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
}

interface Door3D { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; fromEnd?: boolean; }
interface Window3D { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; fromEnd?: boolean; }
interface Niche3D { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; depth: number; }

interface Room3DProps {
  room: RoomData;
  items: Item3D[];
  doors?: Door3D[];
  windows?: Window3D[];
  niches?: Niche3D[];
  ceilingHeight?: number;
}

const MM = 0.001;

// Переиспользуемые векторы — не создаём новые на каждый кадр
const _cam = new THREE.Vector3();
const _pt = new THREE.Vector3();
const _nrm = new THREE.Vector3();

interface SmartWallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  planeW: number;
  planeH: number;
  color: string;
  roughness?: number;
  // Внешняя нормаль стены (направление "наружу" от комнаты)
  nx: number; ny: number; nz: number;
}

function SmartWall({ position, rotation = [0, 0, 0], planeW, planeH, color, roughness = 0.9, nx, ny, nz }: SmartWallProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const { camera } = useThree();

  useFrame(() => {
    if (!matRef.current) return;
    _cam.copy(camera.position);
    _pt.set(...position);
    _nrm.set(nx, ny, nz);
    // Если камера на стороне внешней нормали — стена ближняя → прозрачная
    const dot = _cam.sub(_pt).dot(_nrm);
    const target = dot > 0.05 ? 0.05 : 0.88;
    matRef.current.opacity += (target - matRef.current.opacity) * 0.12;
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[planeW, planeH]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        roughness={roughness}
        transparent
        opacity={0.88}
        side={THREE.DoubleSide}
      />
    </mesh>
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
      <meshStandardMaterial
        color={item.color}
        roughness={facade.roughness}
        metalness={facade.metalness}
      />
    </mesh>
  );
}

const DOOR_HEIGHT = 2100 * MM;
const WIN_SILL = 900 * MM;
const WIN_HEIGHT = 1000 * MM;

function resolvePos(pos: number, size: number, wallLen: number, fromEnd?: boolean) {
  return (fromEnd ? wallLen - pos - size : pos) * MM;
}

function WindowMesh({ win, room, H }: { win: Window3D; room: RoomData; H: number }) {
  const W = room.width * MM; const D = room.height * MM;
  const sz = win.size * MM;
  const wallLen = (win.wall === 'top' || win.wall === 'bottom') ? room.width : room.height;
  const p = resolvePos(win.pos, win.size, wallLen, win.fromEnd);
  const cy = WIN_SILL + WIN_HEIGHT / 2;
  const OFFSET = 0.005;

  let pos: [number,number,number] = [0,0,0];
  let rot: [number,number,number] = [0,0,0];
  if (win.wall === 'top')    { pos = [p + sz/2, cy, OFFSET];     rot = [0, 0, 0]; }
  if (win.wall === 'bottom') { pos = [p + sz/2, cy, D - OFFSET]; rot = [0, 0, 0]; }
  if (win.wall === 'left')   { pos = [OFFSET,   cy, p + sz/2];   rot = [0, Math.PI/2, 0]; }
  if (win.wall === 'right')  { pos = [W - OFFSET, cy, p + sz/2]; rot = [0, Math.PI/2, 0]; }

  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[sz, WIN_HEIGHT]} />
      <meshStandardMaterial color="#bae6fd" transparent opacity={0.55} side={THREE.DoubleSide} roughness={0.1} metalness={0.1} />
    </mesh>
  );
}

function DoorMesh({ door, room, H }: { door: Door3D; room: RoomData; H: number }) {
  const W = room.width * MM; const D = room.height * MM;
  const sz = door.size * MM;
  const wallLen = (door.wall === 'top' || door.wall === 'bottom') ? room.width : room.height;
  const p = resolvePos(door.pos, door.size, wallLen, door.fromEnd);
  const cy = DOOR_HEIGHT / 2;
  const OFFSET = 0.006;

  let pos: [number,number,number] = [0,0,0];
  let rot: [number,number,number] = [0,0,0];
  if (door.wall === 'top')    { pos = [p + sz/2, cy, OFFSET];     rot = [0, 0, 0]; }
  if (door.wall === 'bottom') { pos = [p + sz/2, cy, D - OFFSET]; rot = [0, 0, 0]; }
  if (door.wall === 'left')   { pos = [OFFSET,   cy, p + sz/2];   rot = [0, Math.PI/2, 0]; }
  if (door.wall === 'right')  { pos = [W - OFFSET, cy, p + sz/2]; rot = [0, Math.PI/2, 0]; }

  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[sz, DOOR_HEIGHT]} />
      <meshStandardMaterial color="#92400e" transparent opacity={0.45} side={THREE.DoubleSide} roughness={0.8} />
    </mesh>
  );
}

function NicheMesh({ niche, room, H }: { niche: Niche3D; room: RoomData; H: number }) {
  const W = room.width * MM; const D = room.height * MM;
  const sz = niche.size * MM;
  const dp = niche.depth * MM;
  const p = niche.pos * MM;
  const nicheH = H * 0.85;
  const cy = nicheH / 2;

  let pos: [number,number,number] = [0,0,0];
  let rot: [number,number,number] = [0,0,0];
  if (niche.wall === 'top')    { pos = [p + sz/2, cy, dp/2];     rot = [0, 0, 0]; }
  if (niche.wall === 'bottom') { pos = [p + sz/2, cy, D - dp/2]; rot = [0, 0, 0]; }
  if (niche.wall === 'left')   { pos = [dp/2,     cy, p + sz/2]; rot = [0, Math.PI/2, 0]; }
  if (niche.wall === 'right')  { pos = [W - dp/2, cy, p + sz/2]; rot = [0, Math.PI/2, 0]; }

  return (
    <mesh position={pos} rotation={rot}>
      <boxGeometry args={[sz, nicheH, dp]} />
      <meshStandardMaterial color="#d1d5db" transparent opacity={0.35} side={THREE.DoubleSide} roughness={0.9} />
    </mesh>
  );
}

function RoomScene({ room, items, doors = [], windows = [], niches = [], ceilingHeight = 2500 }: Room3DProps) {
  const W = room.width * MM;
  const D = room.height * MM;
  const H = ceilingHeight * MM;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[W * 0.5, H * 2.5, D * 0.8]} intensity={0.8} />
      <pointLight position={[W * 0.5, H * 0.7, D * 0.5]} intensity={0.25} color="#fff8ee" />

      {/* Пол — всегда виден */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, D / 2]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={room.floorColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Задняя стена z=0, внешняя нормаль -Z */}
      <SmartWall position={[W / 2, H / 2, 0]} planeW={W} planeH={H} color={room.wallColor} nx={0} ny={0} nz={-1} />

      {/* Передняя стена z=D, внешняя нормаль +Z */}
      <SmartWall position={[W / 2, H / 2, D]} planeW={W} planeH={H} color={room.wallColor} nx={0} ny={0} nz={1} />

      {/* Левая стена x=0, внешняя нормаль -X */}
      <SmartWall position={[0, H / 2, D / 2]} rotation={[0, Math.PI / 2, 0]} planeW={D} planeH={H} color={room.wallColor} nx={-1} ny={0} nz={0} />

      {/* Правая стена x=W, внешняя нормаль +X */}
      <SmartWall position={[W, H / 2, D / 2]} rotation={[0, Math.PI / 2, 0]} planeW={D} planeH={H} color={room.wallColor} nx={1} ny={0} nz={0} />

      {/* Потолок y=H, внешняя нормаль +Y */}
      <SmartWall position={[W / 2, H, D / 2]} rotation={[Math.PI / 2, 0, 0]} planeW={W} planeH={D} color={room.ceilingColor} roughness={0.95} nx={0} ny={1} nz={0} />

      {windows.map(w => <WindowMesh key={w.id} win={w} room={room} H={H} />)}
      {doors.map(d => <DoorMesh key={d.id} door={d} room={room} H={H} />)}
      {niches.map(n => <NicheMesh key={n.id} niche={n} room={room} H={H} />)}

      {items.map(item => <FurnitureMesh key={item.id} item={item} />)}
    </>
  );
}

export default function Room3D({ room, items, doors = [], windows = [], niches = [], ceilingHeight = 2500 }: Room3DProps) {
  const W = room.width * MM;
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
