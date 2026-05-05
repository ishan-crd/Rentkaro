import { Property } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Bed, Star, ShieldCheck } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/properties/${property.id}`} className="group h-full flex block">
      <Card className="w-full flex flex-col overflow-hidden transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {property.images && property.images.length > 0 ? (
            <img 
              src={property.images[0]} 
              alt={property.title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <img 
              src={`https://picsum.photos/seed/${property.id}/600/400`} 
              alt={property.title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div className="absolute top-2 right-2 flex gap-1 flex-col items-end">
            <Badge variant={property.genderPreference === 'female' ? "destructive" : property.genderPreference === 'male' ? "secondary" : "default"} className="shadow-sm font-semibold capitalize text-xs">
              {property.genderPreference === 'any' ? 'Unisex' : property.genderPreference} Only
            </Badge>
            {property.rating ? (
              <Badge variant="secondary" className="shadow-sm font-semibold flex items-center gap-1 bg-white/90 text-black border-none hover:bg-white/90">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {property.rating.toFixed(1)}
              </Badge>
            ) : null}
          </div>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors" title={property.title}>
              {property.title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {property.address}, {property.city}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            <Badge variant="outline" className="text-xs bg-muted/50 capitalize font-medium flex items-center gap-1">
              <Bed className="w-3 h-3" />
              {property.roomType}
            </Badge>
            {property.sentimentScore !== undefined && property.sentimentScore !== null && (
              <SentimentBadge score={property.sentimentScore} />
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 border-t border-border/50 bg-muted/20 flex justify-between items-center mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Monthly Rent</span>
            <span className="text-lg font-bold text-primary">₹{property.rent.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            Deposit: ₹{property.deposit.toLocaleString('en-IN')}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
