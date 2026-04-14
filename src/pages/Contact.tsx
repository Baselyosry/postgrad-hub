import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Mail, Phone, Send } from "lucide-react";

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone_number: z.string().trim().max(40),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

type FormData = z.infer<typeof schema>;

const fieldClass =
  "border-0 bg-zinc-100 text-header-navy shadow-none placeholder:text-muted-foreground/80 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-accent-green/30 dark:bg-zinc-800/80 dark:text-foreground dark:focus-visible:bg-card";

const Contact = ({ embedded = false }: { embedded?: boolean }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone_number: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data, error } = await supabase
        .from("inquiries")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone_number: formData.phone_number.trim() || null,
            message: formData.message,
          },
        ])
        .select("id");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Message sent", description: "We will get back to you soon." });
      reset();
    },
    onError: (err: Error) => {
      console.error("[Contact] Submission failed:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Submission failed",
        description:
          msg.includes("fetch") || msg.includes("network")
            ? "Check your connection and Supabase env (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)."
            : msg,
        variant: "destructive",
      });
    },
  });

  const formDisabled = mutation.isPending || !isSupabaseConfigured;

  const splitLayout = (
    <div
      className={cn(
        "grid min-h-[min(100vh,640px)] w-full overflow-hidden bg-white lg:min-h-[520px] lg:grid-cols-2 dark:bg-card"
      )}
    >
      <div className="relative min-h-[280px] lg:min-h-full">
        <img
          src={assetUrl("hero/slide-1.jpg")}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-header-navy/75 backdrop-blur-[2px]" aria-hidden />
        <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
          <h2 className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">Reach us on any time.</h2>
          <p className="mt-4 max-w-md text-base text-white/90 sm:text-lg">Or contact us by email</p>
          <a
            href="mailto:postgrad@must.edu.eg"
            className="mt-2 inline-flex w-fit text-lg font-semibold text-accent-green transition-colors hover:text-accent-green/90"
          >
            postgrad@must.edu.eg
          </a>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center bg-zinc-50 px-4 py-10 sm:px-8 lg:px-10 dark:bg-muted/30">
        <Card className="relative z-10 w-full max-w-md border-0 shadow-xl lg:-mt-8 xl:max-w-lg">
          <CardContent className="p-6 sm:p-8">
            <h3 className="font-heading text-2xl font-bold text-header-navy dark:text-header-navy">Leave a message</h3>
            {!isSupabaseConfigured && (
              <p className="mt-2 text-sm text-destructive">Supabase is not configured; the form cannot be submitted.</p>
            )}
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="sr-only">
                    Name
                  </Label>
                  <Input
                    id="contact-name"
                    placeholder="Name"
                    className={fieldClass}
                    {...register("name")}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="Email"
                    className={fieldClass}
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="sr-only">
                  Phone
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="Phone"
                  className={fieldClass}
                  {...register("phone_number")}
                  aria-invalid={!!errors.phone_number}
                />
                {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message" className="sr-only">
                  Message
                </Label>
                <Textarea
                  id="contact-message"
                  placeholder="Say Something"
                  rows={5}
                  className={cn(fieldClass, "min-h-[140px] resize-none")}
                  {...register("message")}
                  aria-invalid={!!errors.message}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
              </div>
              <Button
                type="submit"
                disabled={formDisabled}
                className="h-12 w-full rounded-full bg-accent-green text-base font-semibold text-white hover:bg-accent-green/90"
              >
                {mutation.isPending ? "Sending…" : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (embedded) {
    return splitLayout;
  }

  return (
    <div>
      <PageHeader
        variant="hero"
        title="Contact Us"
        description="Reach the postgraduate office by email or message."
        heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,249,250,0.98)_54%,rgba(236,247,244,0.94))]"
        heroAccentClassName="bg-[linear-gradient(90deg,#108545,#1A2B5F,#0EA5A4)]"
        heroBadges={[
          { icon: Mail },
          { icon: Send, className: 'bg-white text-header-navy' },
          { icon: Phone, className: 'bg-accent-green text-white' },
        ]}
      />
      {splitLayout}
    </div>
  );
};

export default Contact;
