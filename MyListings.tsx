import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Edit, Eye, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Under Review", color: "bg-warning/10 text-warning border-warning/30", icon: Clock },
  approved: { label: "Approved", color: "bg-success/10 text-success border-success/30", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/30", icon: XCircle },
};

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">My Listings</h1>
              <p className="mt-1 text-muted-foreground">Track the status of your listed items</p>
            </div>
            <Link to="/list-property">
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Package className="h-4 w-4" /> New Listing
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="mt-12 text-center text-muted-foreground">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="mt-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-foreground">No listings yet</p>
              <p className="text-muted-foreground">Start by creating your first listing</p>
              <Link to="/list-property">
                <Button className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">Create Listing</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {listings.map((listing, i) => {
                const config = statusConfig[listing.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card"
                  >
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt="" className="h-20 w-20 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-card-foreground truncate">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {listing.location && `${listing.location}, `}{listing.county}
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        KES {Number(listing.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${config.color}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {config.label}
                      </div>
                      {listing.status === "rejected" && listing.reject_reason && (
                        <p className="text-xs text-destructive max-w-[200px] text-right">{listing.reject_reason}</p>
                      )}
                      <div className="flex gap-1">
                        <Link to={`/property/${listing.id}`}>
                          <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                        </Link>
                        <Link to={`/edit-listing/${listing.id}`}>
                          <Button variant="ghost" size="sm"><Edit className="h-3.5 w-3.5" /></Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default MyListings;
