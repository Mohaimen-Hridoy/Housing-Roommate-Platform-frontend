import Image from "next/image";

import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/lib/types/api";

/** Curated high-resolution real interior and architectural photography. */
export const CURATED_ROOM_PHOTOS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1502005229762-ae1b466420f2?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80",
];

export function fallbackPhoto(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return CURATED_ROOM_PHOTOS[hash % CURATED_ROOM_PHOTOS.length];
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
 * `next/image` wrapper that renders high-resolution curated architectural photography
 * when an entity has no photos uploaded yet.
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
  const photoSrc = image?.url || fallbackPhoto(key);

  if (fill) {
    return (
      <Image
        src={photoSrc}
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
      src={photoSrc}
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
export function ImageGallery({ images = [], alt, seed, className }: ImageGalleryProps) {
  const safeImages = Array.isArray(images) ? images : [];
  const ordered = [...safeImages].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.position - b.position);
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

