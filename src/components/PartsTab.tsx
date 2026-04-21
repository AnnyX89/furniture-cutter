import { useState } from 'react';
import type { Part, Project, EdgeBanding } from '../types';
import { v4 as uuid } from 'uuid';

const DEFAULT_EDGE: EdgeBanding = { top: false, bottom: false, left: false, right: false };

interface Props {
  project: Project;
  onChange: (p: Project) => void;
}

function newPart(matId: string): Part {
  return {
    id: uuid(),
    name: '',
    width: 600,
    height: 400,
    quantity: 1,
    materialId: matId,
    canRotate: true,
    edgeBanding: { ...DEFAULT_EDGE },
  };
}

export default function PartsTab({ project, onChange }: Props) {
  const [editing, setEditing] = useState<Part | null>(null);
  const [isNew, setIsNew] = useState(false);

  const matMap = new Map(project.materials.map(m => [m.id, m]));
  const defaultMatId = project.materials[0]?.id ?? '';

  function openNew() {
    setEditing(newPart(defaultMatId));
    setIsNew(true);
  }

  function openEdit(p: Part) {
    setEditing({ ...p, edgeBanding: { ...p.edgeBanding } });
    setIsNew(false);
  }

  function save() {
    if (!editing || !editing.name.trim()) return alert('Введите название детали');
    if (!editing.materialId) return alert('Выберите материал');
    const parts = isNew
      ? [...project.parts, editing]
      : project.parts.map(p => p.id === editing.id ? editing : p);
    onChange({ ...project, parts });
    setEditing(null);
  }

  function remove(id: string) {
    if (!confirm('Удалить деталь?')) return;
    onChange({ ...project, parts: project.parts.filter(p => p.id !== id) });
  }

  function duplicate(p: Part) {
    onChange({ ...project, parts: [...project.parts, { ...p, id: uuid(), name: p.name + ' (копия)' }] });
  }

  const totalPieces = project.parts.reduce((s, p) => s + p.quantity, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Детали</h2>
          <p className="text-sm text-gray-500">{project.parts.length} позиций · {totalPieces} шт. итого</p>
        </div>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700" disabled={!defaultMatId}>
          + Добавить деталь
        </button>
      </div>

      {project.materials.length === 0 && (
        <p className="text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
          Сначала добавьте материалы на вкладке «Материалы»
        </p>
      )}

      {project.parts.length === 0 && project.materials.length > 0 && (
        <p className="text-gray-500 text-sm py-8 text-center">Нет деталей. Добавьте детали для раскройки.</p>
      )}

      <div className="overflow-x-auto">
        {project.parts.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500 text-left">
                <th className="pb-2 pr-3 font-medium">Название</th>
                <th className="pb-2 pr-3 font-medium">Ш × В (мм)</th>
                <th className="pb-2 pr-3 font-medium">Кол.</th>
                <th className="pb-2 pr-3 font-medium">Материал</th>
                <th className="pb-2 pr-3 font-medium">Кромка</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {project.parts.map(p => {
                const mat = matMap.get(p.materialId);
                const edgeCount = Object.values(p.edgeBanding).filter(Boolean).length;
                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-3 font-medium text-gray-800">{p.name}</td>
                    <td className="py-2 pr-3 text-gray-600">{p.width} × {p.height}</td>
                    <td className="py-2 pr-3 text-gray-600">{p.quantity} шт.</td>
                    <td className="py-2 pr-3">
                      {mat ? (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ background: mat.color }} />
                          {mat.name}
                        </span>
                      ) : <span className="text-red-500">—</span>}
                    </td>
                    <td className="py-2 pr-3 text-gray-500">
                      {edgeCount > 0 ? `${edgeCount} стороны` : '—'}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline">Изм.</button>
                        <button onClick={() => duplicate(p)} className="text-gray-500 hover:underline">Копия</button>
                        <button onClick={() => remove(p.id)} className="text-red-500 hover:underline">Удал.</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-gray-800 mb-4">{isNew ? 'Новая деталь' : 'Изменить деталь'}</h3>
            <div className="grid gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Название детали</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editing.name} placeholder="Например: Боковая стенка левая"
                  onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Ширина (мм)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editing.width}
                    onChange={e => setEditing({ ...editing, width: +e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Высота (мм)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editing.height}
                    onChange={e => setEditing({ ...editing, height: +e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Количество</label>
                  <input type="number" min="1" className="w-full border rounded-lg px-3 py-2 text-sm" value={editing.quantity}
                    onChange={e => setEditing({ ...editing, quantity: Math.max(1, +e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Материал</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={editing.materialId}
                  onChange={e => setEditing({ ...editing, materialId: e.target.value })}>
                  {project.materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Кромкование (выберите стороны)</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['top', 'bottom', 'left', 'right'] as const).map(side => {
                    const labels = { top: 'Верх', bottom: 'Низ', left: 'Лево', right: 'Право' };
                    return (
                      <label key={side} className="flex items-center gap-2 text-sm text-gray-700 border rounded-lg p-2">
                        <input type="checkbox" checked={editing.edgeBanding[side]}
                          onChange={e => setEditing({ ...editing, edgeBanding: { ...editing.edgeBanding, [side]: e.target.checked } })} />
                        {labels[side]}
                      </label>
                    );
                  })}
                </div>
              </div>
              {!matMap.get(editing.materialId)?.hasTexture && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={editing.canRotate}
                    onChange={e => setEditing({ ...editing, canRotate: e.target.checked })} />
                  Разрешить поворот при раскройке
                </label>
              )}
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
