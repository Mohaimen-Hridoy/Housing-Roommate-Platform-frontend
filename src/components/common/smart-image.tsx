import { ImageIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/lib/types/api";

/** Deterministic, non-placeholder artwork for listings without photos. */
const FALLBACK_GRADIENTS = [
  "from-sky-200 via-sky-100 to-slate-200",
  "from-emerald-200 via-emerald-100 to-slate-200",
  "from-amber-200 via-orange-100 to-slate-200",
  "from-violet-200 via-fuchsia-100 to-slate-200",
  "from-rose-200 via-pink-100 to-slate-200",
  "from-teal-200 via-cyan-100 to-slate-200",
];

export function fallbackGradient(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length];
}

interface SmartImageProps {
  image?: ImageAsset | null;
  alt: string;
  seed?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * `next/image` wrapper that renders a deterministic gradient tile instead of a
 * broken image when an entity has no photos yet.
 */
export function SmartImage({
  image,
  alt,
  seed,
  fill = true,
  width,
  height,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className,
  priority = false,
}: SmartImageProps) {
  const key = image?.id ?? seed ?? alt;

  if (!image?.url) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
          fill ? "absolute inset-0 size-full" : "h-48 w-full rounded-lg",
          fallbackGradient(key),
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="size-8 text-slate-500/60" aria-hidden="true" />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={image.url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={image.url}
      alt={alt}
      width={width ?? 640}
      height={height ?? 420}
      sizes={sizes}
      priority={priority}
      className={cn("h-auto w-full rounded-lg object-cover", className)}
    />
  );
}

interface ImageGalleryProps {
  images: ImageAsset[];
  alt: string;
  seed?: string;
  className?: string;
}

/** Responsive photo grid: one hero shot plus a thumbnail strip. */
export function ImageGallery({ images, alt, seed, className }: ImageGalleryProps) {
  const ordered = [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.position - b.position);
  const [hero, ...rest] = ordered;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-muted">
        <SmartImage image={hero} alt={alt} seed={seed} priority sizes="(max-width: 1024px) 100vw, 66vw" />
      </div>
      {rest.length > 0 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {rest.slice(0, 5).map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              <SmartImage image={image} alt={`${alt} — photo ${image.position + 1}`} sizes="20vw" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
