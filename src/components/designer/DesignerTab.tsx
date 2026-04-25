import { useState, useRef, useCallback, lazy, Suspense } from 'react';
import { FURNITURE, CATEGORIES } from './furnitureLibrary';
import type { FurnitureTemplate } from './furnitureLibrary';
import { COLOR_SCHEMES, FACADE_OPTIONS } from './colorSchemes';
import type { FacadeStyle, ColorScheme } from './colorSchemes';
import { generateFurnitureParts } from './furnitureParts';
import type { Part, Project, RoomDesign } from '../../types';
import { v4 as uuid } from 'uuid';

const Room3D = lazy(() => import('./Room3D'));

interface Room {
  width: number;
  height: number;
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
}

interface Niche {
  id: string;
  name: string;
  wall: 'top' | 'bottom' | 'left' | 'right';
  pos: number;
  size: number;
  depth: number;
}

interface Door { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; fromEnd?: boolean; }
interface Window { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; fromEnd?: boolean; }

interface PlacedItem {
  id: string;
  templateId: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  color: string;
  facadeStyle: FacadeStyle;
  shape?: string;
  icon: string;
}

interface DesignerTabProps {
  onSendToCutting?: (parts: Part[]) => void;
  firstMaterialId?: string;
  project?: Project;
  onSaveDesign?: (design: RoomDesign) => void;
}

const SCALE = 0.12;
const GRID = 100;

const WALL_COLORS = ['#f5f0eb','#e8e0d5','#d4c5b5','#f0e8d8','#e8f0e8','#d8e8f0','#e8d8f0','#f0d8d8','#ffffff','#f5f5f5','#2d2d2d'];
const FLOOR_COLORS = ['#c8a97e','#a07850','#8b6340','#d4b896','#e8d5b8','#4a3728','#6b4c35','#c2b280','#f5e6c8','#9e7b5a','#2d2019'];
const CEIL_COLORS = ['#ffffff','#f8f8f0','#fffff0','#f0f8f8','#f5f0f5','#e8e8e8'];

function roomToScreen(v: number) { return v * SCALE; }

function buildRoomPath(room: Room, niches: Niche[]): string {
  const W = room.width; const H = room.height; const s = SCALE;
  const top    = niches.filter(n => n.wall === 'top').sort((a,b) => a.pos - b.pos);
  const bottom = niches.filter(n => n.wall === 'bottom').sort((a,b) => a.pos - b.pos);
  const left   = niches.filter(n => n.wall === 'left').sort((a,b) => a.pos - b.pos);
  const right  = niches.filter(n => n.wall === 'right').sort((a,b) => a.pos - b.pos);
  const pts: [number,number][] = [];

  pts.push([0, 0]);
  for (const n of top) { pts.push([n.pos*s,0],[n.pos*s,n.depth*s],[(n.pos+n.size)*s,n.depth*s],[(n.pos+n.size)*s,0]); }
  pts.push([W*s, 0]);
  for (const n of right) { pts.push([W*s,n.pos*s],[(W-n.depth)*s,n.pos*s],[(W-n.depth)*s,(n.pos+n.size)*s],[W*s,(n.pos+n.size)*s]); }
  pts.push([W*s, H*s]);
  for (const n of [...bottom].reverse()) { pts.push([(n.pos+n.size)*s,H*s],[(n.pos+n.size)*s,(H-n.depth)*s],[n.pos*s,(H-n.depth)*s],[n.pos*s,H*s]); }
  pts.push([0, H*s]);
  for (const n of [...left].reverse()) { pts.push([0,(n.pos+n.size)*s],[n.depth*s,(n.pos+n.size)*s],[n.depth*s,n.pos*s],[0,n.pos*s]); }

  return 'M ' + pts.map(([x,y]) => `${x},${y}`).join(' L ') + ' Z';
}

