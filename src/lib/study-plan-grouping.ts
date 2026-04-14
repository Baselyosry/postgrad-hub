/** Programme buckets for regulation documents on the Study plan page. */

import type { RegulationTrack } from "@/pages/academics/RegulationsTrackPage";

export type ProgramGroupId = "cs" | "is";

export const PROGRAM_GROUP_ORDER: ProgramGroupId[] = ["cs", "is"];

export const PROGRAM_GROUP_LABELS: Record<ProgramGroupId, { title: string; subtitle: string }> = {
  cs: {
    title: "Computer Science (CS)",
    subtitle: "Regulations and documents for CS postgraduate programmes.",
  },
  is: {
    title: "Information Systems (IS)",
    subtitle: "Regulations and documents for IS postgraduate programmes.",
  },
};

type InferredFromTitle = ProgramGroupId | "other";

function inferProgramGroupFromTitle(title: string): InferredFromTitle {
  const t = title.toLowerCase();

  if (
    /\binformation\s+systems\b/.test(t) ||
    /\bm\.?\s*s\.?\s*c\.?\s*\(?\s*is\s*\)?/i.test(title) ||
    /\bmis\b/.test(t) ||
    /\bm\.?\s*sc\.?\s+information\b/i.test(t)
  ) {
    return "is";
  }

  if (
    /\bcomputer\s+science\b/.test(t) ||
    /\bm\.?\s*s\.?\s*c\.?\s*\(?\s*cs\s*\)?/i.test(title) ||
    /\bmsc\s+computer\b/.test(t) ||
    /\bphd\s+computer\b/.test(t) ||
    (/\bcs\b/.test(t) && /(science|master|msc|phd|doctoral|regulation|program|faculty)/i.test(title))
  ) {
    return "cs";
  }

  return "other";
}

/** Minimal row shape for CS vs IS grouping (study plan, schedules, etc.). */
export type ProgramGroupableRow = {
  title: string;
  program_group?: string | null;
};

/** Resolve CS vs IS: DB `program_group` wins; otherwise infer from title (legacy rows); otherwise CS. */
export function programGroupForRow(row: ProgramGroupableRow): ProgramGroupId {
  if (row.program_group === "cs" || row.program_group === "is") {
    return row.program_group;
  }
  const inferred = inferProgramGroupFromTitle(row.title);
  return inferred === "is" ? "is" : "cs";
}

export type ResearchPlanRow = ProgramGroupableRow & {
  id: string;
  summary: string | null;
  milestones: string | null;
  file_url: string | null;
  /** Present after migration `20260414120000` / `20260415140000`; omitted on older databases. */
  regulation_track?: string | null;
};

/**
 * Split regulation rows for the Study plan page. If no row uses `masters` or `phd`, show all rows
 * under the Master's column so databases without `regulation_track` (or only `general`) still work.
 */
export function partitionStudyPlanByRegulationTrack(rows: ResearchPlanRow[]): {
  mastersRows: ResearchPlanRow[];
  phdRows: ResearchPlanRow[];
  showingAllUnderMastersFallback: boolean;
} {
  if (!rows.length) {
    return { mastersRows: [], phdRows: [], showingAllUnderMastersFallback: false };
  }
  const masters = rows.filter((r) => r.regulation_track === "masters");
  const phd = rows.filter((r) => r.regulation_track === "phd");
  if (masters.length > 0 || phd.length > 0) {
    return { mastersRows: masters, phdRows: phd, showingAllUnderMastersFallback: false };
  }
  return { mastersRows: [...rows], phdRows: [], showingAllUnderMastersFallback: rows.length > 0 };
}

export function groupByProgram<T extends ProgramGroupableRow>(rows: T[]): Record<ProgramGroupId, T[]> {
  const cs: T[] = [];
  const is: T[] = [];
  for (const row of rows) {
    const g = programGroupForRow(row);
    if (g === "is") is.push(row);
    else cs.push(row);
  }
  return { cs, is };
}
