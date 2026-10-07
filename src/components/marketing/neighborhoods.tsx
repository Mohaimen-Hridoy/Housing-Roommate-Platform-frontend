import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/brand/reveal";
import { Badge } from "@/components/ui/badge";
import { T } from "@/components/common/localized-text";

const NEIGHBORHOODS = [
  {
    name: "Gulshan & Banani",
    city: "Dhaka",
    listingsCount: "240+ spaces",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=700&q=80",
    query: "Gulshan",
    featuredBadge: "Premium Hub",
  },
  {
    name: "Dhanmondi",
    city: "Dhaka",
    listingsCount: "185+ spaces",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=700&q=80",
    query: "Dhanmondi",
    featuredBadge: "Student Favorite",
  },
  {
    name: "Uttara & Mirpur",
    city: "Dhaka",
    listingsCount: "310+ spaces",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=700&q=80",
    query: "Uttara",
    featuredBadge: "Metro Connected",
  },
  {
    name: "Chittagong City",
    city: "Chittagong",
    listingsCount: "95+ spaces",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=700&q=80",
    query: "Chittagong",
    featuredBadge: "Port City",
  },
];

export function NeighborhoodsSection() {
  return (
    <section className="container-page py-16">
      <Reveal distance={20}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Badge variant="accent" className="mb-2.5">
              <T k="home.exploreBadge" fallback="Top Destinations" />
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <T k="home.neighborhoodsTitle" fallback="Explore popular neighborhoods" />
            </h2>
            <p className="mt-2 text-muted-foreground">
              <T
                k="home.neighborhoodsSubtitle"
                fallback="Find verified rooms and flats in the most vibrant student & corporate hubs."
              />
            </p>
          </div>
          <Link
            href="/properties"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <T k="home.viewAllLocations" fallback="View all areas" />
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {NEIGHBORHOODS.map((item, index) => (
          <Reveal key={item.name} as="article" distance={18} delay={index * 0.08}>
            <Link
              href={`/properties?search=${encodeURIComponent(item.query)}`}
              className="group surface-raised glow-ring relative block aspect-[4/5] overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-opacity duration-300 group-hover:from-black/90" />

              {/* Top badge */}
              <div className="absolute left-3 top-3">
                <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[0.6875rem] font-medium text-white backdrop-blur-md">
                  {item.featuredBadge}
                </span>
              </div>

              {/* Bottom content */}
              <div className="absolute inset-x-4 bottom-4 text-white">
                <p className="flex items-center gap-1 text-xs font-medium text-emerald-300">
                  <MapPin className="size-3" />
                  {item.city}
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-white group-hover:text-emerald-200 transition-colors">
                  {item.name}
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-white/80">
                  <span>{item.listingsCount}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-white group-hover:translate-x-0.5 transition-transform">
                    Explore
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