export default function DesignerTab({ onSendToCutting, firstMaterialId = '', project, onSaveDesign }: DesignerTabProps) {
  const saved = project?.design;
  const [room, setRoom] = useState<Room>(saved?.room ?? { width: 4000, height: 5000, wallColor: '#f5f0eb', floorColor: '#c8a97e', ceilingColor: '#ffffff' });
  const [niches, setNiches] = useState<Niche[]>((saved?.niches as Niche[]) ?? []);
  const [items, setItems] = useState<PlacedItem[]>((saved?.items as PlacedItem[]) ?? []);
  const [doors, setDoors] = useState<Door[]>((saved?.doors as Door[]) ?? []);
  const [windows, setWindows] = useState<Window[]>((saved?.windows as Window[]) ?? []);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('kitchen');
  const [sideTab, setSideTab] = useState<'room'|'niches'|'furniture'|'openings'>('furniture');
  const [dragging, setDragging] = useState<{id:string; ox:number; oy:number} | null>(null);
  const [view, setView] = useState<'2d' | '3d'>('2d');
  const [activeScheme, setActiveScheme] = useState<string | null>(null);

  // Рулетка
  const [measureMode, setMeasureMode] = useState(false);
  const [measureA, setMeasureA] = useState<{x:number;y:number}|null>(null);
  const [measureB, setMeasureB] = useState<{x:number;y:number}|null>(null);
  const [hoverPos, setHoverPos] = useState<{x:number;y:number}|null>(null);

  const canvasRef = useRef<SVGSVGElement>(null);
  const RW = roomToScreen(room.width);
  const RH = roomToScreen(room.height);
  const PAD = 60;

  function applyScheme(scheme: ColorScheme) {
    setRoom(r => ({ ...r, wallColor: scheme.wallColor, floorColor: scheme.floorColor, ceilingColor: scheme.ceilingColor }));
    setActiveScheme(scheme.id);
  }

  function addNiche() {
    setNiches(prev => [...prev, { id: uuid(), name: 'Ниша', wall: 'left', pos: 500, size: 600, depth: 300 }]);
  }

  function updateNiche(id: string, changes: Partial<Niche>) {
    setNiches(prev => prev.map(n => n.id === id ? {...n, ...changes} : n));
  }

  function addFurniture(tpl: FurnitureTemplate) {
    const item: PlacedItem = {
      id: uuid(), templateId: tpl.id, name: tpl.name,
      x: Math.round((room.width / 2 - tpl.w / 2) / GRID) * GRID,
      y: Math.round((room.height / 2 - tpl.h / 2) / GRID) * GRID,
      w: tpl.w, h: tpl.h, rotation: 0,
      color: tpl.color, facadeStyle: 'matte', shape: tpl.shape, icon: tpl.icon,
    };
    setItems(prev => [...prev, item]);
    setSelected(item.id);
  }

  function removeSelected() {
    if (!selected) return;
    setItems(prev => prev.filter(i => i.id !== selected));
    setSelected(null);
  }

  function rotateSelected() {
    if (!selected) return;
    setItems(prev => prev.map(i => i.id === selected
      ? { ...i, rotation: (i.rotation + 90) % 360, w: i.h, h: i.w } : i));
  }

  const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (measureMode) return;
    e.stopPropagation();
    setSelected(id);
    const svg = canvasRef.current!;
    const rect = svg.getBoundingClientRect();
    const item = items.find(i => i.id === id)!;
    const mx = (e.clientX - rect.left - PAD) / SCALE;
    const my = (e.clientY - rect.top - PAD) / SCALE;
    setDragging({ id, ox: mx - item.x, oy: my - item.y });
  }, [items, measureMode]);

  const onSvgMouseMove = useCallback((e: React.MouseEvent) => {
    const svg = canvasRef.current!;
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left - PAD) / SCALE;
    const my = (e.clientY - rect.top - PAD) / SCALE;
    if (measureMode) {
      setHoverPos({ x: mx, y: my });
      return;
    }
    if (!dragging) return;
    const item = items.find(i => i.id === dragging.id)!;
    const snap = GRID;
    let nx = Math.round((mx - dragging.ox) / snap) * snap;
    let ny = Math.round((my - dragging.oy) / snap) * snap;
    nx = Math.max(0, Math.min(room.width - item.w, nx));
    ny = Math.max(0, Math.min(room.height - item.h, ny));
    setItems(prev => prev.map(i => i.id === dragging.id ? { ...i, x: nx, y: ny } : i));
  }, [dragging, items, room, measureMode]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  function onSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!measureMode) { setSelected(null); return; }
    const svg = canvasRef.current!;
    const rect = svg.getBoundingClientRect();
    const mx = Math.round((e.clientX - rect.left - PAD) / SCALE);
    const my = Math.round((e.clientY - rect.top - PAD) / SCALE);
    if (!measureA) {
      setMeasureA({ x: mx, y: my });
      setMeasureB(null);
    } else {
      setMeasureB({ x: mx, y: my });
    }
  }

  function resetMeasure() {
    setMeasureMode(false);
    setMeasureA(null);
    setMeasureB(null);
    setHoverPos(null);
  }

  function handleSendToCutting() {
    if (!onSendToCutting) return;
    const parts = generateFurnitureParts(items, firstMaterialId);
    if (parts.length === 0) {
      alert('Нет корпусной мебели для раскроя. Добавьте шкафы, кухонные секции или тумбы.');
      return;
    }
    onSendToCutting(parts);
  }

  function addDoor() { setDoors(prev => [...prev, { id: uuid(), wall: 'bottom', pos: 500, size: 900 }]); }
  function addWindow() { setWindows(prev => [...prev, { id: uuid(), wall: 'top', pos: 800, size: 1200 }]); }

  const selectedItem = items.find(i => i.id === selected);

  // Статистика комнаты
  const roomAreaM2 = (room.width * room.height / 1e6);
  const furnitureAreaM2 = items.reduce((s, i) => s + i.w * i.h / 1e6, 0);
  const freeAreaM2 = Math.max(0, roomAreaM2 - furnitureAreaM2);
  const occupancyPct = Math.round(furnitureAreaM2 / roomAreaM2 * 100);

  // Расстояния от выбранного предмета до стен
  const wallDists = selectedItem ? {
    top: selectedItem.y,
    bottom: room.height - selectedItem.y - selectedItem.h,
    left: selectedItem.x,
    right: room.width - selectedItem.x - selectedItem.w,
  } : null;

  const gridLines = [];
  for (let x = 0; x <= room.width; x += GRID)
    gridLines.push(<line key={`gx${x}`} x1={x*SCALE} y1={0} x2={x*SCALE} y2={RH} stroke="#e5e7eb" strokeWidth="0.5" />);
  for (let y = 0; y <= room.height; y += GRID)
    gridLines.push(<line key={`gy${y}`} x1={0} y1={y*SCALE} x2={RW} y2={y*SCALE} stroke="#e5e7eb" strokeWidth="0.5" />);

  const roomPath = buildRoomPath(room, niches);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0 bg-gray-100 rounded-xl overflow-hidden border">

      {/* ── Sidebar ─────────────────────────────── */}
      <div className="w-72 flex-shrink-0 bg-white border-r flex flex-col">
        <div className="flex border-b text-xs overflow-x-auto">
          {([['furniture','🛋️'],['room','🏠'],['niches','🔲'],['openings','🚪']] as const).map(([id,icon]) => (
            <button key={id} onClick={() => setSideTab(id)}
              className={`flex-1 py-2 font-medium transition-colors ${sideTab===id ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {icon}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Мебель */}
          {sideTab === 'furniture' && (
            <div>
              <div className="p-2 flex flex-wrap gap-1">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setActiveCategory(c.id)}
                    className={`px-2 py-1 rounded text-xs font-medium ${activeCategory===c.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
              <div className="px-2 pb-2 grid grid-cols-2 gap-1">
                {FURNITURE.filter(f => f.category === activeCategory).map(f => (
                  <button key={f.id} onClick={() => addFurniture(f)}
                    className="text-left p-2 rounded-lg border hover:border-blue-400 hover:bg-blue-50 text-xs"
                    style={{ borderLeftColor: f.color, borderLeftWidth: 3 }}>
                    <div className="font-medium text-gray-700 leading-tight">{f.name}</div>
                    <div className="text-gray-400 mt-0.5">{f.w}×{f.h}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Комната */}
          {sideTab === 'room' && (
            <div className="p-3 space-y-4">
              {/* Готовые схемы */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Готовые схемы</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {COLOR_SCHEMES.map(scheme => (
                    <button key={scheme.id} onClick={() => applyScheme(scheme)}
                      className={`p-2 rounded-lg border-2 text-left ${activeScheme===scheme.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex gap-1 mb-1">
                        {scheme.preview.map((c,i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{background:c}} />
                        ))}
                      </div>
                      <div className="text-xs font-medium text-gray-700 leading-tight">{scheme.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Размеры */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Размеры (мм)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Ширина</label>
                    <input type="number" step="100" className="w-full border rounded px-2 py-1 text-sm mt-0.5"
                      value={room.width}
                      onChange={e => setRoom(r => ({...r, width: +e.target.value || r.width}))}
                      onBlur={e => setRoom(r => ({...r, width: Math.max(500, +e.target.value || r.width)}))}
                      onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Длина</label>
                    <input type="number" step="100" className="w-full border rounded px-2 py-1 text-sm mt-0.5"
                      value={room.height}
                      onChange={e => setRoom(r => ({...r, height: +e.target.value || r.height}))}
                      onBlur={e => setRoom(r => ({...r, height: Math.max(500, +e.target.value || r.height)}))}
                      onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }} />
                  </div>
                </div>
              </div>

              {/* Цвет стен */}
              {([['wallColor','Стены', WALL_COLORS], ['floorColor','Пол', FLOOR_COLORS], ['ceilingColor','Потолок', CEIL_COLORS]] as const).map(([key, label, palette]) => (
                <div key={key}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">{label}</h4>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {palette.map(c => (
                      <button key={c} onClick={() => setRoom(r => ({...r, [key]: c}))}
                        className={`w-6 h-6 rounded border-2 transition-transform ${room[key]===c ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
                        style={{background: c}} />
                    ))}
                  </div>
                  {/* Ручной ввод цвета */}
                  <div className="flex items-center gap-2">
                    <input type="color" value={room[key]}
                      onChange={e => setRoom(r => ({...r, [key]: e.target.value}))}
                      className="w-7 h-7 rounded cursor-pointer border border-gray-200 p-0.5" />
                    <input className="border rounded px-2 py-1 text-xs font-mono w-24"
                      value={room[key]}
                      onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setRoom(r => ({...r, [key]: e.target.value})); }} />
                    <span className="text-xs text-gray-400">свой цвет</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ниши */}
          {sideTab === 'niches' && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-700">Ниши и выступы</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Выступ вдаётся В комнату со стены</p>
                </div>
                <button onClick={addNiche} className="text-xs bg-blue-600 text-white px-2 py-1.5 rounded hover:bg-blue-700">+ Добавить</button>
              </div>
              {niches.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs">
                  <div className="text-2xl mb-2">🔲</div>
                  <p>Нет ниш. Нажмите «+ Добавить»</p>
                </div>
              )}
              <div className="space-y-3">
                {niches.map(n => (
                  <div key={n.id} className="border rounded-lg p-3 bg-gray-50 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <input className="font-medium text-gray-700 bg-transparent border-b border-dashed w-28 text-xs focus:outline-none"
                        value={n.name} onChange={e => updateNiche(n.id, {name: e.target.value})} />
                      <button onClick={() => setNiches(p => p.filter(x => x.id !== n.id))} className="text-red-400">✕</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-gray-400">Стена</label>
                        <select className="w-full border rounded px-1 py-1 text-xs bg-white mt-0.5"
                          value={n.wall} onChange={e => updateNiche(n.id, {wall: e.target.value as 'top'|'bottom'|'left'|'right'})}>
                          <option value="top">Верхняя</option>
                          <option value="bottom">Нижняя</option>
                          <option value="left">Левая</option>
                          <option value="right">Правая</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400">Глубина мм</label>
                        <input type="number" step="50" className="w-full border rounded px-1 py-1 text-xs bg-white mt-0.5"
                          value={n.depth} onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }} onChange={e => updateNiche(n.id, {depth: +e.target.value})} />
                      </div>
                      <div>
                        <label className="text-gray-400">Отступ мм</label>
                        <input type="number" step="100" className="w-full border rounded px-1 py-1 text-xs bg-white mt-0.5"
                          value={n.pos} onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }} onChange={e => updateNiche(n.id, {pos: +e.target.value})} />
                      </div>
                      <div>
                        <label className="text-gray-400">Ширина мм</label>
                        <input type="number" step="100" className="w-full border rounded px-1 py-1 text-xs bg-white mt-0.5"
                          value={n.size} onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }} onChange={e => updateNiche(n.id, {size: +e.target.value})} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Проёмы */}
          {sideTab === 'openings' && (
            <div className="p-3 space-y-4">
              {[
                { label:'Двери', icon:'🚪', list:doors, add:addDoor,
                  set:(fn:(d:Door[])=>Door[])=>setDoors(fn),
                  items:doors },
                { label:'Окна', icon:'🪟', list:windows, add:addWindow,
                  set:(fn:(w:Window[])=>Window[])=>setWindows(fn),
                  items:windows },
              ].map(({label, icon, list, add, set}) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">{icon} {label}</h4>
                    <button onClick={add} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">+ Добавить</button>
                  </div>
                  {list.map((d: Door | Window) => (
                    <div key={d.id} className="border rounded-lg p-2 mb-2 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-700">{icon}</span>
                        <button onClick={() => set((p: any[]) => p.filter((x:any) => x.id !== d.id))} className="text-red-400">✕</button>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <label className="text-gray-400">Стена</label>
                          <select className="w-full border rounded px-1 py-0.5 text-xs mt-0.5"
                            value={d.wall} onChange={e => set((p: any[]) => p.map((x:any) => x.id===d.id ? {...x, wall: e.target.value} : x))}>
                            <option value="top">Верхняя</option>
                            <option value="bottom">Нижняя</option>
                            <option value="left">Левая</option>
                            <option value="right">Правая</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-gray-400">Ширина мм</label>
                          <input type="number" className="w-full border rounded px-1 py-0.5 text-xs mt-0.5"
                            value={d.size}
                            onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
                            onChange={e => set((p: any[]) => p.map((x:any) => x.id===d.id ? {...x, size: +e.target.value} : x))} />
                        </div>
                        <div>
                          <label className="text-gray-400">От угла</label>
                          <select className="w-full border rounded px-1 py-0.5 text-xs mt-0.5"
                            value={d.fromEnd ? 'end' : 'start'}
                            onChange={e => set((p: any[]) => p.map((x:any) => x.id===d.id ? {...x, fromEnd: e.target.value==='end'} : x))}>
                            {(d.wall==='top'||d.wall==='bottom')
                              ? <><option value="start">Левого</option><option value="end">Правого</option></>
                              : <><option value="start">Верхнего</option><option value="end">Нижнего</option></>
                            }
                          </select>
                        </div>
                        <div>
                          <label className="text-gray-400">Отступ мм</label>
                          <input type="number" step="100" className="w-full border rounded px-1 py-0.5 text-xs mt-0.5"
                            value={d.pos}
                            onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
                            onChange={e => set((p: any[]) => p.map((x:any) => x.id===d.id ? {...x, pos: +e.target.value} : x))} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {list.length === 0 && <p className="text-gray-400 text-xs text-center py-2">Нет {label.toLowerCase()}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Панель выбранного предмета */}
        {selectedItem && (
          <div className="border-t p-3 bg-blue-50 flex-shrink-0">
            <div className="text-xs font-semibold text-blue-800 mb-1.5 truncate">{selectedItem.name}</div>
            {/* Размеры модуля */}
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div>
                <label className="text-xs text-gray-400">Ш (мм)</label>
                <input type="number" step="100" min="100" max="5000"
                  value={selectedItem.w}
                  onChange={e => setItems(p => p.map(i => i.id === selected ? { ...i, w: +e.target.value || i.w } : i))}
                  onBlur={e => setItems(p => p.map(i => i.id === selected ? { ...i, w: Math.max(100, +e.target.value || i.w) } : i))}
                  onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
                  className="w-full border rounded px-1.5 py-0.5 text-xs text-center font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Г (мм)</label>
                <input type="number" step="100" min="100" max="5000"
                  value={selectedItem.h}
                  onChange={e => setItems(p => p.map(i => i.id === selected ? { ...i, h: +e.target.value || i.h } : i))}
                  onBlur={e => setItems(p => p.map(i => i.id === selected ? { ...i, h: Math.max(100, +e.target.value || i.h) } : i))}
                  onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
                  className="w-full border rounded px-1.5 py-0.5 text-xs text-center font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white" />
              </div>
            </div>
            <div className="flex gap-1.5 mb-3">
              <button onClick={rotateSelected} className="flex-1 bg-white border text-gray-600 text-xs py-1.5 rounded hover:bg-gray-50">↺ Повернуть</button>
              <button onClick={removeSelected} className="flex-1 bg-red-50 border border-red-200 text-red-600 text-xs py-1.5 rounded hover:bg-red-100">✕ Удалить</button>
            </div>
            {/* Цвет 2D */}
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Цвет в плане</div>
              <div className="flex flex-wrap gap-1">
                {['#c8d6e5','#74b9ff','#a29bfe','#55efc4','#00b894','#ffeaa7','#fdcb6e','#e17055','#fd79a8','#636e72','#2d3436','#ffffff','#dfe6e9','#b2bec3'].map(c => (
                  <button key={c}
                    onClick={() => setItems(p => p.map(i => i.id===selected ? {...i,color:c} : i))}
                    className={`w-5 h-5 rounded border-2 ${selectedItem.color===c ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                    style={{background:c}} />
                ))}
                <input type="color" value={selectedItem.color}
                  onChange={e => setItems(p => p.map(i => i.id===selected ? {...i,color:e.target.value} : i))}
                  className="w-5 h-5 rounded cursor-pointer border border-gray-200 p-0" title="Свой цвет" />
              </div>
            </div>
            {/* Фасад 3D */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Фасад (3D)</div>
              <div className="grid grid-cols-3 gap-1">
                {FACADE_OPTIONS.map(f => (
                  <button key={f.id}
                    onClick={() => setItems(p => p.map(i => i.id===selected ? {...i,facadeStyle:f.id} : i))}
                    title={f.description}
                    className={`text-xs py-1 px-1 rounded border leading-tight ${selectedItem.facadeStyle===f.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    {f.icon} {f.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Рабочая область ─────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* Тулбар */}
        <div className="bg-white border-b px-3 py-1.5 flex items-center gap-2 flex-wrap flex-shrink-0">
          {/* Размеры комнаты */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-400">Комната:</span>
            <input type="number" step="100" min="500" max="20000"
              value={room.width}
              onChange={e => setRoom(r => ({...r, width: +e.target.value || r.width}))}
              onBlur={e => setRoom(r => ({...r, width: Math.max(500, +e.target.value || r.width)}))}
              onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
              className="w-20 border rounded px-1.5 py-0.5 text-xs text-center font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
              title="Ширина комнаты (мм)" />
            <span className="text-gray-400">×</span>
            <input type="number" step="100" min="500" max="20000"
              value={room.height}
              onChange={e => setRoom(r => ({...r, height: +e.target.value || r.height}))}
              onBlur={e => setRoom(r => ({...r, height: Math.max(500, +e.target.value || r.height)}))}
              onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
              className="w-20 border rounded px-1.5 py-0.5 text-xs text-center font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
              title="Длина комнаты (мм)" />
            <span className="text-gray-400 mr-2">мм</span>
          </div>

          {/* Статистика */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mr-2">
            <span title="Площадь комнаты">📐 {roomAreaM2.toFixed(1)} м²</span>
            <span title="Занято мебелью" className={occupancyPct > 60 ? 'text-orange-500 font-medium' : ''}>
              🛋️ {furnitureAreaM2.toFixed(1)} м² ({occupancyPct}%)
            </span>
            <span title="Свободная площадь" className={freeAreaM2 < 3 ? 'text-red-500' : 'text-green-600'}>
              ✅ {freeAreaM2.toFixed(1)} м² свободно
            </span>
          </div>

          <div className="flex-1" />

          {/* Рулетка */}
          {view === '2d' && (
            <button onClick={() => measureMode ? resetMeasure() : setMeasureMode(true)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${measureMode ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-500'}`}>
              📏 {measureMode ? (measureA ? 'Кликни точку B' : 'Кликни точку A') : 'Рулетка'}
            </button>
          )}
          {view === '2d' && measureMode && (
            <button onClick={resetMeasure} className="text-xs px-2 py-1.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
              ✕ Сбросить
            </button>
          )}

          {/* Сохранить дизайн */}
          {onSaveDesign && (
            <button onClick={() => onSaveDesign({ room, items, doors, windows, niches })}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium">
              💾 Сохранить
            </button>
          )}

          {/* Отправить в раскройку */}
          {onSendToCutting && (
            <button onClick={handleSendToCutting}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium">
              📐 В раскройку
            </button>
          )}

          {/* 2D / 3D */}
          <div className="flex rounded-lg border bg-white overflow-hidden">
            <button onClick={() => setView('2d')}
              className={`px-3 py-1.5 text-xs font-medium ${view==='2d' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              📐 2D
            </button>
            <button onClick={() => setView('3d')}
              className={`px-3 py-1.5 text-xs font-medium ${view==='3d' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              🧊 3D
            </button>
          </div>
        </div>

        {/* 3D */}
        {view === '3d' && (
          <div className="flex-1 relative">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full bg-gray-900 text-white text-sm">
                <div className="text-center"><div className="text-3xl mb-3 animate-pulse">🧊</div><div>Загрузка 3D...</div></div>
              </div>
            }>
              <Room3D room={room} items={items} doors={doors} windows={windows} niches={niches} />
            </Suspense>
          </div>
        )}

        {/* 2D */}
        {view === '2d' && (
          <div className="flex-1 overflow-auto p-4" style={{ cursor: measureMode ? 'crosshair' : 'default' }}>
            <svg
              ref={canvasRef}
              width={RW + PAD * 2 + 20}
              height={RH + PAD * 2 + 20}
              onMouseMove={onSvgMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={() => { onMouseUp(); setHoverPos(null); }}
              onClick={onSvgClick}
              style={{ userSelect: 'none' }}
            >
              <defs>
                <clipPath id="roomClip">
                  <path d={roomPath} transform={`translate(${PAD},${PAD})`} />
                </clipPath>
              </defs>

              {/* Пол */}
              <path d={roomPath} transform={`translate(${PAD},${PAD})`} fill={room.floorColor} />

              {/* Сетка */}
              <g clipPath="url(#roomClip)" transform={`translate(${PAD},${PAD})`}>{gridLines}</g>

              {/* Стены */}
              <path d={roomPath} transform={`translate(${PAD},${PAD})`}
                fill="none" stroke={room.wallColor} strokeWidth="14" strokeLinejoin="round" />

              {/* Ниши — подписи */}
              {niches.map(n => {
                let tx=0,ty=0;
                if (n.wall==='top')    { tx=PAD+(n.pos+n.size/2)*SCALE; ty=PAD+n.depth*SCALE/2; }
                if (n.wall==='bottom') { tx=PAD+(n.pos+n.size/2)*SCALE; ty=PAD+RH-n.depth*SCALE/2; }
                if (n.wall==='left')   { tx=PAD+n.depth*SCALE/2; ty=PAD+(n.pos+n.size/2)*SCALE; }
                if (n.wall==='right')  { tx=PAD+RW-n.depth*SCALE/2; ty=PAD+(n.pos+n.size/2)*SCALE; }
                return <text key={n.id} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fill="#6b7280" fontStyle="italic">{n.name}</text>;
              })}

              {/* Двери */}
              {doors.map(d => {
                const isH = d.wall==='top'||d.wall==='bottom';
                const wallLen = isH ? room.width : room.height;
                const rawPos = d.fromEnd ? wallLen - d.pos - d.size : d.pos;
                const s=rawPos*SCALE; const sz=d.size*SCALE; const W8=14;
                let x1=0,y1=0,x2=0,y2=0;
                if (d.wall==='top')    { x1=PAD+s; y1=PAD-W8/2; x2=PAD+s+sz; y2=PAD+W8/2; }
                if (d.wall==='bottom') { x1=PAD+s; y1=PAD+RH-W8/2; x2=PAD+s+sz; y2=PAD+RH+W8/2; }
                if (d.wall==='left')   { x1=PAD-W8/2; y1=PAD+s; x2=PAD+W8/2; y2=PAD+s+sz; }
                if (d.wall==='right')  { x1=PAD+RW-W8/2; y1=PAD+s; x2=PAD+RW+W8/2; y2=PAD+s+sz; }
                return <rect key={d.id} x={x1} y={y1} width={Math.abs(x2-x1)||W8} height={Math.abs(y2-y1)||W8}
                  fill={room.floorColor} stroke="#92400e" strokeWidth="1.5" strokeDasharray="4,2" />;
              })}

              {/* Окна */}
              {windows.map(w => {
                const isH = w.wall==='top'||w.wall==='bottom';
                const wallLen = isH ? room.width : room.height;
                const rawPos = w.fromEnd ? wallLen - w.pos - w.size : w.pos;
                const s=rawPos*SCALE; const sz=w.size*SCALE; const W8=14;
                let x1=0,y1=0,x2=0,y2=0;
                if (w.wall==='top')    { x1=PAD+s; y1=PAD-W8/2; x2=PAD+s+sz; y2=PAD+W8/2; }
                if (w.wall==='bottom') { x1=PAD+s; y1=PAD+RH-W8/2; x2=PAD+s+sz; y2=PAD+RH+W8/2; }
                if (w.wall==='left')   { x1=PAD-W8/2; y1=PAD+s; x2=PAD+W8/2; y2=PAD+s+sz; }
                if (w.wall==='right')  { x1=PAD+RW-W8/2; y1=PAD+s; x2=PAD+RW+W8/2; y2=PAD+s+sz; }
                return <rect key={w.id} x={x1} y={y1} width={Math.abs(x2-x1)||W8} height={Math.abs(y2-y1)||W8}
                  fill="#bae6fd" stroke="#0369a1" strokeWidth="2" />;
              })}

              {/* Размеры комнаты */}
              <text x={PAD+RW/2} y={PAD-12} textAnchor="middle" fontSize="11" fill="#6b7280">{room.width/1000} м</text>
              <text x={PAD+RW+12} y={PAD+RH/2} textAnchor="middle" fontSize="11" fill="#6b7280"
                transform={`rotate(-90,${PAD+RW+12},${PAD+RH/2})`}>{room.height/1000} м</text>

              {/* Мебель */}
              <g transform={`translate(${PAD},${PAD})`}>
                {items.map(item => {
                  const x=item.x*SCALE; const y=item.y*SCALE; const w=item.w*SCALE; const h=item.h*SCALE;
                  const isSel = item.id===selected;
                  return (
                    <g key={item.id} style={{cursor: measureMode ? 'crosshair' : 'grab'}}
                      onMouseDown={e => onMouseDown(e, item.id)}
                      onClick={e => { if (!measureMode) { e.stopPropagation(); setSelected(item.id); }}}>
                      {item.shape==='circle'
                        ? <ellipse cx={x+w/2} cy={y+h/2} rx={w/2} ry={h/2}
                            fill={item.color} stroke={isSel ? '#2563eb' : '#9ca3af'} strokeWidth={isSel?2:1} />
                        : <rect x={x} y={y} width={w} height={h} rx="2"
                            fill={item.color} stroke={isSel ? '#2563eb' : '#9ca3af'} strokeWidth={isSel?2:1} />
                      }
                      {isSel && <rect x={x-2} y={y-2} width={w+4} height={h+4} fill="none"
                        stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,2" rx="3" />}
                      {w>25 && h>18 && (
                        <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="middle"
                          fontSize={Math.min(10,w/8,h/3)} fill="#374151" style={{pointerEvents:'none'}}>
                          <tspan x={x+w/2} dy="-3">{item.name}</tspan>
                          <tspan x={x+w/2} dy="12" fontSize={Math.min(8,w/10)}>{item.w/10}×{item.h/10}см</tspan>
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Умные размеры — расстояния до стен */}
              {selectedItem && !measureMode && wallDists && (
                <g transform={`translate(${PAD},${PAD})`} opacity="0.7">
                  {/* До верхней стены */}
                  {wallDists.top > 0 && (() => {
                    const cx = (selectedItem.x + selectedItem.w/2)*SCALE;
                    const y1 = 0; const y2 = selectedItem.y*SCALE;
                    const my = (y1+y2)/2;
                    return <>
                      <line x1={cx} y1={y1} x2={cx} y2={y2} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,2"/>
                      <rect x={cx-18} y={my-7} width={36} height={14} fill="white" rx="2" opacity="0.9"/>
                      <text x={cx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#3b82f6">{wallDists.top}мм</text>
                    </>;
                  })()}
                  {/* До нижней стены */}
                  {wallDists.bottom > 0 && (() => {
                    const cx = (selectedItem.x + selectedItem.w/2)*SCALE;
                    const y1 = (selectedItem.y+selectedItem.h)*SCALE; const y2 = RH;
                    const my = (y1+y2)/2;
                    return <>
                      <line x1={cx} y1={y1} x2={cx} y2={y2} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,2"/>
                      <rect x={cx-18} y={my-7} width={36} height={14} fill="white" rx="2" opacity="0.9"/>
                      <text x={cx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#3b82f6">{wallDists.bottom}мм</text>
                    </>;
                  })()}
                  {/* До левой стены */}
                  {wallDists.left > 0 && (() => {
                    const cy = (selectedItem.y + selectedItem.h/2)*SCALE;
                    const x1 = 0; const x2 = selectedItem.x*SCALE;
                    const mx = (x1+x2)/2;
                    return <>
                      <line x1={x1} y1={cy} x2={x2} y2={cy} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,2"/>
                      <rect x={mx-18} y={cy-7} width={36} height={14} fill="white" rx="2" opacity="0.9"/>
                      <text x={mx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#3b82f6">{wallDists.left}мм</text>
                    </>;
                  })()}
                  {/* До правой стены */}
                  {wallDists.right > 0 && (() => {
                    const cy = (selectedItem.y + selectedItem.h/2)*SCALE;
                    const x1 = (selectedItem.x+selectedItem.w)*SCALE; const x2 = RW;
                    const mx = (x1+x2)/2;
                    return <>
                      <line x1={x1} y1={cy} x2={x2} y2={cy} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,2"/>
                      <rect x={mx-18} y={cy-7} width={36} height={14} fill="white" rx="2" opacity="0.9"/>
                      <text x={mx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#3b82f6">{wallDists.right}мм</text>
                    </>;
                  })()}
                </g>
              )}

              {/* Рулетка */}
              {measureMode && measureA && (
                <g>
                  <circle cx={PAD+measureA.x*SCALE} cy={PAD+measureA.y*SCALE} r={5} fill="#f97316" />
                  {(measureB || hoverPos) && (() => {
                    const end = measureB || hoverPos!;
                    const dx = end.x - measureA.x;
                    const dy = end.y - measureA.y;
                    const dist = Math.round(Math.sqrt(dx*dx + dy*dy));
                    const ax=PAD+measureA.x*SCALE; const ay=PAD+measureA.y*SCALE;
                    const ex=PAD+end.x*SCALE; const ey=PAD+end.y*SCALE;
                    const mx=(ax+ex)/2; const my=(ay+ey)/2;
                    return <>
                      <line x1={ax} y1={ay} x2={ex} y2={ey}
                        stroke="#f97316" strokeWidth="2" strokeDasharray={measureB ? undefined : '6,3'} />
                      <circle cx={ex} cy={ey} r={measureB?5:3} fill={measureB?'#f97316':'#fed7aa'} />
                      <rect x={mx-28} y={my-10} width={56} height={20} fill="white" rx="4" opacity="0.95"
                        stroke="#f97316" strokeWidth="1" />
                      <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle"
                        fontSize="11" fill="#f97316" fontWeight="bold">{dist} мм</text>
                    </>;
                  })()}
                </g>
              )}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
