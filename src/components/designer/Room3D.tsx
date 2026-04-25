import { useRef, useMemo } from 'react';
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
const WIN_SILL    = 900  * MM;
const WIN_HEIGHT  = 1000 * MM;

interface SmartWallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  planeW: number;
  planeH: number;
  color: string;
  roughness?: number;
  nx: number; ny: number; nz: number;
  holes?: WallHole[];
}

function SmartWall({ position, rotation = [0, 0, 0], planeW, planeH, color, roughness = 0.9, nx, ny, nz, holes = [] }: SmartWallProps) {
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
        <meshStandardMaterial ref={matRef} color={color} roughness={roughness} transparent opacity={0.88} side={THREE.DoubleSide} />
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

    type Opening = { wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; fromEnd?: boolean; isWindow: boolean };
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

      const winH = op.isWindow ? ((op as Window3D).winHeight ?? 1000) * MM : DOOR_HEIGHT;
      const winY = op.isWindow ? ((op as Window3D).winSill   ??  900) * MM : 0;
      result[op.wall].push({ x: holeX, y: winY, w: sz, h: winH, isWindow: op.isWindow });
    }
    return result;
  }, [doors, windows, room.width, room.height, W, D]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[W * 0.5, H * 2.5, D * 0.8]} intensity={0.8} />
      <pointLight position={[W * 0.5, H * 0.7, D * 0.5]} intensity={0.25} color="#fff8ee" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, D / 2]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={room.floorColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Back wall  z=0 (top in 2D),    normal −Z */}
      <SmartWall position={[W/2, H/2, 0]} planeW={W} planeH={H} color={room.wallColor} nx={0} ny={0} nz={-1} holes={wallHoles.top} />
      {/* Front wall z=D (bottom in 2D), normal +Z */}
      <SmartWall position={[W/2, H/2, D]} planeW={W} planeH={H} color={room.wallColor} nx={0} ny={0} nz={1}  holes={wallHoles.bottom} />
      {/* Left wall  x=0 (left in 2D),   normal −X */}
      <SmartWall position={[0,   H/2, D/2]} rotation={[0, Math.PI/2, 0]} planeW={D} planeH={H} color={room.wallColor} nx={-1} ny={0} nz={0} holes={wallHoles.left} />
      {/* Right wall x=W (right in 2D),  normal +X */}
      <SmartWall position={[W,   H/2, D/2]} rotation={[0, Math.PI/2, 0]} planeW={D} planeH={H} color={room.wallColor} nx={1}  ny={0} nz={0} holes={wallHoles.right} />
      {/* Ceiling */}
      <SmartWall position={[W/2, H, D/2]} rotation={[Math.PI/2, 0, 0]} planeW={W} planeH={D} color={room.ceilingColor} roughness={0.95} nx={0} ny={1} nz={0} />

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
