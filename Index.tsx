import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Search, MessageSquare, ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const { settings } = usePlatformSettings();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [listingsRes, catsRes] = await Promise.all([
      supabase
        .from("listings")
        .select("*, profiles:user_id(username, avatar_url, full_name)")
        .eq("status", "approved")
        .eq("is_active", true)
        .eq("is_suspended", false)
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").eq("is_active", true).order("name"),
    ]);
    const data = listingsRes.data || [];
    setListings(data);
    setFilteredListings(data);
    setCategories(catsRes.data || []);
    setLoading(false);
  };

  const handleSearch = (filters: { location: string; category: string; sort: string }) => {
    let results = [...listings];
    if (filters.location) {
      const q = filters.location.toLowerCase();
      results = results.filter(
        (p) =>
          p.location?.toLowerCase().includes(q) ||
          p.county?.toLowerCase().includes(q) ||
          p.country?.toLowerCase().includes(q)
      );
    }
    if (filters.category !== "All") {
      results = results.filter((p) => p.type?.toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.sort === "price-low") results.sort((a, b) => a.price - b.price);
    if (filters.sort === "price-high") results.sort((a, b) => b.price - a.price);
    if (filters.sort === "newest") results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (filters.sort === "oldest") results.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    setFilteredListings(results);
    setActiveCategory(filters.category);
  };

  const filterByCategory = (cat: string) => {
    setActiveCategory(cat);
    if (cat === "All") {
      setFilteredListings(listings);
    } else {
      setFilteredListings(listings.filter((p) => {
        const catObj = categories.find((c) => c.name === cat);
        return catObj && catObj.types?.some((t: string) => t.toLowerCase() === p.type?.toLowerCase());
      }));
    }
  };

  const categoryNames = ["All", ...categories.map((c) => c.name)];

  const socialLinks = [
    { url: settings.social_facebook, icon: Facebook, label: "Facebook" },
    { url: settings.social_twitter, icon: Twitter, label: "Twitter" },
    { url: settings.social_instagram, icon: Instagram, label: "Instagram" },
    { url: settings.social_youtube, icon: Youtube, label: "YouTube" },
    { url: settings.social_linkedin, icon: Linkedin, label: "LinkedIn" },
  ].filter((s) => s.url);

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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={settings.background_url || heroBg} alt="Marketplace" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/90" />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex items-center justify-center gap-3">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-16 w-16 rounded-2xl object-cover shadow-lg" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-lg">
                  <ShoppingBag className="h-8 w-8 text-accent-foreground" />
                </div>
              )}
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
              {settings.platform_name || "RentHub"}
            </h1>
            <p className="mt-3 text-lg text-primary-foreground/80 md:text-xl">
              {settings.slogan || "Your One-Stop Marketplace"}
            </p>
            {!user && (
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8">
                    Sign Up Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
            {user && (
              <div className="mt-8">
                <Link to="/list-property">
                  <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8">
                    List an Item <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { icon: Search, title: "Easy Search", desc: "Find anything by location, category, and price" },
              { icon: Shield, title: "Verified Listings", desc: "All listings are reviewed and approved" },
              { icon: MessageSquare, title: "Instant Chat", desc: "Message sellers directly in-app" },
              { icon: ShoppingBag, title: "List & Earn", desc: "List anything and reach thousands of buyers" },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground">Browse Listings</h2>
            <p className="mt-1 text-muted-foreground">Find what you need from our curated marketplace</p>
          </div>

          <SearchBar categories={categoryNames} onSearch={handleSearch} />

          <div className="mt-6 flex flex-wrap gap-2">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => filterByCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-12 text-center text-muted-foreground">Loading listings...</div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((listing, i) => (
                <PropertyCard
                  key={listing.id}
                  listing={listing}
                  index={i}
                  timeAgo={getTimeAgo(listing.created_at)}
                />
              ))}
            </div>
          )}

          {!loading && filteredListings.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">No listings found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Support */}
      <section className="border-t border-border bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Customer Support</h2>
              <p className="mt-2 text-muted-foreground">Need help? Reach out to us through any of these channels.</p>
              <div className="mt-6 space-y-4">
                {settings.support_email && (
                  <a href={`mailto:${settings.support_email}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Email Us</p>
                      <p className="text-sm text-muted-foreground">{settings.support_email}</p>
                    </div>
                  </a>
                )}
                {settings.support_phone && (
                  <a href={`https://wa.me/${settings.support_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-success">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                      <Phone className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">{settings.support_phone}</p>
                    </div>
                  </a>
                )}
                {(settings.support_location_city || settings.support_location_area) && (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Location</p>
                      <p className="text-sm text-muted-foreground">{[settings.support_location_city, settings.support_location_area].filter(Boolean).join(", ")}</p>
                    </div>
                  </div>
                )}
                {!settings.support_email && !settings.support_phone && (
                  <p className="text-sm text-muted-foreground">Contact details not configured yet.</p>
                )}
              </div>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Follow Us</h2>
              <p className="mt-2 text-muted-foreground">Stay connected on social media for the latest updates.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {socialLinks.length > 0 ? (
                  socialLinks.map((social) => (
                    <a key={social.label} href={social.url!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-card-foreground transition-colors hover:border-primary hover:bg-primary/5">
                      <social.icon className="h-5 w-5 text-primary" />
                      {social.label}
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Social links not configured yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
