import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface BarbershopLogoProps {
  name?: string | null;
  logoUrl?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

function getBarbershopInitials(name?: string | null) {
  const words = (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "CF";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function normalizeLogoUrl(logoUrl?: string | null) {
  const value = logoUrl?.trim();
  if (!value) return undefined;
  if (value === "null" || value === "undefined") return undefined;
  return value;
}

export function BarbershopLogo({
  name,
  logoUrl,
  className,
  imageClassName,
  fallbackClassName,
}: BarbershopLogoProps) {
  const initials = getBarbershopInitials(name);
  const normalizedLogoUrl = normalizeLogoUrl(logoUrl);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [normalizedLogoUrl]);

  return (
    <Avatar className={cn("rounded-full", className)}>
      {normalizedLogoUrl && !imageFailed ? (
        <AvatarImage
          src={normalizedLogoUrl}
          alt={name || "Barbershop logo"}
          className={cn("object-cover", imageClassName)}
          onError={() => setImageFailed(true)}
        />
      ) : null}
      <AvatarFallback
        className={cn(
          "rounded-full border border-border/40 bg-primary/10 text-primary font-semibold uppercase",
          fallbackClassName,
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
