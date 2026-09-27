import { describe, expect, it } from 'vitest';
import migration from '../../supabase/migrations/0026_household_access.sql?raw';

// The migration is text until deploy-watch applies it, so the test reads it as text: what it
// drops, what it keys the recreated read policies on, and which functions it defines.
const policy = (name: string) => new RegExp(`CREATE POLICY "${name}" ON public\\.watch_entries FOR SELECT TO (\\w+)\\s+USING \\(([^;]+)\\);`);

describe('0026_household_access', () => {
  it('drops the three 0001 write policies on watch_entries and leaves the read one alone', () => {
    for (const verb of ['insert', 'update', 'delete']) {
      expect(migration).toMatch(new RegExp(`DROP POLICY IF EXISTS "Users can ${verb} own entries" ON public\\.watch_entries;`));
      expect(migration).not.toMatch(new RegExp(`CREATE POLICY "Users can ${verb} own entries"`));
    }
    expect(migration).not.toMatch(/"Users can view own entries"/);
  });

  it('recreates both public-profile read policies keyed on the entry\'s profile, not the owning account', () => {
    for (const [name, role] of [['Anon can view entries of public profiles', 'anon'], ['Auth can view entries of public profiles', 'authenticated']]) {
      expect(migration).toMatch(new RegExp(`DROP POLICY IF EXISTS "${name}" ON public\\.watch_entries;`));
      const m = migration.match(policy(name));
      expect(m, name).not.toBeNull();
      expect(m?.[1]).toBe(role);
      expect(m?.[2]).toMatch(/p\.id = watch_entries\.profile_id AND p\.is_public = true/);
      expect(m?.[2]).not.toMatch(/user_id/);
    }
  });

  it('defines claim_profile and join_group as security definer with a fixed search_path', () => {
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.claim_profile\(p_claim_code text\)\s+RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public/);
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.join_group\(p_invite_code text, p_profile_id uuid\)\s+RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public/);
    // The merge path: entries move, duplicates are skipped, agent rows follow, the provisioned row goes.
    expect(migration).toMatch(/UPDATE public\.agent_tokens SET profile_id = mine WHERE profile_id = provisioned_id/);
    expect(migration).toMatch(/UPDATE public\.agent_activity SET profile_id = mine WHERE profile_id = provisioned_id/);
    expect(migration).toMatch(/DELETE FROM public\.profiles WHERE id = provisioned_id/);
    expect(migration).toMatch(/INSERT INTO public\.group_members \(group_id, profile_id\)[^;]+ON CONFLICT \(group_id, profile_id\) DO NOTHING/);
  });
});
