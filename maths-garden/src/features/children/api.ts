import { supabase } from '@/shared/supabase/client';
import type { Child } from './model';

const COLUMNS = 'id, name, birthdate, avatar';

export async function listChildren(): Promise<Child[]> {
  const { data, error } = await supabase.from('children').select(COLUMNS).order('created_at');
  if (error) throw error;
  return data;
}

export async function createChild(input: Omit<Child, 'id'>): Promise<Child> {
  const { data, error } = await supabase.from('children').insert(input).select(COLUMNS).single();
  if (error) throw error;
  return data;
}
