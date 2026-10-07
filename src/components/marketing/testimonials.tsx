import { Star, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/brand/reveal";
import { T } from "@/components/common/localized-text";

interface Testimonial {
  name: string;
  role: string;
  location: string;
  avatarText: string;
  rating: number;
  quote: string;
  highlight: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Tanvir Ahmed",
    role: "Computer Science Student",
    location: "Dhanmondi, Dhaka",
    avatarText: "TA",
    rating: 5,
    quote:
      "Finding a bachelor roommate in Dhaka without giving high broker commissions used to be impossible. NestSpace let me browse verified single rooms, chat directly with the owner, and book securely.",
    highlight: "Zero broker fees",
  },
  {
    name: "Dr. Nusrat Jahan",
    role: "Property Owner",
    location: "Gulshan, Dhaka",
    avatarText: "NJ",
    rating: 5,
    quote:
      "Managing 4 flats across Banani was chaotic before. Now, tenant background verifications, monthly rent collection via Stripe, and booking approvals happen right from my NestSpace owner dashboard.",
    highlight: "Seamless rent tracking",
  },
  {
    name: "Shahriar Kabir",
    role: "Software Engineer",
    location: "GEC Circle, Chittagong",
    avatarText: "SK",
    rating: 5,
    quote:
      "I relocated from Dhaka to Chittagong for a new job. The room photos and amenities matched 100% in person. The 3-step booking flow took less than 2 minutes. Highly recommended!",
    highlight: "100% verified listings",
  },
];

export function TestimonialsSection() {
  return (
    <section className="container-page py-16 lg:py-20">
      <Reveal distance={20}>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="accent" className="mb-3">
            <T k="home.communityBadge" fallback="Community Stories" />
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <T k="home.testimonialsTitle" fallback="Loved by tenants & homeowners alike" />
          </h2>
          <p className="mt-3 text-muted-foreground">
            <T
              k="home.testimonialsSubtitle"
              fallback="Real feedback from students, professionals, and owners who found their comfort through NestSpace."
            />
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((item, index) => (
          <Reveal key={item.name} as="article" distance={18} delay={index * 0.08}>
            <Card className="interactive-surface glow-ring relative flex h-full flex-col justify-between overflow-hidden border-border/80 bg-card/80 p-6 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <Badge variant="secondary" className="text-xs font-semibold text-primary">
                    {item.highlight}
                  </Badge>
                </div>

                <p className="text-sm leading-relaxed text-foreground">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                <Avatar className="size-10 border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                  <AvatarFallback>{item.avatarText}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                    {item.name}
                    <CheckCircle2 className="size-3.5 shrink-0 text-success" aria-label="Verified user" />
                  </p>
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {item.role} · {item.location}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
