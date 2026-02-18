import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, Settings, Bell, BarChart3, LogOut, Shield,
  Search, Ban, Eye, EyeOff, Upload, CheckCircle, XCircle,
  DollarSign, MapPin, CreditCard, Plus, Trash2,
  FileText, AlertTriangle, UserPlus, Package, Mail, Phone,
  MessageSquare, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [platformSettings, setPlatformSettings] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationText, setNotificationText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingListing, setRejectingListing] = useState<string | null>(null);
  const [banningUser, setBanningUser] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    if (!isAdmin && !user) navigate("/auth");
  }, [isAdmin, user, navigate]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [settingsRes, usersRes, listingsRes, transRes, catRes] = await Promise.all([
      supabase.from("platform_settings").select("*").limit(1).single(),
      supabase.from("profiles").select("*"),
      supabase.from("listings").select("*, profiles:user_id(username, avatar_url, full_name, phone)").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    if (settingsRes.data) { setPlatformSettings(settingsRes.data); setDisclaimer(settingsRes.data.disclaimer || ""); }
    if (usersRes.data) setUsers(usersRes.data);
    if (listingsRes.data) setListings(listingsRes.data);
    if (transRes.data) setTransactions(transRes.data);
    if (catRes.data) setCategories(catRes.data);
  };

  const updateSettings = async (updates: any) => {
    const { error } = await supabase.from("platform_settings").update(updates).eq("id", platformSettings.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { setPlatformSettings({ ...platformSettings, ...updates }); toast({ title: "Settings Saved" }); }
  };

  const uploadFile = async (file: File, path: string) => {
    const ext = file.name.split(".").pop();
    const fileName = `${path}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("uploads").upload(fileName, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const url = await uploadFile(file, "branding"); await updateSettings({ logo_url: url }); }
    catch (err: any) { toast({ title: "Upload Failed", description: err.message, variant: "destructive" }); }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const url = await uploadFile(file, "branding"); await updateSettings({ background_url: url }); }
    catch (err: any) { toast({ title: "Upload Failed", description: err.message, variant: "destructive" }); }
  };

  // User management
  const suspendUser = async (userId: string) => {
    if (!suspendReason.trim()) { toast({ title: "Enter Reason", variant: "destructive" }); return; }
    await supabase.from("profiles").update({ is_suspended: true, suspend_reason: suspendReason }).eq("user_id", userId);
    await supabase.from("notifications").insert({ user_id: userId, title: "Account Suspended", message: `Your account has been suspended. Reason: ${suspendReason}. Contact support for assistance.` });
    setSuspendReason(""); setSelectedUser(null); fetchAll();
    toast({ title: "User Suspended" });
  };

  const reactivateUser = async (userId: string) => {
    await supabase.from("profiles").update({ is_suspended: false, suspend_reason: null }).eq("user_id", userId);
    fetchAll(); toast({ title: "User Reactivated" });
  };

  const banUser = async (userId: string) => {
    if (!banReason.trim()) { toast({ title: "Enter ban reason", variant: "destructive" }); return; }
    await supabase.from("profiles").update({ is_banned: true, is_suspended: true, suspend_reason: `Banned: ${banReason}` }).eq("user_id", userId);
    await supabase.from("notifications").insert({ user_id: userId, title: "Account Banned", message: `Your account has been permanently banned. Reason: ${banReason}.` });
    setBanReason(""); setBanningUser(null); fetchAll();
    toast({ title: "User Banned Permanently" });
  };

  const removeUser = async (userId: string) => {
    // Suspend + ban (we can't delete auth users from client)
    await supabase.from("profiles").update({ is_banned: true, is_suspended: true, suspend_reason: "Account removed by admin" }).eq("user_id", userId);
    await supabase.from("listings").update({ is_active: false }).eq("user_id", userId);
    fetchAll(); toast({ title: "User Removed" });
  };

  // Listing review
  const approveListing = async (listingId: string) => {
    await supabase.from("listings").update({ status: "approved" }).eq("id", listingId);
    const listing = listings.find((l) => l.id === listingId);
    if (listing) {
      await supabase.from("notifications").insert({ user_id: listing.user_id, title: "Listing Approved", message: `Your listing "${listing.title}" has been approved and is now visible to all users.` });
    }
    fetchAll(); toast({ title: "Listing Approved" });
  };

  const rejectListing = async (listingId: string) => {
    if (!rejectReason.trim()) { toast({ title: "Enter rejection reason", variant: "destructive" }); return; }
    await supabase.from("listings").update({ status: "rejected", reject_reason: rejectReason }).eq("id", listingId);
    const listing = listings.find((l) => l.id === listingId);
    if (listing) {
      await supabase.from("notifications").insert({ user_id: listing.user_id, title: "Listing Rejected", message: `Your listing "${listing.title}" has been rejected. Reason: ${rejectReason}. You may edit and resubmit.` });
    }
    setRejectReason(""); setRejectingListing(null); fetchAll();
    toast({ title: "Listing Rejected" });
  };

  const suspendListing = async (listingId: string) => {
    if (!suspendReason.trim()) { toast({ title: "Enter Reason", variant: "destructive" }); return; }
    await supabase.from("listings").update({ is_suspended: true, suspend_reason: suspendReason }).eq("id", listingId);
    const listing = listings.find((l) => l.id === listingId);
    if (listing) {
      await supabase.from("notifications").insert({ user_id: listing.user_id, title: "Listing Suspended", message: `Your listing "${listing.title}" has been suspended. Reason: ${suspendReason}.` });
    }
    setSuspendReason(""); setSelectedListing(null); fetchAll();
    toast({ title: "Listing Suspended" });
  };

  const reactivateListing = async (listingId: string) => {
    await supabase.from("listings").update({ is_suspended: false, suspend_reason: null, status: "approved" }).eq("id", listingId);
    fetchAll(); toast({ title: "Listing Reactivated" });
  };

  const sendNotification = async () => {
    if (!notificationTitle.trim() || !notificationText.trim()) return;
    await supabase.from("notifications").insert({ title: notificationTitle, message: notificationText, is_global: true });
    setNotificationTitle(""); setNotificationText(""); toast({ title: "Notification Sent" });
  };

  const addCategory = async () => {
    if (!newCategoryName.trim() || !newCategorySlug.trim()) return;
    await supabase.from("categories").insert({ name: newCategoryName, slug: newCategorySlug, types: [] });
    setNewCategoryName(""); setNewCategorySlug(""); fetchAll(); toast({ title: "Category Added" });
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    let pwd = "";
    for (let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    return pwd;
  };

  const filteredUsers = users.filter(
    (u) => u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingListings = listings.filter((l) => l.status === "pending");
  const approvedListings = listings.filter((l) => l.status === "approved");
  const rejectedListings = listings.filter((l) => l.status === "rejected");

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-primary" },
    { label: "Pending Review", value: pendingListings.length, icon: Clock, color: "text-warning" },
    { label: "Active Listings", value: approvedListings.filter((l) => !l.is_suspended).length, icon: Package, color: "text-success" },
    { label: "Revenue", value: `KES ${transactions.filter((t) => t.status === "successful").reduce((a, t) => a + Number(t.amount), 0).toLocaleString()}`, icon: DollarSign, color: "text-accent" },
  ];

  const getStatusBadge = (listing: any) => {
    if (listing.is_suspended) return <Badge variant="destructive">Suspended</Badge>;
    if (listing.status === "pending") return <Badge className="bg-warning/10 text-warning border border-warning/30">Under Review</Badge>;
    if (listing.status === "approved") return <Badge className="bg-success/10 text-success border border-success/30">Approved</Badge>;
    if (listing.status === "rejected") return <Badge className="bg-destructive/10 text-destructive border border-destructive/30">Rejected</Badge>;
    return <Badge variant="secondary">{listing.status}</Badge>;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          {platformSettings.logo_url ? (
            <img src={platformSettings.logo_url} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
          )}
          <span className="font-display text-lg font-bold text-sidebar-foreground">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {[
            { icon: BarChart3, label: "Dashboard" },
            { icon: Users, label: "Users" },
            { icon: Package, label: "Listings" },
            { icon: Settings, label: "Settings" },
            { icon: Bell, label: "Notifications" },
            { icon: CreditCard, label: "Payments" },
            { icon: FileText, label: "Transactions" },
          ].map((item) => (
            <button key={item.label} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <Link to="/"><Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"><LogOut className="h-4 w-4" />Exit Admin</Button></Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <h1 className="font-display text-xl font-bold text-foreground">Admin Dashboard</h1>
          <Link to="/" className="lg:hidden"><Button variant="ghost" size="sm"><LogOut className="h-4 w-4" /></Button></Link>
        </header>

        <div className="p-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="mt-2 text-2xl font-bold text-card-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="users" className="mt-8">
            <TabsList className="w-full justify-start flex-wrap">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="listings">
                Listings
                {pendingListings.length > 0 && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground">{pendingListings.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            {/* USERS TAB */}
            <TabsContent value="users" className="mt-4 space-y-4">
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <h3 className="font-semibold text-card-foreground">Manage Users ({users.length})</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Password Reset</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                  {(u.username || "U")[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-card-foreground">{u.full_name || u.username || "---"}</p>
                                <p className="text-xs text-muted-foreground">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{u.phone || "---"}</td>
                          <td className="px-4 py-3">
                            {u.is_banned ? (
                              <Badge variant="destructive">Banned</Badge>
                            ) : u.is_suspended ? (
                              <Badge variant="destructive">Suspended</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {u.password_reset_requested && u.phone ? (
                              <a
                                href={`https://wa.me/${u.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${u.username || "user"}, your new password is: ${generatePassword()}. Please change it after login.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="gap-1 text-success">
                                  <MessageSquare className="h-3.5 w-3.5" /> Send via WhatsApp
                                </Button>
                              </a>
                            ) : u.password_reset_requested ? (
                              <span className="text-xs text-warning">Requested (no phone)</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">---</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {u.is_banned ? (
                                <span className="text-xs text-muted-foreground">Permanently banned</span>
                              ) : u.is_suspended ? (
                                <Button variant="ghost" size="sm" onClick={() => reactivateUser(u.user_id)}>
                                  <CheckCircle className="mr-1 h-3 w-3" /> Reactivate
                                </Button>
                              ) : (
                                <>
                                  {selectedUser === u.user_id ? (
                                    <div className="flex gap-1">
                                      <Input placeholder="Reason..." value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} className="h-8 w-32 text-xs" />
                                      <Button size="sm" variant="destructive" onClick={() => suspendUser(u.user_id)}>Suspend</Button>
                                      <Button size="sm" variant="ghost" onClick={() => setSelectedUser(null)}>Cancel</Button>
                                    </div>
                                  ) : banningUser === u.user_id ? (
                                    <div className="flex gap-1">
                                      <Input placeholder="Ban reason..." value={banReason} onChange={(e) => setBanReason(e.target.value)} className="h-8 w-32 text-xs" />
                                      <Button size="sm" variant="destructive" onClick={() => banUser(u.user_id)}>Ban</Button>
                                      <Button size="sm" variant="ghost" onClick={() => setBanningUser(null)}>Cancel</Button>
                                    </div>
                                  ) : (
                                    <>
                                      <Button variant="ghost" size="sm" className="text-warning" onClick={() => setSelectedUser(u.user_id)}>
                                        <Ban className="h-3 w-3 mr-1" /> Suspend
                                      </Button>
                                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setBanningUser(u.user_id)}>
                                        <Ban className="h-3 w-3 mr-1" /> Ban
                                      </Button>
                                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeUser(u.user_id)}>
                                        <Trash2 className="h-3 w-3 mr-1" /> Remove
                                      </Button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && <p className="p-8 text-center text-muted-foreground">No users found</p>}
                </div>
              </div>
            </TabsContent>

            {/* LISTINGS TAB */}
            <TabsContent value="listings" className="mt-4 space-y-4">
              {/* Disclaimer */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-2 font-semibold text-card-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" /> Listing Disclaimer
                </h3>
                <Input placeholder="Enter disclaimer text (appears on all listings)" value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} />
                <Button className="mt-2" size="sm" onClick={() => updateSettings({ disclaimer })}>Save Disclaimer</Button>
              </div>

              {/* Pending Review */}
              {pendingListings.length > 0 && (
                <div className="rounded-xl border-2 border-warning/30 bg-warning/5 p-4">
                  <h3 className="mb-3 font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" /> Pending Review ({pendingListings.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingListings.map((l) => (
                      <div key={l.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
                        {l.images?.[0] && <img src={l.images[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-card-foreground truncate">{l.title}</p>
                          <p className="text-xs text-muted-foreground">{l.location} - KES {Number(l.price).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">By: {l.profiles?.username || "Unknown"}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" className="gap-1 bg-success text-success-foreground hover:bg-success/90" onClick={() => approveListing(l.id)}>
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </Button>
                          {rejectingListing === l.id ? (
                            <div className="flex gap-1">
                              <Input placeholder="Reason..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="h-8 w-32 text-xs" />
                              <Button size="sm" variant="destructive" onClick={() => rejectListing(l.id)}>Reject</Button>
                              <Button size="sm" variant="ghost" onClick={() => setRejectingListing(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="destructive" className="gap-1" onClick={() => setRejectingListing(l.id)}>
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Listings Table */}
              <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border p-4">
                  <h3 className="font-semibold text-card-foreground">All Listings ({listings.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Listing</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Seller</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((l) => (
                        <tr key={l.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {l.images?.[0] && <img src={l.images[0]} alt="" className="h-10 w-10 rounded object-cover" />}
                              <span className="font-medium text-card-foreground truncate max-w-[200px]">{l.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">KES {Number(l.price).toLocaleString()}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{l.profiles?.username || "---"}</td>
                          <td className="px-4 py-3">{getStatusBadge(l)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {l.status === "pending" && (
                                <>
                                  <Button variant="ghost" size="sm" className="text-success" onClick={() => approveListing(l.id)}>
                                    <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setRejectingListing(l.id)}>
                                    <XCircle className="h-3 w-3 mr-1" /> Reject
                                  </Button>
                                </>
                              )}
                              {l.status === "approved" && !l.is_suspended && (
                                selectedListing === l.id ? (
                                  <div className="flex gap-1">
                                    <Input placeholder="Reason..." value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} className="h-8 w-32 text-xs" />
                                    <Button size="sm" variant="destructive" onClick={() => suspendListing(l.id)}>Suspend</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setSelectedListing(null)}>Cancel</Button>
                                  </div>
                                ) : (
                                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setSelectedListing(l.id)}>
                                    <Ban className="h-3 w-3 mr-1" /> Suspend
                                  </Button>
                                )
                              )}
                              {l.is_suspended && (
                                <Button variant="ghost" size="sm" onClick={() => reactivateListing(l.id)}>
                                  <CheckCircle className="mr-1 h-3 w-3" /> Reactivate
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {listings.length === 0 && <p className="p-8 text-center text-muted-foreground">No listings yet</p>}
                </div>
              </div>
            </TabsContent>

            {/* SETTINGS TAB */}
            <TabsContent value="settings" className="mt-4 space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-card-foreground">Platform Branding</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label>Platform Name</Label>
                    <Input value={platformSettings.platform_name || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, platform_name: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Slogan</Label>
                    <Input value={platformSettings.slogan || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, slogan: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Platform Logo</Label>
                    <div className="mt-1.5 flex items-center gap-3">
                      {platformSettings.logo_url && <img src={platformSettings.logo_url} alt="Logo" className="h-12 w-12 rounded-lg border border-border object-cover" />}
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                          <Upload className="h-4 w-4" /> Upload Logo
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label>Background Image</Label>
                    <div className="mt-1.5">
                      {platformSettings.background_url && <img src={platformSettings.background_url} alt="BG" className="mb-2 h-24 w-full rounded-lg border border-border object-cover" />}
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
                        <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                          <Upload className="h-4 w-4" /> Upload Background
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <Button className="mt-6" onClick={() => updateSettings({ platform_name: platformSettings.platform_name, slogan: platformSettings.slogan })}>Save Branding</Button>
              </div>

              {/* Contact & Social */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-card-foreground">Contact & Social Media</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Support Email</Label><Input value={platformSettings.support_email || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, support_email: e.target.value })} className="mt-1.5" placeholder="support@example.com" /></div>
                  <div><Label>Support Phone (WhatsApp)</Label><Input value={platformSettings.support_phone || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, support_phone: e.target.value })} className="mt-1.5" placeholder="+254700000000" /></div>
                  <div><Label>City</Label><Input value={platformSettings.support_location_city || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, support_location_city: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Area</Label><Input value={platformSettings.support_location_area || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, support_location_area: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Facebook</Label><Input value={platformSettings.social_facebook || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, social_facebook: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Twitter</Label><Input value={platformSettings.social_twitter || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, social_twitter: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Instagram</Label><Input value={platformSettings.social_instagram || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, social_instagram: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>TikTok</Label><Input value={platformSettings.social_tiktok || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, social_tiktok: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>YouTube</Label><Input value={platformSettings.social_youtube || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, social_youtube: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>LinkedIn</Label><Input value={platformSettings.social_linkedin || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, social_linkedin: e.target.value })} className="mt-1.5" /></div>
                </div>
                <Button className="mt-4" onClick={() => updateSettings({
                  support_email: platformSettings.support_email, support_phone: platformSettings.support_phone,
                  support_location_city: platformSettings.support_location_city, support_location_area: platformSettings.support_location_area,
                  social_facebook: platformSettings.social_facebook, social_twitter: platformSettings.social_twitter,
                  social_instagram: platformSettings.social_instagram, social_tiktok: platformSettings.social_tiktok,
                  social_youtube: platformSettings.social_youtube, social_linkedin: platformSettings.social_linkedin,
                })}>Save Contact & Social</Button>
              </div>

              {/* Footer */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-card-foreground">Footer</h3>
                <Textarea value={platformSettings.footer_text || ""} onChange={(e) => setPlatformSettings({ ...platformSettings, footer_text: e.target.value })} rows={3} />
                <Button className="mt-4" onClick={() => updateSettings({ footer_text: platformSettings.footer_text })}>Save Footer</Button>
              </div>

              {/* Access Controls */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-semibold text-card-foreground">Access Controls</h3>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-card-foreground">Guest Access</p>
                    <p className="text-sm text-muted-foreground">Allow browsing without login</p>
                  </div>
                  <Switch checked={platformSettings.guest_access || false} onCheckedChange={(v) => updateSettings({ guest_access: v })} />
                </div>
              </div>
            </TabsContent>

            {/* NOTIFICATIONS TAB */}
            <TabsContent value="notifications" className="mt-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-card-foreground">Send Notification to All Users</h3>
                <Input placeholder="Notification title" value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} className="mb-3" />
                <Textarea placeholder="Notification message..." value={notificationText} onChange={(e) => setNotificationText(e.target.value)} rows={4} />
                <Button className="mt-4" onClick={sendNotification}><Bell className="mr-2 h-4 w-4" /> Send to All Users</Button>
              </div>
            </TabsContent>

            {/* PAYMENTS TAB */}
            <TabsContent value="payments" className="mt-4 space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-card-foreground">Payment Provider</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Active Provider</Label>
                    <Select value={platformSettings.payment_provider || "paystack"} onValueChange={(v) => updateSettings({ payment_provider: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paystack">Paystack</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-muted-foreground">Only one payment method active at a time</p>
                  </div>
                  <div>
                    <Label>{platformSettings.payment_provider === "stripe" ? "Stripe Public Key" : "Paystack Public Key"}</Label>
                    <div className="relative mt-1.5">
                      <Input
                        type={showKey ? "text" : "password"}
                        placeholder="pk_..."
                        value={platformSettings.payment_provider === "stripe" ? (platformSettings.stripe_public_key || "") : (platformSettings.paystack_public_key || "")}
                        onChange={(e) => {
                          const key = platformSettings.payment_provider === "stripe" ? "stripe_public_key" : "paystack_public_key";
                          setPlatformSettings({ ...platformSettings, [key]: e.target.value });
                        }}
                        className="pr-10"
                      />
                      <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-card-foreground">Listing Fees (KES)</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div><Label>Daily</Label><Input type="number" value={platformSettings.listing_fee_daily || 0} onChange={(e) => setPlatformSettings({ ...platformSettings, listing_fee_daily: Number(e.target.value) })} className="mt-1.5" /></div>
                  <div><Label>Monthly</Label><Input type="number" value={platformSettings.listing_fee_monthly || 0} onChange={(e) => setPlatformSettings({ ...platformSettings, listing_fee_monthly: Number(e.target.value) })} className="mt-1.5" /></div>
                  <div><Label>Yearly</Label><Input type="number" value={platformSettings.listing_fee_yearly || 0} onChange={(e) => setPlatformSettings({ ...platformSettings, listing_fee_yearly: Number(e.target.value) })} className="mt-1.5" /></div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-card-foreground">Payment Active (Global)</p>
                    <p className="text-sm text-muted-foreground">Activate/deactivate payment for all users</p>
                  </div>
                  <Switch checked={platformSettings.payment_active || false} onCheckedChange={(v) => updateSettings({ payment_active: v })} />
                </div>
                <Button className="mt-4" onClick={() => updateSettings({
                  listing_fee_daily: platformSettings.listing_fee_daily,
                  listing_fee_monthly: platformSettings.listing_fee_monthly,
                  listing_fee_yearly: platformSettings.listing_fee_yearly,
                  paystack_public_key: platformSettings.paystack_public_key,
                  stripe_public_key: platformSettings.stripe_public_key,
                })}><CreditCard className="mr-2 h-4 w-4" /> Save Payment Settings</Button>
              </div>
            </TabsContent>

            {/* TRANSACTIONS TAB */}
            <TabsContent value="transactions" className="mt-4">
              <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border p-4 flex items-center justify-between">
                  <h3 className="font-semibold text-card-foreground">Transactions ({transactions.length})</h3>
                  <Button variant="outline" size="sm" onClick={() => window.print()}><FileText className="mr-2 h-4 w-4" /> Print</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reference</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Method</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-mono text-xs text-card-foreground">{t.reference || t.id.slice(0, 8)}</td>
                          <td className="px-4 py-3 text-card-foreground">KES {Number(t.amount).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge variant={t.status === "successful" ? "default" : t.status === "pending" ? "secondary" : "destructive"}>{t.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">{t.payment_method}</td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length === 0 && <p className="p-8 text-center text-muted-foreground">No transactions yet</p>}
                </div>
              </div>
            </TabsContent>

            {/* CATEGORIES TAB */}
            <TabsContent value="categories" className="mt-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-card-foreground">Manage Categories</h3>
                <div className="grid gap-3 md:grid-cols-3 mb-4">
                  <Input placeholder="Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                  <Input placeholder="Slug (e.g. electronics)" value={newCategorySlug} onChange={(e) => setNewCategorySlug(e.target.value)} />
                  <Button onClick={addCategory}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
                </div>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="font-medium text-card-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">/{cat.slug} - {cat.types?.length || 0} types</p>
                      </div>
                      <Badge variant={cat.is_active ? "default" : "secondary"}>{cat.is_active ? "Active" : "Inactive"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
