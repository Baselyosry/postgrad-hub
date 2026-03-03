import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email').max(255),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(500, 'Message must be under 500 characters'),
});

type FormData = z.infer<typeof schema>;

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { error } = await supabase.from('inquiries').insert([{
        name: formData.name,
        email: formData.email,
        message: formData.message,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Inquiry submitted', description: 'We will get back to you soon.' });
      reset();
    },
    onError: () => {
      toast({ title: 'Submission failed', description: 'Please try again later.', variant: 'destructive' });
    },
  });

  return (
    <div>
      <PageHeader
        title="Contact Us"
        description="Have a question? Send us an inquiry and we'll respond promptly."
      />

      <Card className="max-w-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your full name" {...register('name')} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your inquiry..."
                rows={5}
                {...register('message')}
                aria-invalid={!!errors.message}
              />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
            </div>

            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              <Send className="h-4 w-4" />
              {mutation.isPending ? 'Sending...' : 'Submit Inquiry'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;
