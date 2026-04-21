import { useState, useRef, useCallback } from 'react';
import { FURNITURE, CATEGORIES } from './furnitureLibrary';
import type { FurnitureTemplate } from './furnitureLibrary';
import { v4 as uuid } from 'uuid';

interface Room {
  width: number;
  height: number;
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
}

interface Door { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; }
interface Window { id: string; wall: 'top'|'bottom'|'left'|'right'; pos: number; size: number; }

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
  shape?: string;
  icon: string;
}

const SCALE = 0.12; // px per mm
const GRID = 100; // mm

const WALL_COLORS = ['#f5f0eb','#e8e0d5','#d4c5b5','#f0e8d8','#e8f0e8','#d8e8f0','#e8d8f0','#f0d8d8','#ffffff','#f5f5f5','#2d2d2d'];
const FLOOR_COLORS = ['#c8a97e','#a07850','#8b6340','#d4b896','#e8d5b8','#4a3728','#6b4c35','#c2b280','#f5e6c8','#9e7b5a','#2d2019'];
const CEIL_COLORS = ['#ffffff','#f8f8f0','#fffff0','#f0f8f8','#f5f0f5','#e8e8e8'];

function roomToScreen(v: number) { return v * SCALE; }

export default function DesignerTab() {
  const [room, setRoom] = useState<Room>({ width: 4000, height: 5000, wallColor: '#f5f0eb', floorColor: '#c8a97e', ceilingColor: '#ffffff' });
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [windows, setWindows] = useState<Window[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('kitchen');
  const [tab, setTab] = useState<'room'|'furniture'|'openings'>('furniture');
  const [dragging, setDragging] = useState<{id:string; ox:number; oy:number} | null>(null);
  const canvasRef = useRef<SVGSVGElement>(null);

  const RW = roomToScreen(room.width);
  const RH = roomToScreen(room.height);
  const PAD = 60;

  function addFurniture(tpl: FurnitureTemplate) {
    const item: PlacedItem = {
      id: uuid(),
      templateId: tpl.id,
      name: tpl.name,
      x: room.width / 2 - tpl.w / 2,
      y: room.height / 2 - tpl.h / 2,
      w: tpl.w,
      h: tpl.h,
      rotation: 0,
      color: tpl.color,
      shape: tpl.shape,
      icon: tpl.icon,
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
      ? { ...i, rotation: (i.rotation + 90) % 360, w: i.h, h: i.w }
      : i));
  }

  const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelected(id);
    const svg = canvasRef.current!;
    const rect = svg.getBoundingClientRect();
    const item = items.find(i => i.id === id)!;
    const mx = (e.clientX - rect.left - PAD) / SCALE;
    const my = (e.clientY - rect.top - PAD) / SCALE;
    setDragging({ id, ox: mx - item.x, oy: my - item.y });
  }, [items]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const svg = canvasRef.current!;
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left - PAD) / SCALE;
    const my = (e.clientY - rect.top - PAD) / SCALE;
    const item = items.find(i => i.id === dragging.id)!;
    // Snap to grid
    const snap = GRID;
    let nx = Math.round((mx - dragging.ox) / snap) * snap;
    let ny = Math.round((my - dragging.oy) / snap) * snap;
    // Clamp to room
    nx = Math.max(0, Math.min(room.width - item.w, nx));
    ny = Math.max(0, Math.min(room.height - item.h, ny));
    setItems(prev => prev.map(i => i.id === dragging.id ? { ...i, x: nx, y: ny } : i));
  }, [dragging, items, room]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  function addDoor() {
    setDoors(prev => [...prev, { id: uuid(), wall: 'bottom', pos: 500, size: 900 }]);
  }
  function addWindow() {
    setWindows(prev => [...prev, { id: uuid(), wall: 'top', pos: 800, size: 1200 }]);
  }

  const selectedItem = items.find(i => i.id === selected);

  // Draw grid lines
  const gridLines = [];
  for (let x = 0; x <= room.width; x += GRID) {
    gridLines.push(<line key={`gx${x}`} x1={x*SCALE} y1={0} x2={x*SCALE} y2={RH} stroke="#e5e7eb" strokeWidth="0.5" />);
  }
  for (let y = 0; y <= room.height; y += GRID) {
    gridLines.push(<line key={`gy${y}`} x1={0} y1={y*SCALE} x2={RW} y2={y*SCALE} stroke="#e5e7eb" strokeWidth="0.5" />);
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0 bg-gray-100 rounded-xl overflow-hidden border">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white border-r flex flex-col">
        {/* Sidebar tabs */}
        <div className="flex border-b text-xs">
          {[['furniture','🛋️ Мебель'],['room','🏠 Комната'],['openings','🚪 Проёмы']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={`flex-1 py-2 font-medium transition-colors ${tab===id ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'furniture' && (
            <div>
              {/* Category tabs */}
              <div className="p-2 flex flex-wrap gap-1">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setActiveCategory(c.id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${activeCategory===c.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
              <div className="px-2 pb-2 grid grid-cols-2 gap-1">
                {FURNITURE.filter(f => f.category === activeCategory).map(f => (
                  <button key={f.id} onClick={() => addFurniture(f)}
                    className="text-left p-2 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors text-xs"
                    style={{ borderLeftColor: f.color, borderLeftWidth: 3 }}>
                    <div className="font-medium text-gray-700 leading-tight">{f.name}</div>
                    <div className="text-gray-400 mt-0.5">{f.w}×{f.h} мм</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'room' && (
            <div className="p-3 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Размеры комнаты</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Ширина (мм)</label>
                    <input type="number" step="100" className="w-full border rounded px-2 py-1 text-sm"
                      value={room.width} onChange={e => setRoom(r => ({...r, width: +e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Длина (мм)</label>
                    <input type="number" step="100" className="w-full border rounded px-2 py-1 text-sm"
                      value={room.height} onChange={e => setRoom(r => ({...r, height: +e.target.value}))} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Цвет стен</h4>
                <div className="flex flex-wrap gap-1.5">
                  {WALL_COLORS.map(c => (
                    <button key={c} onClick={() => setRoom(r => ({...r, wallColor: c}))}
                      className={`w-7 h-7 rounded border-2 ${room.wallColor===c ? 'border-blue-500 scale-110' : 'border-gray-200'} transition-transform`}
                      style={{background: c}} />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Цвет пола</h4>
                <div className="flex flex-wrap gap-1.5">
                  {FLOOR_COLORS.map(c => (
                    <button key={c} onClick={() => setRoom(r => ({...r, floorColor: c}))}
                      className={`w-7 h-7 rounded border-2 ${room.floorColor===c ? 'border-blue-500 scale-110' : 'border-gray-200'} transition-transform`}
                      style={{background: c}} />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Цвет потолка</h4>
                <div className="flex flex-wrap gap-1.5">
                  {CEIL_COLORS.map(c => (
                    <button key={c} onClick={() => setRoom(r => ({...r, ceilingColor: c}))}
                      className={`w-7 h-7 rounded border-2 ${room.ceilingColor===c ? 'border-blue-500 scale-110' : 'border-gray-200'} transition-transform`}
                      style={{background: c}} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'openings' && (
            <div className="p-3 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase">Двери</h4>
                  <button onClick={addDoor} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">+ Добавить</button>
                </div>
                {doors.map(d => (
                  <div key={d.id} className="border rounded-lg p-2 mb-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Дверь</span>
                      <button onClick={() => setDoors(prev => prev.filter(x => x.id !== d.id))} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <label className="text-gray-400">Стена</label>
                        <select className="w-full border rounded px-1 py-0.5 text-xs"
                          value={d.wall} onChange={e => setDoors(prev => prev.map(x => x.id===d.id ? {...x, wall: e.target.value as any} : x))}>
                          <option value="top">Верх</option>
                          <option value="bottom">Низ</option>
                          <option value="left">Лево</option>
                          <option value="right">Право</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400">Ширина (мм)</label>
                        <input type="number" className="w-full border rounded px-1 py-0.5 text-xs"
                          value={d.size} onChange={e => setDoors(prev => prev.map(x => x.id===d.id ? {...x, size: +e.target.value} : x))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400">Отступ от угла (мм)</label>
                      <input type="number" step="100" className="w-full border rounded px-1 py-0.5 text-xs"
                        value={d.pos} onChange={e => setDoors(prev => prev.map(x => x.id===d.id ? {...x, pos: +e.target.value} : x))} />
                    </div>
                  </div>
                ))}
                {doors.length === 0 && <p className="text-gray-400 text-xs text-center py-2">Нет дверей</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase">Окна</h4>
                  <button onClick={addWindow} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">+ Добавить</button>
                </div>
                {windows.map(w => (
                  <div key={w.id} className="border rounded-lg p-2 mb-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Окно</span>
                      <button onClick={() => setWindows(prev => prev.filter(x => x.id !== w.id))} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <label className="text-gray-400">Стена</label>
                        <select className="w-full border rounded px-1 py-0.5 text-xs"
                          value={w.wall} onChange={e => setWindows(prev => prev.map(x => x.id===w.id ? {...x, wall: e.target.value as any} : x))}>
                          <option value="top">Верх</option>
                          <option value="bottom">Низ</option>
                          <option value="left">Лево</option>
                          <option value="right">Право</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400">Ширина (мм)</label>
                        <input type="number" className="w-full border rounded px-1 py-0.5 text-xs"
                          value={w.size} onChange={e => setWindows(prev => prev.map(x => x.id===w.id ? {...x, size: +e.target.value} : x))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400">Отступ от угла (мм)</label>
                      <input type="number" step="100" className="w-full border rounded px-1 py-0.5 text-xs"
                        value={w.pos} onChange={e => setWindows(prev => prev.map(x => x.id===w.id ? {...x, pos: +e.target.value} : x))} />
                    </div>
                  </div>
                ))}
                {windows.length === 0 && <p className="text-gray-400 text-xs text-center py-2">Нет окон</p>}
              </div>
            </div>
          )}
        </div>

        {/* Selected item controls */}
        {selectedItem && (
          <div className="border-t p-3 bg-blue-50">
            <div className="text-xs font-semibold text-blue-800 mb-2 truncate">{selectedItem.name}</div>
            <div className="text-xs text-gray-500 mb-2">{selectedItem.w} × {selectedItem.h} мм</div>
            <div className="flex gap-2">
              <button onClick={rotateSelected} className="flex-1 bg-white border text-gray-600 text-xs py-1.5 rounded hover:bg-gray-50">↺ Повернуть</button>
              <button onClick={removeSelected} className="flex-1 bg-red-50 border border-red-200 text-red-600 text-xs py-1.5 rounded hover:bg-red-100">✕ Удалить</button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4">
        <div className="mb-2 flex items-center gap-3 text-xs text-gray-500">
          <span>Комната: {room.width/1000}×{room.height/1000} м</span>
          <span>· Сетка: 10 см</span>
          <span>· Предметов: {items.length}</span>
          <span className="ml-auto">Кликни на предмет чтобы выбрать, потом перетащи</span>
        </div>

        <svg
          ref={canvasRef}
          width={RW + PAD * 2}
          height={RH + PAD * 2}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onClick={() => setSelected(null)}
          className="cursor-default"
          style={{ userSelect: 'none' }}
        >
          {/* Room area with floor color */}
          <rect x={PAD} y={PAD} width={RW} height={RH} fill={room.floorColor} />

          {/* Grid */}
          <g transform={`translate(${PAD},${PAD})`}>
            {gridLines}
          </g>

          {/* Walls */}
          <rect x={PAD} y={PAD} width={RW} height={RH} fill="none" stroke={room.wallColor} strokeWidth="16" />

          {/* Wall dimension labels */}
          <text x={PAD + RW/2} y={PAD - 8} textAnchor="middle" fontSize="11" fill="#6b7280">{room.width/1000} м</text>
          <text x={PAD - 8} y={PAD + RH/2} textAnchor="middle" fontSize="11" fill="#6b7280" transform={`rotate(-90, ${PAD-8}, ${PAD+RH/2})`}>{room.height/1000} м</text>

          {/* Doors */}
          {doors.map(d => {
            const s = d.pos * SCALE;
            const sz = d.size * SCALE;
            const W16 = 16;
            let x1=0,y1=0,x2=0,y2=0;
            if (d.wall==='top')    { x1=PAD+s; y1=PAD-W16/2; x2=PAD+s+sz; y2=PAD+W16/2; }
            if (d.wall==='bottom') { x1=PAD+s; y1=PAD+RH-W16/2; x2=PAD+s+sz; y2=PAD+RH+W16/2; }
            if (d.wall==='left')   { x1=PAD-W16/2; y1=PAD+s; x2=PAD+W16/2; y2=PAD+s+sz; }
            if (d.wall==='right')  { x1=PAD+RW-W16/2; y1=PAD+s; x2=PAD+RW+W16/2; y2=PAD+s+sz; }
            return <rect key={d.id} x={x1} y={y1} width={x2-x1} height={y2-y1} fill={room.floorColor} stroke="#92400e" strokeWidth="1" strokeDasharray="4,2" />;
          })}

          {/* Windows */}
          {windows.map(w => {
            const s = w.pos * SCALE;
            const sz = w.size * SCALE;
            const W16 = 16;
            let x1=0,y1=0,x2=0,y2=0;
            if (w.wall==='top')    { x1=PAD+s; y1=PAD-W16/2; x2=PAD+s+sz; y2=PAD+W16/2; }
            if (w.wall==='bottom') { x1=PAD+s; y1=PAD+RH-W16/2; x2=PAD+s+sz; y2=PAD+RH+W16/2; }
            if (w.wall==='left')   { x1=PAD-W16/2; y1=PAD+s; x2=PAD+W16/2; y2=PAD+s+sz; }
            if (w.wall==='right')  { x1=PAD+RW-W16/2; y1=PAD+s; x2=PAD+RW+W16/2; y2=PAD+s+sz; }
            return <rect key={w.id} x={x1} y={y1} width={x2-x1} height={y2-y1} fill="#bae6fd" stroke="#0369a1" strokeWidth="1.5" />;
          })}

          {/* Furniture */}
          <g transform={`translate(${PAD},${PAD})`}>
            {items.map(item => {
              const x = item.x * SCALE;
              const y = item.y * SCALE;
              const w = item.w * SCALE;
              const h = item.h * SCALE;
              const isSelected = item.id === selected;
              return (
                <g key={item.id}
                  style={{ cursor: 'grab' }}
                  onMouseDown={e => onMouseDown(e, item.id)}
                  onClick={e => { e.stopPropagation(); setSelected(item.id); }}>
                  {item.shape === 'circle'
                    ? <ellipse cx={x+w/2} cy={y+h/2} rx={w/2} ry={h/2}
                        fill={item.color} stroke={isSelected ? '#2563eb' : '#9ca3af'}
                        strokeWidth={isSelected ? 2 : 1} />
                    : <rect x={x} y={y} width={w} height={h} rx="2"
                        fill={item.color} stroke={isSelected ? '#2563eb' : '#9ca3af'}
                        strokeWidth={isSelected ? 2 : 1} />
                  }
                  {isSelected && (
                    <rect x={x-2} y={y-2} width={w+4} height={h+4} fill="none"
                      stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,2" rx="3" />
                  )}
                  {w > 25 && h > 18 && (
                    <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="middle"
                      fontSize={Math.min(10, w/8, h/3)} fill="#374151" style={{pointerEvents:'none'}}>
                      <tspan x={x+w/2} dy="-3">{item.name}</tspan>
                      <tspan x={x+w/2} dy="12" fontSize={Math.min(8, w/10)}>{item.w/10}×{item.h/10}см</tspan>
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Room corner marks */}
          {[[PAD,PAD],[PAD+RW,PAD],[PAD,PAD+RH],[PAD+RW,PAD+RH]].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r={3} fill="#6b7280" />
          ))}
        </svg>
      </div>
    </div>
  );
}
