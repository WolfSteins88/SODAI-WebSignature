"use client";
import Image from "next/image";
import { useState } from "react";
import type { VillaImage } from "@/lib/schemas/content";
export function Photo({
  image,
  hero = false,
  sizes = "(max-width: 700px) 100vw, 50vw",
  className = "",
  mainPhoto = false,
}: {
  image: VillaImage;
  hero?: boolean;
  sizes?: string;
  className?: string;
  mainPhoto?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const failed = failedSource === image.src;
  return (
    <div className={`std-photo ${className}`} data-signature-main-photo={mainPhoto || undefined}>
      {failed ? (
        <div className="std-photo-fallback" role="img" aria-label={image.alt}>
          <span>Photograph unavailable</span>
          <small>{image.alt}</small>
        </div>
      ) : (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          preload={hero}
          loading={hero ? "eager" : "lazy"}
          unoptimized={image.src.includes("?draft=1")}
          onError={() => setFailedSource(image.src)}
          draggable={false}
          style={image.focalPoint ? { objectPosition: `${image.focalPoint.x}% ${image.focalPoint.y}%` } : undefined}
        />
      )}
    </div>
  );
}
