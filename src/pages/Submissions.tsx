import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PdfUploadField } from '@/components/admin/PdfUploadField';

const schema = z.object({
  submission_type: z.enum(['proposal', 'thesis']),
  thesis_name: z.string().trim().min(2, 'Thesis name is required').max(300),
  supervisor_name: z.string().trim().min(2, 'Supervisor name is required').max(200),
  student_name: z.string().trim().min(2, 'Student name is required').max(200),
  student_id: z.string().trim().min(1, 'Student ID is required').max(80),
  file_url: z.string().trim().min(1, 'Upload a PDF or paste a file URL'),
});

type FormData = z.infer<typeof schema>;

export default function Submissions() {
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
      submission_type: 'proposal',
      thesis_name: '',
      supervisor_name: '',
      student_name: '',
      student_id: '',
      file_url: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from('thesis_upload_submissions').insert([
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
      toast({ title: 'Submitted', description: 'Your document was uploaded successfully.' });
      reset();
    },
    onError: (err: Error) => {
      toast({ title: 'Submission failed', description: err.message, variant: 'destructive' });
    },
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 md:py-12">
      <PageHeader
        title="Submission portal"
        description="Upload a research proposal or thesis PDF. All fields are required except where noted."
      />
      <Card>
        <CardContent className="space-y-6 p-6">
          <form
            className="space-y-5"
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
          >
            <div className="space-y-3">
              <Label>Document type</Label>
              <Controller
                name="submission_type"
                control={control}
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="proposal" id="st-proposal" />
                      <Label htmlFor="st-proposal" className="cursor-pointer font-normal">
                        Proposal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="thesis" id="st-thesis" />
                      <Label htmlFor="st-thesis" className="cursor-pointer font-normal">
                        Research thesis
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thesis_name">Thesis name</Label>
              <Input id="thesis_name" {...register('thesis_name')} aria-invalid={!!errors.thesis_name} />
              {errors.thesis_name && <p className="text-sm text-destructive">{errors.thesis_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor_name">Supervisor name</Label>
              <Input id="supervisor_name" {...register('supervisor_name')} aria-invalid={!!errors.supervisor_name} />
              {errors.supervisor_name && <p className="text-sm text-destructive">{errors.supervisor_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student_name">Student name</Label>
              <Input id="student_name" {...register('student_name')} aria-invalid={!!errors.student_name} />
              {errors.student_name && <p className="text-sm text-destructive">{errors.student_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID</Label>
              <Input id="student_id" {...register('student_id')} aria-invalid={!!errors.student_id} />
              {errors.student_id && <p className="text-sm text-destructive">{errors.student_id.message}</p>}
            </div>
            <div className="space-y-2">
              <PdfUploadField
                id="thesis_pdf"
                label="PDF document"
                value={watch('file_url') ?? ''}
                onChange={(url) => setValue('file_url', url, { shouldValidate: true })}
                storageFolder="thesis-submissions"
                showUrlInput
              />
              <input type="hidden" {...register('file_url')} />
              {errors.file_url && <p className="text-sm text-destructive">{errors.file_url.message}</p>}
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting…' : 'Submit' }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}