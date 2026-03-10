import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { SkeletonCard } from '@/components/SkeletonCard';

const schema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(2000),
  degree_type: z.string().min(1, 'Please select a degree type'),
  department: z.string().trim().min(2, 'Department is required').max(100),
  abstract: z.string().trim().max(3000).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const degreeTypes = ['Master\'s', 'PhD', 'Professional Diploma', 'Postgraduate Certificate'];
const departments = [
  'Computer Science', 'Engineering', 'Business Administration',
  'Education', 'Medical Sciences', 'Law', 'Arts & Humanities',
  'Social Sciences', 'Natural Sciences', 'Other',
];

const SubmitApplication = () => {
  const { user, isStudent, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { degree_type: '', abstract: '' },
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { error } = await supabase.from('student_submissions').insert([{
        user_id: user!.id,
        title: formData.title,
        description: formData.description,
        degree_type: formData.degree_type,
        department: formData.department,
        abstract: formData.abstract || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Application submitted!', description: 'Your submission is now pending review.' });
      navigate('/dashboard');
    },
    onError: (err: any) => {
      toast({ title: 'Submission failed', description: err.message, variant: 'destructive' });
    },
  });

  if (authLoading) return <div className="p-8"><SkeletonCard /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div>
      <PageHeader
        title="Submit Application"
        description="Submit your postgraduate application or thesis proposal for review."
      />

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Application or thesis title" {...register('title')} aria-invalid={!!errors.title} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Degree Type</Label>
                <Controller
                  name="degree_type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger aria-invalid={!!errors.degree_type}>
                        <SelectValue placeholder="Select degree type" />
                      </SelectTrigger>
                      <SelectContent>
                        {degreeTypes.map((dt) => (
                          <SelectItem key={dt} value={dt}>{dt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.degree_type && <p className="text-xs text-destructive">{errors.degree_type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger aria-invalid={!!errors.department}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your application or research proposal..."
                rows={4}
                {...register('description')}
                aria-invalid={!!errors.description}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract (optional)</Label>
              <Textarea
                id="abstract"
                placeholder="Provide a brief abstract of your research..."
                rows={4}
                {...register('abstract')}
                aria-invalid={!!errors.abstract}
              />
              {errors.abstract && <p className="text-xs text-destructive">{errors.abstract.message}</p>}
            </div>

            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              <Send className="h-4 w-4" />
              {mutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitApplication;
