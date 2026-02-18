import { MapPin, Clock, Heart, Bath, BedDouble, Maximize, Tag, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface PropertyCardProps {
  listing: any;
  index?: number;
  timeAgo?: string;
}

const PropertyCard = ({ listing, index = 0, timeAgo }: PropertyCardProps) => {
  const isProperty = listing.type?.toLowerCase() === "apartment" || listing.type?.toLowerCase() === "house" || listing.type?.toLowerCase() === "studio" || listing.type?.toLowerCase() === "villa";
  const profile = listing.profiles;
  const sellerName = profile?.full_name || profile?.username || "Seller";
  const sellerAvatar = profile?.avatar_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/property/${listing.id}`} className="group block">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={listing.images?.[0] || "/placeholder.svg"}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
            <div className="absolute left-3 top-3 flex gap-1.5">
              {listing.type && (
                <Badge className="bg-accent text-accent-foreground border-0">{listing.type}</Badge>
              )}
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <span className="font-display text-xl font-bold text-primary-foreground">
                KES {Number(listing.price).toLocaleString()}
                {isProperty && <span className="text-sm font-normal opacity-80">/mo</span>}
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-card-foreground line-clamp-1 group-hover:text-accent transition-colors">
              {listing.title}
            </h3>
            {listing.location && (
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{listing.location}{listing.county ? `, ${listing.county}` : ""}</span>
              </div>
            )}

            <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
              {isProperty ? (
                <>
                  {listing.bedrooms && (
                    <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{listing.bedrooms} Beds</span>
                  )}
                  {listing.bathrooms && (
                    <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{listing.bathrooms} Baths</span>
                  )}
                  {listing.size && (
                    <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{listing.size}</span>
                  )}
                </>
              ) : (
                <>
                  {listing.type && (
                    <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{listing.type}</span>
                  )}
                  {listing.size && (
                    <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{listing.size}</span>
                  )}
                </>
              )}
            </div>

            {/* Seller info + time */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {sellerAvatar ? (
                  <img src={sellerAvatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                <span className="text-xs text-muted-foreground">{sellerName}</span>
              </div>
              {timeAgo && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
