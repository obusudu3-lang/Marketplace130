import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, BedDouble, Bath, Maximize, Clock, ChevronLeft, ChevronRight,
  MessageSquare, Share2, Flag, Tag, User,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      const { data } = await supabase
        .from("listings")
        .select("*, profiles:user_id(username, avatar_url, full_name, phone)")
        .eq("id", id)
        .single();
      setListing(data);
      setLoading(false);
    };
    if (id) fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-24">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-24">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground">Listing Not Found</h1>
            <Link to="/"><Button className="mt-4 bg-accent text-accent-foreground">Back to Home</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const images = listing.images || [];
  const profile = listing.profiles;
  const sellerName = profile?.full_name || profile?.username || "Seller";
  const sellerAvatar = profile?.avatar_url;
  const isProperty = ["apartment", "house", "studio", "villa"].includes(listing.type?.toLowerCase() || "");

  const chatLink = user ? `/chat?seller=${listing.user_id}&name=${encodeURIComponent(sellerName)}&avatar=${encodeURIComponent(sellerAvatar || "")}&item=${encodeURIComponent(listing.title)}` : "/auth";

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        {images.length > 0 && (
          <>
            <div className="relative overflow-hidden rounded-2xl">
              <div className="aspect-[16/9] md:aspect-[21/9]">
                <img src={images[currentImage]} alt={listing.title} className="h-full w-full object-cover" />
              </div>
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage((p) => (p > 0 ? p - 1 : images.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setCurrentImage((p) => (p < images.length - 1 ? p + 1 : 0))} className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_: string, i: number) => (
                  <button key={i} onClick={() => setCurrentImage(i)} className={`h-2 w-2 rounded-full transition-all ${i === currentImage ? "w-6 bg-accent" : "bg-card/60"}`} />
                ))}
              </div>
            </div>
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img: string, i: number) => (
                  <button key={i} onClick={() => setCurrentImage(i)} className={`overflow-hidden rounded-lg border-2 transition-colors ${i === currentImage ? "border-accent" : "border-transparent"}`}>
                    <img src={img} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Details */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex gap-2">
                  {listing.type && <Badge className="bg-accent text-accent-foreground border-0">{listing.type}</Badge>}
                </div>
                <h1 className="mt-2 font-display text-3xl font-bold text-foreground">{listing.title}</h1>
                {listing.location && (
                  <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {listing.location}{listing.county ? `, ${listing.county}` : ""}{listing.country ? `, ${listing.country}` : ""}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  {sellerAvatar ? (
                    <img src={sellerAvatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted"><User className="h-3.5 w-3.5 text-muted-foreground" /></div>
                  )}
                  <span>Listed by <strong className="text-foreground">{sellerName}</strong></span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="text-destructive"><Flag className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {isProperty ? (
                [
                  { icon: BedDouble, label: "Bedrooms", value: listing.bedrooms },
                  { icon: Bath, label: "Bathrooms", value: listing.bathrooms },
                  { icon: Maximize, label: "Size", value: listing.size },
                ].filter(d => d.value).map((d) => (
                  <div key={d.label} className="rounded-xl border border-border bg-card p-4 text-center">
                    <d.icon className="mx-auto h-5 w-5 text-accent" />
                    <p className="mt-2 text-lg font-bold text-card-foreground">{d.value}</p>
                    <p className="text-xs text-muted-foreground">{d.label}</p>
                  </div>
                ))
              ) : (
                [
                  { icon: Tag, label: "Type", value: listing.type },
                  { icon: Maximize, label: "Specs", value: listing.size },
                  { icon: Clock, label: "Listed", value: listing.created_at ? getTimeAgo(listing.created_at) : "" },
                ].filter(d => d.value).map((d) => (
                  <div key={d.label} className="rounded-xl border border-border bg-card p-4 text-center">
                    <d.icon className="mx-auto h-5 w-5 text-accent" />
                    <p className="mt-2 text-lg font-bold text-card-foreground">{d.value}</p>
                    <p className="text-xs text-muted-foreground">{d.label}</p>
                  </div>
                ))
              )}
            </div>

            {listing.description && (
              <div className="mt-6">
                <h2 className="font-display text-xl font-bold text-foreground">Description</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{listing.description}</p>
              </div>
            )}
          </motion.div>

          {/* Price Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">{isProperty ? "Monthly Rent" : "Price"}</p>
              <p className="font-display text-3xl font-bold text-foreground">
                KES {Number(listing.price).toLocaleString()}
                {isProperty && <span className="text-base font-normal text-muted-foreground">/mo</span>}
              </p>
              {listing.created_at && (
                <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Listed {getTimeAgo(listing.created_at)}
                </div>
              )}
              {user ? (
                <Link to={chatLink}>
                  <Button className="mt-6 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <MessageSquare className="h-4 w-4" />
                    Contact Seller
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button className="mt-6 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <MessageSquare className="h-4 w-4" />
                    Sign In to Contact
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
