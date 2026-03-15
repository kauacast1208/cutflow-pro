import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationMapProps {
  address: string;
  name: string;
  addressComplement?: string;
}

export function LocationMap({ address, name, addressComplement }: LocationMapProps) {
  if (!address) return null;

  const encodedAddress = encodeURIComponent(`${address}${addressComplement ? `, ${addressComplement}` : ""}`);
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=&layer=mapnik&marker=&query=${encodedAddress}`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <div className="relative w-full h-[180px] sm:h-[200px] bg-muted">
        <iframe
          title={`Localização de ${name}`}
          src={mapSrc}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{address}</p>
            {addressComplement && (
              <p className="text-xs text-muted-foreground truncate">{addressComplement}</p>
            )}
          </div>
        </div>
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="rounded-xl h-8 gap-1.5 text-xs shrink-0">
            <Navigation className="h-3 w-3" />
            Como chegar
          </Button>
        </a>
      </div>
    </div>
  );
}
