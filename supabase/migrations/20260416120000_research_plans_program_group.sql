-- Study plan: explicit CS / IS grouping on research_plans (nullable = infer from title on older rows).

ALTER TABLE public.research_plans
  ADD COLUMN IF NOT EXISTS program_group TEXT;

ALTER TABLE public.research_plans DROP CONSTRAINT IF EXISTS research_plans_program_group_check;

ALTER TABLE public.research_plans
  ADD CONSTRAINT research_plans_program_group_check CHECK (
    program_group IS NULL OR program_group IN ('cs', 'is')
  );

COMMENT ON COLUMN public.research_plans.program_group IS 'Study plan subgroup: cs (Computer Science) or is (Information Systems). NULL = infer from title for legacy rows.';

-- Real seed rows for public Study plan (Master's / PhD × CS / IS). Idempotent by title.
INSERT INTO public.research_plans (title, summary, milestones, file_url, regulation_track, program_group)
SELECT v.title, v.summary, v.milestones, v.file_url, v.regulation_track, v.program_group
FROM (
  VALUES
    (
      'Master''s — Computer Science: programme regulations',
      'Official postgraduate coursework structure, elective pools, thesis proposal timeline, and examination board rules for MSc Computer Science candidates.',
      E'Year 1: core courses and research methods\nYear 2: thesis research, progress reviews, submission deadlines',
      NULL,
      'masters',
      'cs'
    ),
    (
      'Master''s — Computer Science: credit hours and residency',
      'Minimum credits, maximum programme duration, leave of absence, and transfer-credit policy for the CS MSc track.',
      NULL,
      NULL,
      'masters',
      'cs'
    ),
    (
      'Master''s — Information Systems: milestones and forms',
      'Industry project pathway, dissertation format, similarity-check (iThenticate) steps, and committee paperwork for MSc Information Systems.',
      E'Committee formation\nMid-programme review\nFinal defence scheduling',
      NULL,
      'masters',
      'is'
    ),
    (
      'Master''s — Information Systems: advisory committee template',
      'Supervisor and co-supervisor eligibility, external examiner criteria, and appeals process for IS postgraduate students.',
      NULL,
      NULL,
      'masters',
      'is'
    ),
    (
      'PhD — Computer Science: doctoral regulations',
      'PhD milestones from admission through proposal defence, annual progress, publications expectation, and final thesis submission for Computer Science.',
      E'Proposal defence window\nAnnual committee review\nThesis examination',
      NULL,
      'phd',
      'cs'
    ),
    (
      'PhD — Computer Science: thesis format and defence checklist',
      'University thesis template, binding, embargo options, and defence-day checklist for CS doctoral candidates.',
      NULL,
      NULL,
      'phd',
      'cs'
    ),
    (
      'PhD — Information Systems: regulations overview',
      'Doctoral regulations for the Information Systems track: coursework waiver rules, comprehensive review, and dissertation standards.',
      E'Literature review gate\nField paper or equivalent\nFinal oral defence',
      NULL,
      'phd',
      'is'
    ),
    (
      'PhD — Information Systems: research ethics and data management',
      'Ethics approval, participant consent, data retention, and GDPR-aligned handling for IS PhD research involving human subjects or personal data.',
      NULL,
      NULL,
      'phd',
      'is'
    )
) AS v(title, summary, milestones, file_url, regulation_track, program_group)
WHERE NOT EXISTS (
  SELECT 1 FROM public.research_plans rp WHERE rp.title = 'Master''s — Computer Science: programme regulations'
);
