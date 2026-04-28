import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PdfUploadField } from "@/components/admin/PdfUploadField";
import { cn } from "@/lib/utils";
import { FileText, UploadCloud, ShieldCheck, GraduationCap, ChevronRight, AlertCircle } from "lucide-react";

const schema = z.object({
  submission_type: z.enum(["proposal", "thesis"]),
  thesis_name: z.string().trim().min(2, "Thesis name is required").max(300),
  supervisor_name: z.string().trim().min(2, "Supervisor name is required").max(200),
  student_name: z.string().trim().min(2, "Student name is required").max(200),
  student_id: z.string().trim().min(1, "Student ID is required").max(80),
  file_url: z.string().trim().min(1, "Upload a PDF or paste a file URL"),
});

type FormData = z.infer<typeof schema>;

const fieldClass =
  "h-12 rounded-2xl border border-border/70 bg-background/90 px-4 text-header-navy shadow-none placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-accent-green/30 dark:text-foreground";

export default function Submissions({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      submission_type: "proposal",
      thesis_name: "",
      supervisor_name: "",
      student_name: "",
      student_id: "",
      file_url: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from("thesis_upload_submissions").insert([
        {
          user_id: user?.id ?? null,
          submission_type: data.submission_type,
          thesis_name: data.thesis_name,
          supervisor_name: data.supervisor_name,
          student_name: data.student_name,
          student_id: data.student_id,
          file_url: data.file_url,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Submission completed",
        description: "Your document has been submitted successfully.",
      });
      reset();
    },
    onError: (err: Error) => {
      toast({
        title: "Submission failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="relative overflow-hidden">
      {!embedded && <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(26,43,95,0.05),transparent)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" aria-hidden />}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(16,133,69,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8f9fa_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,133,69,0.12),transparent_30%),linear-gradient(180deg,rgba(11,18,35,1)_0%,rgba(15,24,43,1)_100%)]" aria-hidden />

      <div className={cn("relative", !embedded && "container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12")}>
        {!embedded && (
          <PageHeader
            variant="hero"
            title="Submission Portal"
            description="Upload your proposal or thesis document and submit it through the postgraduate portal."
            heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,249,250,0.98)_54%,rgba(236,247,244,0.94))] dark:bg-[linear-gradient(135deg,rgba(14,22,41,0.96),rgba(18,30,52,0.98)_54%,rgba(15,54,51,0.82))]"
            heroAccentClassName="bg-[linear-gradient(90deg,#108545,#1A2B5F,#0EA5A4)]"
            heroBadges={[
              { icon: UploadCloud },
              { icon: FileText, className: "bg-white text-header-navy dark:bg-card dark:text-foreground" },
              { icon: GraduationCap, className: "bg-accent-green text-white" },
            ]}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="grid gap-6">
            <Card className="overflow-hidden rounded-[28px] border-header-navy/10 bg-[linear-gradient(145deg,rgba(26,43,95,0.98),rgba(26,43,95,0.92)_58%,rgba(16,133,69,0.92))] text-white shadow-[0_36px_80px_-42px_rgba(15,39,68,0.58)] dark:border-border dark:shadow-[0_36px_80px_-42px_rgba(0,0,0,0.55)]">
              <CardContent className="relative p-0">
                <div className="relative min-h-[320px] overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,22,56,0.08),rgba(9,22,56,0.7))]" />
                  <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8">
                    <span className="mb-3 inline-flex w-fit items-center rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm">
                      Postgraduate Submission
                    </span>
                    <h2 className="max-w-md font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
                      Submit your proposal or thesis in one place.
                    </h2>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-white/85 sm:text-base">
                      Complete the form, upload the PDF document, and send it directly through the portal for review.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="rounded-3xl border-header-navy/10 bg-white/92 shadow-[0_20px_55px_-40px_rgba(15,39,68,0.45)] dark:border-border dark:bg-card/90 dark:shadow-[0_20px_55px_-40px_rgba(0,0,0,0.45)]">
                <CardContent className="p-5">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
                    <UploadCloud className="h-5 w-5" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-header-navy/60 dark:text-foreground/60">Upload</p>
                  <p className="mt-2 font-heading text-lg font-semibold text-header-navy dark:text-foreground">PDF document</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Upload your proposal or thesis as a PDF file before submitting.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-header-navy/10 bg-white/92 shadow-[0_20px_55px_-40px_rgba(15,39,68,0.45)] dark:border-border dark:bg-card/90 dark:shadow-[0_20px_55px_-40px_rgba(0,0,0,0.45)]">
                <CardContent className="p-5">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-header-navy/8 text-header-navy dark:bg-muted dark:text-foreground">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-header-navy/60 dark:text-foreground/60">Document type</p>
                  <p className="mt-2 font-heading text-lg font-semibold text-header-navy dark:text-foreground">Proposal or thesis</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Choose the correct submission type before sending your record.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-header-navy/10 bg-white/92 shadow-[0_20px_55px_-40px_rgba(15,39,68,0.45)] dark:border-border dark:bg-card/90 dark:shadow-[0_20px_55px_-40px_rgba(0,0,0,0.45)]">
                <CardContent className="p-5">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-header-navy/8 text-header-navy dark:bg-muted dark:text-foreground">
                    <FileText className="h-5 w-5" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-header-navy/60 dark:text-foreground/60">Details</p>
                  <p className="mt-2 font-heading text-lg font-semibold text-header-navy dark:text-foreground">Student and supervisor info</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Enter your name, student ID, thesis title, and supervisor details accurately.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-header-navy/10 bg-white/92 shadow-[0_20px_55px_-40px_rgba(15,39,68,0.45)] dark:border-border dark:bg-card/90 dark:shadow-[0_20px_55px_-40px_rgba(0,0,0,0.45)]">
                <CardContent className="p-5">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-header-navy/60 dark:text-foreground/60">Status</p>
                  <p className="mt-2 font-heading text-lg font-semibold text-header-navy dark:text-foreground">Ready to submit</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Once submitted, your form record and uploaded file are saved in the portal backend.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="rounded-[30px] border-header-navy/10 bg-white/95 shadow-[0_32px_90px_-50px_rgba(15,39,68,0.38)] dark:border-border dark:bg-card/95 dark:shadow-[0_32px_90px_-50px_rgba(0,0,0,0.45)]">
            <CardHeader className="px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
              <CardTitle className="font-heading text-3xl font-bold text-header-navy dark:text-foreground">
                Submit your document
              </CardTitle>
              <CardDescription className="max-w-lg text-sm leading-7 sm:text-base">
                Fill in the form below and upload the final PDF file before sending your submission.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-4 sm:p-8 sm:pt-4">
              {!isSupabaseConfigured && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Supabase is not configured, so the submission form cannot send data right now.</p>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-header-navy dark:text-foreground">Document type</Label>
                  <Controller
                    name="submission_type"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="grid gap-3 sm:grid-cols-2">
                        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-4 transition-colors hover:border-accent-green/40 hover:bg-accent-green/5">
                          <RadioGroupItem value="proposal" id="submission-proposal" />
                          <div>
                            <p className="font-medium text-header-navy dark:text-foreground">Proposal</p>
                            <p className="text-sm text-muted-foreground">Submit a proposal document</p>
                          </div>
                        </label>

                        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-4 transition-colors hover:border-accent-green/40 hover:bg-accent-green/5">
                          <RadioGroupItem value="thesis" id="submission-thesis" />
                          <div>
                            <p className="font-medium text-header-navy dark:text-foreground">Research thesis</p>
                            <p className="text-sm text-muted-foreground">Submit a thesis document</p>
                          </div>
                        </label>
                      </RadioGroup>
                    )}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="submission-thesis-name" className="text-sm font-medium text-header-navy dark:text-foreground">
                      Thesis name
                    </Label>
                    <Input
                      id="submission-thesis-name"
                      className={fieldClass}
                      placeholder="Enter thesis title"
                      {...register("thesis_name")}
                      aria-invalid={!!errors.thesis_name}
                    />
                    {errors.thesis_name && <p className="text-xs text-destructive">{errors.thesis_name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submission-supervisor-name" className="text-sm font-medium text-header-navy dark:text-foreground">
                      Supervisor name
                    </Label>
                    <Input
                      id="submission-supervisor-name"
                      className={fieldClass}
                      placeholder="Enter supervisor name"
                      {...register("supervisor_name")}
                      aria-invalid={!!errors.supervisor_name}
                    />
                    {errors.supervisor_name && <p className="text-xs text-destructive">{errors.supervisor_name.message}</p>}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="submission-student-name" className="text-sm font-medium text-header-navy dark:text-foreground">
                      Student name
                    </Label>
                    <Input
                      id="submission-student-name"
                      className={fieldClass}
                      placeholder="Enter student name"
                      {...register("student_name")}
                      aria-invalid={!!errors.student_name}
                    />
                    {errors.student_name && <p className="text-xs text-destructive">{errors.student_name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submission-student-id" className="text-sm font-medium text-header-navy dark:text-foreground">
                      Student ID
                    </Label>
                    <Input
                      id="submission-student-id"
                      className={fieldClass}
                      placeholder="Enter student ID"
                      {...register("student_id")}
                      aria-invalid={!!errors.student_id}
                    />
                    {errors.student_id && <p className="text-xs text-destructive">{errors.student_id.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <PdfUploadField
                    id="submission-file"
                    label="PDF document"
                    value={watch("file_url") ?? ""}
                    onChange={(url) => setValue("file_url", url, { shouldValidate: true })}
                    storageFolder="thesis-submissions"
                    showUrlInput
                  />
                  <input type="hidden" {...register("file_url")} />
                  {errors.file_url && <p className="text-xs text-destructive">{errors.file_url.message}</p>}
                </div>

                <div className="flex flex-col gap-4 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-muted-foreground">
                    Your PDF and form details will be stored in the submission portal after you submit.
                  </p>

                  <Button
                    type="submit"
                    disabled={mutation.isPending || !isSupabaseConfigured}
                    className="h-12 rounded-full bg-accent-green px-7 text-base font-semibold text-white hover:bg-accent-green/90"
                  >
                    {mutation.isPending ? "Submitting…" : "Submit document"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}