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
import { T } from "@/components/common/localized-text";
import { useTranslation } from "@/components/providers/locale-provider";
import { APP_NAME } from "@/lib/constants";

type ContactFormValues = {
  name: string;
  email: string;
  subject: "general" | "support" | "partnership" | "demo" | "other";
  message: string;
};

/** Subject ids map straight to `contact.subject.<id>` dictionary keys. */
const SUBJECT_IDS = ["general", "support", "partnership", "demo", "other"] as const;

const QUICK_FAQS = [
  { questionKey: "contact.quick.1.q", answerKey: "contact.quick.1.a" },
  { questionKey: "contact.quick.2.q", answerKey: "contact.quick.2.a" },
  { questionKey: "contact.quick.demo.q", answerKey: "contact.quick.demo.a" },
  { questionKey: "contact.quick.3.q", answerKey: "contact.quick.3.a" },
];

export default function ContactPage() {
  const t = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Built per render so validation messages follow the active language.
  const contactSchema = z.object({
    name: z.string().min(2, t("contact.error.nameMin")).max(100, t("contact.error.nameMax")),
    email: z.string().email(t("contact.error.email")),
    subject: z.enum(["general", "support", "partnership", "demo", "other"], {
      required_error: t("contact.error.subject"),
    }),
    message: z.string().min(10, t("contact.error.messageMin")).max(2000, t("contact.error.messageMax")),
  });

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
    const subjectLabel = t(`contact.subject.${data.subject}`);
    const body = encodeURIComponent(
      `${t("contact.mail.name")}: ${data.name}\n${t("contact.mail.email")}: ${data.email}\n${t("contact.mail.subject")}: ${subjectLabel}\n\n${t("contact.mail.message")}:\n${data.message}`,
    );
    const mailto = `mailto:support@housing.local?subject=${encodeURIComponent(`[${APP_NAME}] ${subjectLabel}`)}&body=${body}`;

    try {
      window.location.href = mailto;
    } catch {
      window.open(mailto, "_blank");
    }

    toast.success(t("contact.toast.title"), {
      description: t("contact.toast.body"),
    });

    setSubmitted(true);
    reset();
  }

  return (
    <div className="container-page space-y-16 py-12 lg:py-16">
      <PageHeader
        title="Contact us"
        titleKey="contact.title"
        description="Have a question, need help, or want to evaluate the platform? Reach out directly."
        descriptionKey="contact.subtitle"
        eyebrow="Get in touch"
        eyebrowKey="contact.eyebrow"
        breadcrumbs={[
          { label: "Home", labelKey: "common.home", href: "/" },
          { label: "Contact", labelKey: "nav.contact" },
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
                <h3 className="text-lg font-semibold">
                  <T k="contact.success.title" fallback="Message composed" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  <T
                    k="contact.success.body"
                    fallback="Your email client should have opened with a pre-filled message. Please send it to reach the team. If nothing happened, you can also email us directly."
                  />{" "}
                  <a href="mailto:support@housing.local" className="text-primary underline">
                    support@housing.local
                  </a>
                  .
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-2">
                  <T k="contact.success.again" fallback="Send another message" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label={t("auth.name")}
                    htmlFor="contact-name"
                    required
                    error={errors.name?.message}
                  >
                    <Input
                      id="contact-name"
                      placeholder="Jane Smith"
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                      {...register("name")}
                    />
                  </Field>
                  <Field
                    label={t("auth.email")}
                    htmlFor="contact-email"
                    required
                    error={errors.email?.message}
                  >
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

                <Field
                  label={t("contact.form.subject")}
                  htmlFor="contact-subject"
                  required
                  error={errors.subject?.message}
                >
                  <select
                    id="contact-subject"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-invalid={!!errors.subject}
                    {...register("subject")}
                  >
                    <option value="">{t("contact.form.selectSubject")}</option>
                    {SUBJECT_IDS.map((id) => (
                      <option key={id} value={id}>
                        {t(`contact.subject.${id}`)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label={t("contact.form.message")}
                  htmlFor="contact-message"
                  required
                  error={errors.message?.message}
                  hint={`${charCount} / 2,000`}
                >
                  <Textarea
                    id="contact-message"
                    placeholder={t("contact.form.messagePlaceholder")}
                    rows={6}
                    aria-invalid={!!errors.message}
                    {...register("message")}
                  />
                </Field>

                <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/5 p-4">
                  <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
                  <p className="text-xs text-muted-foreground">
                    <T
                      k="contact.form.note"
                      fallback="This form opens your default email client with a pre-filled message. There is no backend contact endpoint — all communication happens directly via email."
                    />
                  </p>
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? t("contact.form.composing") : t("contact.form.submit")}
                  <ArrowRight />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="text-sm font-semibold">
                <T k="contact.channels.title" fallback="Contact channels" />
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">
                      <T k="contact.channels.email" fallback="Email" />
                    </p>
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
                    <p className="text-sm font-medium">
                      <T k="contact.channels.messagingTitle" fallback="In-app messaging" />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <T
                        k="contact.channels.messagingBody"
                        fallback="Logged-in users can message owners directly from a listing."
                      />
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">
                      <T k="auth.demoTitle" fallback="Demo accounts" />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <T
                        k="contact.channels.demoBody"
                        fallback="Seeded accounts for Admin, Owner and Tenant."
                      />{" "}
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
                    <p className="text-sm font-medium">
                      <T k="contact.channels.hoursTitle" fallback="Response hours" />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <T k="contact.channels.hoursBody" fallback="Monday – Friday, 9 AM – 6 PM UTC" />
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="space-y-3 p-6">
              <Badge variant="accent" className="gap-1.5">
                <MessageSquare className="size-3" aria-hidden="true" />
                <T k="contact.demo.badge" fallback="Evaluators" />
              </Badge>
              <h3 className="text-sm font-semibold">
                <T k="contact.demo.title" fallback="Try it without an account" />
              </h3>
              <p className="text-xs text-muted-foreground">
                <T
                  k="contact.demo.body2"
                  fallback="The sign-in page has one-click demo login for all three roles. No email, no password — just click and go."
                />
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/login#demo">
                  <T k="auth.openDemoLogin" fallback="Open demo login" />
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-3 text-sm font-semibold">
                <T k="contact.quickTitle" fallback="Quick answers" />
              </h3>
              <Accordion type="single" collapsible>
                {QUICK_FAQS.map((faq, index) => (
                  <AccordionItem key={faq.questionKey} value={`quick-${index}`}>
                    <AccordionTrigger className="text-left text-xs">
                      <T k={faq.questionKey} fallback={faq.questionKey} />
                    </AccordionTrigger>
                    <AccordionContent className="text-xs">
                      <T k={faq.answerKey} fallback={faq.answerKey} />
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
