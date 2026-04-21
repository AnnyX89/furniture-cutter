import { useState } from 'react';
import type { Material, Project } from '../types';
import { v4 as uuid } from 'uuid';

const COLORS = ['#4ade80', '#60a5fa', '#f97316', '#a78bfa', '#f472b6', '#facc15', '#2dd4bf', '#fb923c'];

const DEFAULT_MAT: Omit<Material, 'id'> = {
  name: 'ДСП 16мм белый',
  sheetWidth: 2750,
  sheetHeight: 1830,
  thickness: 16,
  price: 2000,
  color: '#60a5fa',
  hasTexture: true,
};

interface Props {
  project: Project;
  onChange: (p: Project) => void;
}

export default function MaterialsTab({ project, onChange }: Props) {
  const [editing, setEditing] = useState<Material | null>(null);
  const [isNew, setIsNew] = useState(false);

  function openNew() {
    setEditing({ id: uuid(), ...DEFAULT_MAT });
    setIsNew(true);
  }

  function openEdit(m: Material) {
    setEditing({ ...m });
    setIsNew(false);
  }

  function save() {
    if (!editing) return;
    const mats = isNew
      ? [...project.materials, editing]
      : project.materials.map(m => m.id === editing.id ? editing : m);
    onChange({ ...project, materials: mats });
    setEditing(null);
  }

  function remove(id: string) {
    if (!confirm('Удалить материал?')) return;
    onChange({ ...project, materials: project.materials.filter(m => m.id !== id) });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Материалы</h2>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + Добавить
        </button>
      </div>

      {project.materials.length === 0 && (
        <p className="text-gray-500 text-sm py-8 text-center">Нет материалов. Добавьте хотя бы один лист.</p>
      )}

      <div className="grid gap-3">
        {project.materials.map(m => (
          <div key={m.id} className="border rounded-lg p-4 flex items-center gap-4 bg-white">
            <div className="w-8 h-8 rounded-full flex-shrink-0 border border-gray-200" style={{ background: m.color }} />
            <div className="flex-1">
              <div className="font-medium text-gray-800">{m.name}</div>
              <div className="text-sm text-gray-500">
                {m.sheetWidth} × {m.sheetHeight} мм · толщина {m.thickness} мм · {m.price} ₽/лист
                {m.hasTexture && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1 rounded">текстура</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(m)} className="text-blue-600 text-sm hover:underline">Изменить</button>
              <button onClick={() => remove(m.id)} className="text-red-500 text-sm hover:underline">Удалить</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-800 mb-4">{isNew ? 'Новый материал' : 'Изменить материал'}</h3>
            <div className="grid gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Название</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Ширина листа (мм)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editing.sheetWidth}
                    onChange={e => setEditing({ ...editing, sheetWidth: +e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Высота листа (мм)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editing.sheetHeight}
                    onChange={e => setEditing({ ...editing, sheetHeight: +e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Толщина (мм)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editing.thickness}
                    onChange={e => setEditing({ ...editing, thickness: +e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Цена за лист (₽)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editing.price}
                    onChange={e => setEditing({ ...editing, price: +e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Цвет на схеме</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setEditing({ ...editing, color: c })}
                      className={`w-7 h-7 rounded-full border-2 ${editing.color === c ? 'border-gray-800' : 'border-transparent'}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={editing.hasTexture}
                  onChange={e => setEditing({ ...editing, hasTexture: e.target.checked })} />
                Есть текстура (детали нельзя поворачивать)
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">Сохранить</button>
              <button onClick={() => setEditing(null)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
