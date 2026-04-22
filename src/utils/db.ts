import { supabase } from './supabase';
import type { Project } from '../types';

export async function dbLoadProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    kerf: row.kerf,
    materials: row.materials,
    parts: row.parts,
    design: row.design ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function dbSaveProject(p: Project): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('projects').upsert({
    id: p.id,
    user_id: user.id,
    name: p.name,
    kerf: p.kerf,
    materials: p.materials,
    parts: p.parts,
    design: p.design ?? null,
    created_at: p.createdAt,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function dbDeleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}
