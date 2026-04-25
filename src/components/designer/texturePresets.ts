export interface TexturePreset {
  id: string;
  name: string;
  baseColor: string;
  roughness: number;
  metalness: number;
  // CSS gradient/pattern for UI swatch preview
  preview: string;
}

export const FLOOR_TEXTURES: TexturePreset[] = [
  { id: 'solid',            name: 'Однотонный', baseColor: '#c8a97e', roughness: 0.85, metalness: 0,
    preview: 'var(--floor-color)' },
  { id: 'wood-light',       name: 'Светлое дерево', baseColor: '#d4b896', roughness: 0.85, metalness: 0,
    preview: 'repeating-linear-gradient(90deg,#d4b896 0px,#d4b896 19px,#b8956e 20px)' },
  { id: 'wood-dark',        name: 'Тёмное дерево', baseColor: '#5a3a1e', roughness: 0.85, metalness: 0,
    preview: 'repeating-linear-gradient(90deg,#6b4c35 0px,#6b4c35 19px,#4a3020 20px)' },
  { id: 'parquet',          name: 'Паркет', baseColor: '#c8a97e', roughness: 0.82, metalness: 0,
    preview: 'repeating-conic-gradient(#c8a97e 0% 25%,#b8956e 25% 50%) 0 0/40px 40px' },
  { id: 'marble-white',     name: 'Белый мрамор', baseColor: '#f2f0ec', roughness: 0.25, metalness: 0.08,
    preview: 'linear-gradient(135deg,#f8f8f5 0%,#e8e4e0 30%,#f5f3f0 60%,#ddd8d0 100%)' },
  { id: 'marble-dark',      name: 'Чёрный мрамор', baseColor: '#1e1e1e', roughness: 0.25, metalness: 0.12,
    preview: 'linear-gradient(135deg,#2d2d2d 0%,#1a1a1a 30%,#353535 60%,#111 100%)' },
  { id: 'tile-white',       name: 'Белая плитка', baseColor: '#f5f5f0', roughness: 0.35, metalness: 0.05,
    preview: 'repeating-conic-gradient(#f5f5f0 0% 25%,#d1d5db 25% 50%) 0 0/30px 30px' },
  { id: 'tile-terracotta',  name: 'Терракота', baseColor: '#c07050', roughness: 0.75, metalness: 0,
    preview: 'repeating-conic-gradient(#c07050 0% 25%,#a06040 25% 50%) 0 0/30px 30px' },
  { id: 'concrete',         name: 'Бетон', baseColor: '#9ca3af', roughness: 0.98, metalness: 0,
    preview: 'linear-gradient(160deg,#9ca3af,#6b7280,#9ca3af,#8b929a)' },
  { id: 'carpet-beige',     name: 'Ковёр бежевый', baseColor: '#d6c9a8', roughness: 1.0, metalness: 0,
    preview: 'repeating-linear-gradient(45deg,#d6c9a8 0px,#d6c9a8 4px,#c9bc9b 4px,#c9bc9b 8px)' },
  { id: 'carpet-gray',      name: 'Ковёр серый', baseColor: '#9ca3af', roughness: 1.0, metalness: 0,
    preview: 'repeating-linear-gradient(45deg,#9ca3af 0px,#9ca3af 4px,#8b929a 4px,#8b929a 8px)' },
];

export const WALL_TEXTURES: TexturePreset[] = [
  { id: 'solid',            name: 'Однотонный', baseColor: '#f5f0eb', roughness: 0.9, metalness: 0,
    preview: 'var(--wall-color)' },
  { id: 'tile-metro',       name: 'Метро плитка', baseColor: '#f0f0ec', roughness: 0.3, metalness: 0.05,
    preview: 'repeating-conic-gradient(#f0f0ec 0% 25%,#d4d4ce 25% 50%) 0 0/40px 20px' },
  { id: 'marble',           name: 'Мрамор', baseColor: '#f2f0ec', roughness: 0.2, metalness: 0.15,
    preview: 'linear-gradient(135deg,#f8f8f5 0%,#e0ddd8 40%,#f5f3f0 70%,#ddd8d0 100%)' },
  { id: 'wood-panel',       name: 'Деревянные панели', baseColor: '#c8a97e', roughness: 0.85, metalness: 0,
    preview: 'repeating-linear-gradient(0deg,#c8a97e 0px,#c8a97e 59px,#a07850 60px)' },
  { id: 'brick',            name: 'Кирпич', baseColor: '#b05c4a', roughness: 0.95, metalness: 0,
    preview: 'repeating-linear-gradient(0deg,transparent 0,transparent 13px,#8a7060 13px,#8a7060 15px) 0 0/100% 15px,repeating-linear-gradient(90deg,transparent 0,transparent 28px,#8a7060 28px,#8a7060 30px) 0 0/30px 100%' },
  { id: 'concrete',         name: 'Бетон', baseColor: '#9ca3af', roughness: 0.98, metalness: 0,
    preview: 'linear-gradient(160deg,#9ca3af,#6b7280,#9ca3af,#8b929a)' },
  { id: 'wallpaper-light',  name: 'Обои светлые', baseColor: '#f5f0e8', roughness: 0.9, metalness: 0,
    preview: 'repeating-linear-gradient(135deg,#f5f0e8 0,#f5f0e8 10px,#ede8e0 10px,#ede8e0 20px)' },
];

export const CEIL_TEXTURES: TexturePreset[] = [
  { id: 'solid',        name: 'Однотонный', baseColor: '#ffffff', roughness: 0.95, metalness: 0,
    preview: 'var(--ceil-color)' },
  { id: 'plaster',      name: 'Штукатурка', baseColor: '#f8f8f6', roughness: 0.98, metalness: 0,
    preview: 'radial-gradient(circle at 30% 40%,#fafafa,#f0f0ee 60%,#e8e8e6)' },
  { id: 'wood-beam',    name: 'Деревянные балки', baseColor: '#d4b896', roughness: 0.85, metalness: 0,
    preview: 'repeating-linear-gradient(90deg,#d4b896 0px,#d4b896 59px,#a07850 60px)' },
  { id: 'concrete',     name: 'Бетон', baseColor: '#9ca3af', roughness: 0.98, metalness: 0,
    preview: 'linear-gradient(160deg,#9ca3af,#6b7280,#9ca3af)' },
];

// Returns a canvas-based THREE.CanvasTexture config (color + pattern type)
export function getTextureMeta(id: string, all: TexturePreset[]) {
  return all.find(t => t.id === id) ?? all[0];
}
