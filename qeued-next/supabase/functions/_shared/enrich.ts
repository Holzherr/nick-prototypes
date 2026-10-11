/**
 * What enrich-title may do to a title row.
 *
 * The endpoint is open to signed-out visitors (title pages are public), so these rules are
 * the only thing between an anon-key caller and a paid model call that rewrites catalogue
 * facts. A catalogued title is complete and never researched, and research only ever fills
 * an empty field — the same rule tools/enrich.mjs follows, so a scraped or hand-edited
 * value survives. No Deno globals here, so vitest can load it directly.
 */

export type EnrichableTitle = {
  enriched?: boolean | null;
  catalogue_version?: number | null;
  synopsis?: string | null;
  imdb_url?: string | null;
  rt_url?: string | null;
  director?: string | null;
  cast_members?: string[] | null;
  runtime_minutes?: number | null;
};

export type Enrichment = {
  imdb_url?: string | null;
  rt_url?: string | null;
  director?: string | null;
  cast_names?: string[] | null;
  runtime_minutes?: number | null;
};

/** Mirrors TitleDetailScreen: research only a record we have not already written. */
export const needsResearch = (title: EnrichableTitle): boolean =>
  !title.enriched && !((title.catalogue_version ?? 0) > 0 && Boolean(title.synopsis));

const empty = (v: unknown) => v === null || v === undefined || v === '' || v === 0 || (Array.isArray(v) && v.length === 0);

/** The update to write: researched values for empty fields only, and the row marked done. */
export const enrichmentUpdate = (title: EnrichableTitle, found: Enrichment): Record<string, unknown> => {
  const update: Record<string, unknown> = { enriched: true };
  const fill = (column: keyof EnrichableTitle, value: unknown) => {
    if (empty(title[column]) && !empty(value)) update[column] = value;
  };
  fill('imdb_url', found.imdb_url);
  fill('rt_url', found.rt_url);
  fill('director', found.director);
  fill('cast_members', found.cast_names);
  fill('runtime_minutes', found.runtime_minutes);
  return update;
};
