import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProfessionalAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
  imageClassName?: string;
}

export function ProfessionalAvatar({
  name,
  avatarUrl,
  className,
  fallbackClassName,
  imageClassName,
}: ProfessionalAvatarProps) {
  const normalizedAvatarUrl = typeof avatarUrl === "string" && avatarUrl.trim() && avatarUrl !== "null" && avatarUrl !== "undefined"
    ? avatarUrl
    : undefined;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [normalizedAvatarUrl]);

  return (
    <Avatar className={className}>
      {normalizedAvatarUrl && !imageFailed ? (
        <AvatarImage
          src={normalizedAvatarUrl}
          alt={name || "Professional"}
          className={imageClassName}
          onError={() => setImageFailed(true)}
        />
      ) : null}
      <AvatarFallback className={cn("bg-primary/10 font-bold text-primary", fallbackClassName)}>
        {getInitials(name || "Professional")}
      </AvatarFallback>
    </Avatar>
  );
}
