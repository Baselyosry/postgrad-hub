import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface DocItem { label: string; }

const admissionsData = [
  {
    type: 'Masters Programs' as const,
    badge: 'Masters',
    requirements: [
      "Bachelor's degree from an accredited institution",
      'Minimum GPA of 3.0 / "Good" or equivalent',
      'Proof of English proficiency (TOEFL/IELTS)',
      'Two academic recommendation letters',
      'Statement of purpose (500-1000 words)',
    ],
    documents: [
      { label: "Certified copy of Bachelor's degree" },
      { label: 'Official academic transcripts' },
      { label: 'Valid national ID or passport copy' },
      { label: 'Language proficiency certificate' },
      { label: '4 passport-sized photographs' },
      { label: 'Completed application form' },
      { label: 'Medical fitness certificate' },
    ],
  },
  {
    type: 'PhD Programs' as const,
    badge: 'PhD',
    requirements: [
      "Master's degree in a related field",
      'Minimum GPA of 3.5 / "Very Good" or equivalent',
      'Published research or demonstrated research capability',
      'Approved research proposal',
      'Supervisor acceptance letter',
    ],
    documents: [
      { label: "Certified copies of Bachelor's and Master's degrees" },
      { label: 'Official transcripts for all previous degrees' },
      { label: 'Research proposal (3000-5000 words)' },
      { label: "Master's thesis abstract" },
      { label: 'Three academic recommendation letters' },
      { label: 'Updated curriculum vitae' },
      { label: 'Publications list (if applicable)' },
      { label: 'Completed application form' },
    ],
  },
];

const Admissions = () => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <PageHeader
        title="Admissions Hub"
        description="Explore enrollment conditions and prepare your required documents for Masters and PhD programs."
      />

      <Accordion type="single" collapsible className="space-y-4">
        {admissionsData.map((program, pi) => (
          <motion.div
            key={program.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pi * 0.1 }}
          >
            <AccordionItem value={program.type} className="rounded-lg border border-border bg-card">
              <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-lg font-semibold">{program.type}</span>
                  <Badge variant="secondary">{program.badge}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6 sm:px-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Eligibility Requirements</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {program.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base">Document Checklist</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {program.documents.map((doc: DocItem, i: number) => {
                          const key = `${program.type}-${i}`;
                          return (
                            <li key={i} className="flex items-center gap-3">
                              <Checkbox
                                id={key}
                                checked={!!checked[key]}
                                onCheckedChange={() => toggle(key)}
                              />
                              <label
                                htmlFor={key}
                                className={`cursor-pointer text-sm ${checked[key] ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                              >
                                {doc.label}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  );
};

export default Admissions;
