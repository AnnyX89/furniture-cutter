import { useState, useEffect } from 'react';
import type { Project, TabId } from './types';
import { v4 as uuid } from 'uuid';
import { supabase } from './utils/supabase';
import { dbLoadProjects, dbSaveProject, dbDeleteProject } from './utils/db';
import type { User } from '@supabase/supabase-js';
import AuthPage from './components/AuthPage';
import MaterialsTab from './components/MaterialsTab';
import PartsTab from './components/PartsTab';
import CuttingTab from './components/CuttingTab';
import ReportsTab from './components/ReportsTab';
import HelpPage from './components/HelpPage';
import DesignerTab from './components/designer/DesignerTab';
import WhereToBuyTab from './components/WhereToBuyTab';
import HardwareTab from './components/HardwareTab';

function newProject(name: string): Project {
  return {
    id: uuid(),
    name,
    kerf: 3,
    materials: [],
    parts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'materials', label: '📦 Материалы' },
  { id: 'parts', label: '📋 Детали' },
  { id: 'cutting', label: '📐 Раскройка' },
  { id: 'reports', label: '📊 Отчёты' },
  { id: 'designer', label: '🏠 Дизайн комнаты' },
  { id: 'hardware', label: '🔩 Фурнитура и кант' },
  { id: 'buy', label: '🛒 Где купить' },
  { id: 'help', label: '❓ Справка' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [current, setCurrent] = useState<Project | null>(null);
  const [tab, setTab] = useState<TabId>('materials');
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes('error=')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setProjects([]); return; }
    dbLoadProjects().then(setProjects).catch(console.error);
  }, [user]);

  async function createProject() {
    const name = newName.trim();
    if (!name) return alert('Введите название проекта');
    const p = newProject(name);
    await dbSaveProject(p);
    const updated = await dbLoadProjects();
    setProjects(updated);
    setCurrent(p);
    setTab('materials');
    setShowNew(false);
    setNewName('');
  }

  function openProject(p: Project) {
    setCurrent({ ...p });
    setTab('materials');
  }

  async function removeProject(id: string) {
    if (!confirm('Удалить проект?')) return;
    await dbDeleteProject(id);
    setProjects(await dbLoadProjects());
    if (current?.id === id) setCurrent(null);
  }

  async function handleProjectChange(p: Project) {
    setCurrent(p);
    await dbSaveProject(p);
    setProjects(await dbLoadProjects());
  }

  async function signOut() {
    await supabase.auth.signOut();
    setCurrent(null);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Загрузка...</div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (!current) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🪵 Раскройка мебели</h1>
            <p className="text-xs text-gray-500">Оптимизация раскроя листового материала</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{user.email}</span>
            <button onClick={signOut} className="text-xs text-gray-500 border rounded px-3 py-1.5 hover:bg-gray-50">Выйти</button>
            <button onClick={() => setShowNew(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              + Новый проект
            </button>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-6 py-8">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🪵</div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Нет проектов</h2>
              <p className="text-gray-500 text-sm mb-6">Создайте первый проект чтобы начать</p>
              <button onClick={() => setShowNew(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Создать проект
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.map(p => (
                <div key={p.id} className="bg-white border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="font-medium text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {p.materials.length} материалов · {p.parts.length} деталей · изменён {new Date(p.updatedAt).toLocaleDateString('ru')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openProject(p)} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                      Открыть
                    </button>
                    <button onClick={() => removeProject(p.id)} className="border text-gray-500 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showNew && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Новый проект</h3>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
                placeholder="Название проекта (напр. Кухня)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createProject()}
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={createProject} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">Создать</button>
                <button onClick={() => { setShowNew(false); setNewName(''); }} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Отмена</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrent(null)} className="text-gray-400 hover:text-gray-700 text-sm">← Проекты</button>
          <span className="text-gray-300">|</span>
          <h1 className="font-semibold text-gray-900">{current.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400">Сохраняется автоматически</div>
          <button onClick={signOut} className="text-xs text-gray-500 border rounded px-3 py-1.5 hover:bg-gray-50">Выйти</button>
        </div>
      </header>

      <nav className="bg-white border-b px-6 no-print overflow-x-auto">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'materials' && <MaterialsTab project={current} onChange={handleProjectChange} />}
        {tab === 'parts' && <PartsTab project={current} onChange={handleProjectChange} />}
        {tab === 'cutting' && <CuttingTab project={current} />}
        {tab === 'reports' && <ReportsTab project={current} />}
        {tab === 'designer' && (
          <DesignerTab
            project={current}
            firstMaterialId={current.materials[0]?.id ?? ''}
            onSaveDesign={design => {
              handleProjectChange({ ...current, design, updatedAt: new Date().toISOString() });
            }}
            onSendToCutting={parts => {
              const updated = { ...current, parts: [...current.parts, ...parts], updatedAt: new Date().toISOString() };
              handleProjectChange(updated);
              setTab('parts');
            }}
          />
        )}
        {tab === 'hardware' && <HardwareTab project={current} onChange={handleProjectChange} />}
        {tab === 'buy' && <WhereToBuyTab />}
        {tab === 'help' && <HelpPage />}
      </main>
    </div>
  );
}
