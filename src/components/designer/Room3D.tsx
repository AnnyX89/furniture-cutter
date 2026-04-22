import { Canvas } from '@react-three/fiber';
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

interface Room3DProps {
  room: RoomData;
  items: Item3D[];
  ceilingHeight?: number;
}

const MM = 0.001;

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
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function RoomScene({ room, items, ceilingHeight = 2500 }: Room3DProps) {
  const W = room.width * MM;
  const D = room.height * MM;
  const H = ceilingHeight * MM;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[W * 0.5, H * 2.5, D * 0.8]} intensity={0.8} />
      <pointLight position={[W * 0.5, H * 0.7, D * 0.5]} intensity={0.25} color="#fff8ee" />

      {/* Пол */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, D / 2]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={room.floorColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Задняя стена (z=0) */}
      <mesh position={[W / 2, H / 2, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Левая стена (x=0) */}
      <mesh position={[0, H / 2, D / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Правая стена (x=W) */}
      <mesh position={[W, H / 2, D / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {items.map(item => <FurnitureMesh key={item.id} item={item} />)}
    </>
  );
}

export default function Room3D({ room, items, ceilingHeight = 2500 }: Room3DProps) {
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
        <RoomScene room={room} items={items} ceilingHeight={ceilingHeight} />
        <OrbitControls
          target={target}
          maxPolarAngle={Math.PI * 0.88}
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
