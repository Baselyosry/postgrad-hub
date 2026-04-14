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
import { Mail, Phone, Send, MapPin, Clock3, ChevronRight } from "lucide-react";

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone_number: z.string().trim().max(40),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

type FormData = z.infer<typeof schema>;

const fieldClass =
  "h-12 rounded-2xl border border-border/70 bg-background/90 px-4 text-foreground shadow-none placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-accent-green/30 dark:border-white/10 dark:bg-background/80";

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

  const content = (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(26,43,95,0.05),transparent)] dark:bg-[linear-gradient(180deg,rgba(93,130,214,0.14),transparent)]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(16,133,69,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8f9fa_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,133,69,0.12),transparent_30%),linear-gradient(180deg,rgba(11,18,35,1)_0%,rgba(15,24,43,1)_100%)]" aria-hidden />

      <div className={cn("relative", !embedded && "container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12")}>
        {!embedded && (
          <PageHeader
            variant="hero"
            title="Contact Us"
            description="Reach the postgraduate office by email or send us a message through the form below."
            heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,249,250,0.98)_54%,rgba(236,247,244,0.94))] dark:bg-[linear-gradient(135deg,rgba(14,22,41,0.96),rgba(18,30,52,0.98)_54%,rgba(15,54,51,0.82))]"
            heroAccentClassName="bg-[linear-gradient(90deg,#108545,#1A2B5F,#0EA5A4)]"
            heroBadges={[
              { icon: Mail },
              { icon: Send, className: "bg-white text-header-navy dark:bg-card dark:text-foreground dark:ring-1 dark:ring-white/10" },
              { icon: Phone, className: "bg-accent-green text-white" },
            ]}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="grid gap-6">
            <Card className="overflow-hidden rounded-[28px] border-header-navy/10 bg-[linear-gradient(145deg,rgba(26,43,95,0.98),rgba(26,43,95,0.92)_58%,rgba(16,133,69,0.92))] text-white shadow-[0_36px_80px_-42px_rgba(15,39,68,0.58)] dark:border-white/10 dark:shadow-[0_36px_80px_-42px_rgba(0,0,0,0.76)]">
              <CardContent className="relative p-0">
                <div className="relative aspect-[5/4] min-h-[320px] overflow-hidden">
                  <img
                    src={assetUrl("hero/slide-1.jpg")}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center opacity-30"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,22,56,0.1),rgba(9,22,56,0.72))]" />
                  <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8">
                    <span className="mb-3 inline-flex w-fit items-center rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm">
                      Postgraduate Office
                    </span>
                    <h2 className="max-w-md font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
                      Let’s help you with admissions, schedules, and postgraduate enquiries.
                    </h2>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-white/85 sm:text-base">
                      Send your message and the office can follow up with you by email. For direct contact, use the details below.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="rounded-3xl border-header-navy/10 bg-white/92 shadow-[0_20px_55px_-40px_rgba(15,39,68,0.45)] dark:border-white/10 dark:bg-card/92 dark:shadow-[0_20px_55px_-40px_rgba(0,0,0,0.72)]">
                <CardContent className="p-5">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
                    <Mail className="h-5 w-5" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-header-navy/60 dark:text-foreground/60">Email</p>
                  <a
                    href="mailto:postgrad@must.edu.eg"
                    className="mt-2 block break-all font-heading text-lg font-semibold text-header-navy transition-colors hover:text-accent-green dark:text-foreground"
                  >
                    postgrad@must.edu.eg
                  </a>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Best for programme questions, follow-up, and general enquiries.</p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-header-navy/10 bg-white/92 shadow-[0_20px_55px_-40px_rgba(15,39,68,0.45)] dark:border-white/10 dark:bg-card/92 dark:shadow-[0_20px_55px_-40px_rgba(0,0,0,0.72)]">
                <CardContent className="p-5">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-header-navy/8 text-header-navy dark:bg-white/10 dark:text-foreground">
                    <Phone className="h-5 w-5" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-header-navy/60 dark:text-foreground/60">Phone</p>
                  <p className="mt-2 font-heading text-lg font-semibold text-header-navy dark:text-foreground">Contact via office channels</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Use the message form and include your phone number if you want a callback.</p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-header-navy/10 bg-white/92 shadow-[0_20px_55px_-40px_rgba(15,39,68,0.45)] dark:border-white/10 dark:bg-card/92 dark:shadow-[0_20px_55px_-40px_rgba(0,0,0,0.72)]">
                <CardContent className="p-5">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-header-navy/8 text-header-navy dark:bg-white/10 dark:text-foreground">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-header-navy/60 dark:text-foreground/60">Office</p>
                  <p className="mt-2 font-heading text-lg font-semibold text-header-navy dark:text-foreground">MUST Postgraduate Studies</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Use this page for postgraduate administration enquiries and support.</p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-header-navy/10 bg-white/92 shadow-[0_20px_55px_-40px_rgba(15,39,68,0.45)] dark:border-white/10 dark:bg-card/92 dark:shadow-[0_20px_55px_-40px_rgba(0,0,0,0.72)]">
                <CardContent className="p-5">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
                    <Clock3 className="h-5 w-5" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-header-navy/60 dark:text-foreground/60">Response</p>
                  <p className="mt-2 font-heading text-lg font-semibold text-header-navy dark:text-foreground">We’ll reply as soon as possible</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Please include your full name, email, and enough detail in your message.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="rounded-[30px] border-header-navy/10 bg-white/95 shadow-[0_32px_90px_-50px_rgba(15,39,68,0.38)] dark:border-white/10 dark:bg-card/95 dark:shadow-[0_32px_90px_-50px_rgba(0,0,0,0.78)]">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-green">Send a message</p>
                  <h3 className="mt-2 font-heading text-3xl font-bold text-header-navy dark:text-foreground">We’d love to hear from you</h3>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
                    Fill in the form and submit your enquiry directly to the postgraduate office.
                  </p>
                </div>
                <span className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green sm:flex">
                  <Send className="h-6 w-6" />
                </span>
              </div>

              {!isSupabaseConfigured && (
                <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  Supabase is not configured, so the form cannot be submitted right now.
                </div>
              )}

              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="text-sm font-medium text-header-navy dark:text-foreground">
                      Full name
                    </Label>
                    <Input
                      id="contact-name"
                      placeholder="Enter your name"
                      className={fieldClass}
                      {...register("name")}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-sm font-medium text-header-navy dark:text-foreground">
                      Email address
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="Enter your email"
                      className={fieldClass}
                      {...register("email")}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="text-sm font-medium text-header-navy dark:text-foreground">
                    Phone number
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className={fieldClass}
                    {...register("phone_number")}
                    aria-invalid={!!errors.phone_number}
                  />
                  {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-sm font-medium text-header-navy dark:text-foreground">
                    Message
                  </Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Write your message here"
                    rows={7}
                    className={cn(
                      "min-h-[180px] resize-none rounded-2xl border border-border/70 bg-background/90 px-4 py-3 text-foreground shadow-none placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-accent-green/30 dark:border-white/10 dark:bg-background/80"
                    )}
                    {...register("message")}
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                </div>

                <div className="flex flex-col gap-4 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-muted-foreground">
                    By submitting this form, your enquiry is stored in the portal so the office can review it.
                  </p>

                  <Button
                    type="submit"
                    disabled={formDisabled}
                    className="h-12 rounded-full bg-accent-green px-7 text-base font-semibold text-white hover:bg-accent-green/90"
                  >
                    {mutation.isPending ? "Sending…" : "Send Message"}
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

  if (embedded) {
    return content;
  }

  return <div>{content}</div>;
};

export default Contact;
