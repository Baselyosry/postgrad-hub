export type RegulationTrack = 'masters' | 'phd';

export const REGULATION_TRACK_COPY: Record<RegulationTrack, { title: string; description: string }> = {
  masters: {
    title: "Master's regulations",
    description: "Official guidelines, milestones, and resources for Master's postgraduate programmes.",
  },
  phd: {
    title: 'PhD regulations',
    description: 'Doctoral regulations, milestones, and defence preparation resources.',
  },
};
