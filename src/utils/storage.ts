import type { Project } from '../types';

const KEY = 'furniture_projects';

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(KEY, JSON.stringify(projects));
}

export function saveProject(project: Project): void {
  const all = loadProjects();
  const idx = all.findIndex(p => p.id === project.id);
  const updated = { ...project, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = updated;
  else all.push(updated);
  saveProjects(all);
}

export function deleteProject(id: string): void {
  saveProjects(loadProjects().filter(p => p.id !== id));
}
