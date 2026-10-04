"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Building2, Info, Mail, MessageSquare, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/common/page-header";
import { APP_NAME } from "@/lib/constants";

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or fewer"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.enum(["general", "support", "partnership", "demo", "other"], {
    required_error: "Please select a subject",
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be 2,000 characters or fewer"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const SUBJECT_LABELS: Record<ContactFormValues["subject"], string> = {
  general: "General inquiry",
  support: "Technical support",
  partnership: "Partnership",
  demo: "Demo / evaluation",
  other: "Other",
};

const QUICK_FAQS = [
  {
    question: "How do I sign up as a tenant?",
    answer: "Visit /register and choose the Tenant role. After email verification you will land on your tenant dashboard.",
  },
  {
    question: "How do I publish a listing?",
    answer: "Register as an Owner, then use the owner dashboard to create a property and add rooms with photos and amenities.",
  },
  {
    question: "Are demo accounts available?",
    answer: "Yes. Visit /login#demo for one-click login as Admin, Owner or Tenant using seeded accounts.",
  },
  {
    question: "Is there a platform fee for tenants?",
    answer: "No. Tenants pay only the rent set by the owner. The platform fee (default 5%) is deducted from the owner's payout.",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: undefined, message: "" },
    mode: "onChange",
  });

  const messageValue = watch("message");

  useEffect(() => {
    setCharCount(messageValue?.length ?? 0);
  }, [messageValue]);

  function onSubmit(data: ContactFormValues) {
    const subjectLabel = SUBJECT_LABELS[data.subject];
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${subjectLabel}\n\nMessage:\n${data.message}`,
    );
    const mailto = `mailto:support@housing.local?subject=${encodeURIComponent(`[${APP_NAME}] ${subjectLabel}`)}&body=${body}`;

    try {
      window.location.href = mailto;
    } catch {
      window.open(mailto, "_blank");
    }

    toast.success("Opening your email client", {
      description:
        "A new message has been composed with your details. Send it from your email app to reach the team.",
    });

    setSubmitted(true);
    reset();
  }

  return (
    <div className="container-page space-y-16 py-12 lg:py-16">
      <PageHeader
        title="Contact us"
        description="Have a question, need help, or want to evaluate the platform? Reach out directly."
        eyebrow="Get in touch"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-6 sm:p-8">
            {submitted ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <Mail className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">Message composed</h3>
                <p className="text-sm text-muted-foreground">
                  Your email client should have opened with a pre-filled message. Please send it to reach the
                  team. If nothing happened, you can also email us directly at{" "}
                  <a href="mailto:support@housing.local" className="text-primary underline">
                    support@housing.local
                  </a>
                  .
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-2">
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="contact-name" required error={errors.name?.message}>
                    <Input
                      id="contact-name"
                      placeholder="Jane Smith"
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                      {...register("name")}
                    />
                  </Field>
                  <Field label="Email" htmlFor="contact-email" required error={errors.email?.message}>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="jane@example.com"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                  </Field>
                </div>

                <Field label="Subject" htmlFor="contact-subject" required error={errors.subject?.message}>
                  <select
                    id="contact-subject"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-invalid={!!errors.subject}
                    {...register("subject")}
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General inquiry</option>
                    <option value="support">Technical support</option>
                    <option value="partnership">Partnership</option>
                    <option value="demo">Demo / evaluation</option>
                    <option value="other">Other</option>
                  </select>
                </Field>

                <Field
                  label="Message"
                  htmlFor="contact-message"
                  required
                  error={errors.message?.message}
                  hint={`${charCount} / 2,000`}
                >
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us what you need help with…"
                    rows={6}
                    aria-invalid={!!errors.message}
                    {...register("message")}
                  />
                </Field>

                <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/5 p-4">
                  <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
                  <p className="text-xs text-muted-foreground">
                    This form opens your default email client with a pre-filled message. There is no backend
                    contact endpoint — all communication happens directly via email.
                  </p>
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Composing…" : "Open email client"}
                  <ArrowRight />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="text-sm font-semibold">Contact channels</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a
                      href="mailto:support@housing.local"
                      className="text-sm text-primary hover:underline"
                    >
                      support@housing.local
                    </a>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">In-app messaging</p>
                    <p className="text-xs text-muted-foreground">
                      Logged-in users can message owners directly from a listing.
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Demo accounts</p>
                    <p className="text-xs text-muted-foreground">
                      Seeded accounts for Admin, Owner and Tenant at{" "}
                      <Link href="/login#demo" className="text-primary hover:underline">
                        /login#demo
                      </Link>
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Response hours</p>
                    <p className="text-xs text-muted-foreground">Monday – Friday, 9 AM – 6 PM UTC</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="space-y-3 p-6">
              <Badge variant="accent" className="gap-1.5">
                <MessageSquare className="size-3" aria-hidden="true" />
                Evaluators
              </Badge>
              <h3 className="text-sm font-semibold">Try it without an account</h3>
              <p className="text-xs text-muted-foreground">
                The sign-in page has one-click demo login for all three roles. No email, no password — just
                click and go.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/login#demo">
                  Open demo login
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-3 text-sm font-semibold">Quick answers</h3>
              <Accordion type="single" collapsible>
                {QUICK_FAQS.map((faq) => (
                  <AccordionItem key={faq.question} value={faq.question}>
                    <AccordionTrigger className="text-left text-xs">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
