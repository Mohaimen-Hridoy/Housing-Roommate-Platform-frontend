"use client";

import { ImageIcon, Star, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { SmartImage } from "@/components/common/smart-image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOwnerMutation } from "@/components/dashboard/owner/use-owner-mutation";
import { formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/lib/types/api";

/** Backend constraints: `UPLOAD_MAX_FILES` 6, `UPLOAD_MAX_FILE_SIZE_MB` 5. */
const MAX_FILES = 6;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];

interface PickedFile {
  key: string;
  file: File;
  url: string;
}

interface PhotosPanelProps {
  propertyId: string;
  images: ImageAsset[];
  onImagesChange: (images: ImageAsset[]) => void;
}

/** Photo gallery for a property: preview, upload, set primary and delete. */
export function PhotosPanel({ propertyId, images, onImagesChange }: PhotosPanelProps) {
  const { pendingKey, run } = useOwnerMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<PickedFile[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<ImageAsset | null>(null);
  const [dragging, setDragging] = useState(false);

  const pickedRef = useRef<PickedFile[]>([]);
  useEffect(() => {
    pickedRef.current = picked;
  }, [picked]);
  useEffect(
    () => () => {
      for (const entry of pickedRef.current) URL.revokeObjectURL(entry.url);
    },
    [],
  );

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const current = pickedRef.current;
    const problems: string[] = [];
    const seen = new Set(current.map((entry) => entry.key));
    const accepted: PickedFile[] = [];

    for (const file of Array.from(fileList)) {
      if (!ALLOWED_MIME.includes(file.type)) {
        problems.push(`${file.name} is not a supported image type`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        problems.push(`${file.name} is ${formatFileSize(file.size)} — the limit is 5 MB`);
        continue;
      }
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (seen.has(key)) continue;
      seen.add(key);
      accepted.push({ key, file, url: URL.createObjectURL(file) });
    }

    const room = Math.max(MAX_FILES - current.length, 0);
    if (accepted.length > room) {
      problems.push(`Only ${MAX_FILES} files can be uploaded at once`);
    }

    const kept = accepted.slice(0, room);
    for (const entry of accepted.slice(room)) URL.revokeObjectURL(entry.url);

    setPicked([...current, ...kept]);
    setRejected(problems);
  };

  const removePicked = (key: string) => {
    const target = pickedRef.current.find((entry) => entry.key === key);
    if (target) URL.revokeObjectURL(target.url);
    setPicked(pickedRef.current.filter((entry) => entry.key !== key));
  };

  const clearPicked = () => {
    for (const entry of pickedRef.current) URL.revokeObjectURL(entry.url);
    setPicked([]);
    setRejected([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const uploading = pendingKey === "upload";

  const upload = async () => {
    if (picked.length === 0) return;
    const formData = new FormData();
    for (const entry of picked) {
      formData.append("images", entry.file, entry.file.name);
    }

    const created = await run<ImageAsset[]>("upload", `/properties/${propertyId}/images`, {
      method: "POST",
      formData,
      successMessage: `${picked.length} photo${picked.length === 1 ? "" : "s"} uploaded.`,
    });

    if (created) {
      onImagesChange([...images, ...created]);
      clearPicked();
    }
  };

  const setPrimary = async (image: ImageAsset) => {
    const updated = await run<ImageAsset>(`primary-${image.id}`, `/images/${image.id}/primary`, {
      method: "PATCH",
      body: {},
      successMessage: "Cover photo updated.",
    });
    if (updated) {
      onImagesChange(
        images.map((entry) =>
          entry.id === updated.id
            ? { ...updated, isPrimary: true }
            : { ...entry, isPrimary: false, position: entry.position },
        ),
      );
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const result = await run(`delete-${deleting.id}`, `/images/${deleting.id}`, {
      method: "DELETE",
      successMessage: "Photo removed.",
    });
    if (result) {
      onImagesChange(images.filter((entry) => entry.id !== deleting.id));
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      <Alert variant="default">
        <UploadCloud className="shrink-0" aria-hidden="true" />
        <AlertDescription>
          Up to <strong>{MAX_FILES} files</strong> per upload, <strong>5 MB</strong> each. Accepted types: JPEG, PNG,
          WebP and AVIF. The first photo becomes the cover image shown in search results.
        </AlertDescription>
      </Alert>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-muted/20",
        )}
      >
        <p className="text-sm font-medium">Drag photos here</p>
        <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP or AVIF · 5 MB max · {MAX_FILES} per upload</p>
        <input
          ref={inputRef}
          id={`property-photos-${propertyId}`}
          type="file"
          multiple
          accept={ALLOWED_MIME.join(",")}
          className="sr-only"
          onChange={(event) => addFiles(event.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
          disabled={picked.length >= MAX_FILES}
        >
          <UploadCloud />
          Choose photos
        </Button>
        {picked.length >= MAX_FILES ? (
          <p className="mt-2 text-xs font-medium text-warning">Upload or remove a file to add more.</p>
        ) : null}
      </div>

      {rejected.length > 0 ? (
        <Alert variant="warning">
          <AlertDescription>
            <ul className="list-disc space-y-0.5 pl-4">
              {rejected.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      {picked.length > 0 ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {picked.length} file{picked.length === 1 ? "" : "s"} ready to upload
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={clearPicked} disabled={uploading}>
                Discard
              </Button>
              <Button type="button" size="sm" onClick={upload} loading={uploading}>
                <UploadCloud />
                Upload
              </Button>
            </div>
          </div>

          {uploading ? (
            <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
              Uploading {picked.length} file{picked.length === 1 ? "" : "s"} to the server — keep this tab open.
            </p>
          ) : null}

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {picked.map((entry) => (
              <li key={entry.key} className="space-y-1.5">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  {/* Local blob preview — rendered as a background because `next/image` cannot optimise `blob:` sources. */}
                  <div
                    role="img"
                    aria-label={entry.file.name}
                    className="size-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${entry.url})` }}
                  />
                  <button
                    type="button"
                    onClick={() => removePicked(entry.key)}
                    className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    aria-label={`Remove ${entry.file.name}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <p className="truncate text-[11px] text-muted-foreground" title={entry.file.name}>
                  {entry.file.name}
                </p>
                <p className="text-[11px] text-muted-foreground">{formatFileSize(entry.file.size)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {images.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No photos yet"
          description="Listings with cover photos get far more booking requests. Upload at least one image to get started."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {images.length} photo{images.length === 1 ? "" : "s"} on this listing
          </p>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <li key={image.id} className="space-y-2 rounded-xl border border-border bg-card p-2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <SmartImage image={image} alt={`Photo ${image.position + 1}`} sizes="25vw" />
                  {image.isPrimary ? (
                    <span className="absolute left-2 top-2">
                      <Badge variant="info" className="gap-1">
                        <Star className="size-3" aria-hidden="true" />
                        Cover
                      </Badge>
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{formatFileSize(image.bytes)}</span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={image.isPrimary || pendingKey === `primary-${image.id}`}
                      onClick={() => void setPrimary(image)}
                    >
                      <Star />
                      Cover
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleting(image)}
                      aria-label={`Delete photo ${image.position + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this photo?"
        description="The image is removed from the listing and from storage. This cannot be undone."
        confirmLabel="Delete photo"
        destructive
        loading={deleting !== null && pendingKey === `delete-${deleting.id}`}
        onConfirm={remove}
      />
    </div>
  );
}
