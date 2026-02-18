import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, Home, User, MessageSquare, PlusCircle, ShoppingBag, LogOut, Bell,
  Settings, Package, Phone, FileText, Flag, Shield,
  Facebook, Twitter, Instagram, Youtube, Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { settings } = usePlatformSettings();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const socialLinks = [
    { url: settings.social_facebook, icon: Facebook, label: "Facebook" },
    { url: settings.social_twitter, icon: Twitter, label: "Twitter" },
    { url: settings.social_instagram, icon: Instagram, label: "Instagram" },
    { url: settings.social_youtube, icon: Youtube, label: "YouTube" },
    { url: settings.social_linkedin, icon: Linkedin, label: "LinkedIn" },
  ].filter((s) => s.url);

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
  ];

  const userMenuItems = user ? [
    { to: "/list-property", label: "List Products", icon: PlusCircle },
    { to: "/", label: "Buy Products", icon: ShoppingBag },
    { to: "/my-listings", label: "My Listings", icon: Package },
    { to: "/profile", label: "Profile Settings", icon: Settings },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/chat", label: "Messages", icon: MessageSquare },
  ] : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <span className="font-display text-xl font-bold text-foreground">
            {settings.platform_name || "RentHub"}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button variant={isActive(link.to) ? "default" : "ghost"} size="sm" className="gap-2">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
          {user && (
            <>
              <Link to="/list-property">
                <Button variant={isActive("/list-property") ? "default" : "ghost"} size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Sell / List
                </Button>
              </Link>
              <Link to="/my-listings">
                <Button variant={isActive("/my-listings") ? "default" : "ghost"} size="sm" className="gap-2">
                  <Package className="h-4 w-4" />
                  My Listings
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant={isActive("/chat") ? "default" : "ghost"} size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Button>
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin">
              <Button variant={isActive("/admin") ? "default" : "ghost"} size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/notifications">
                <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="icon"><User className="h-4 w-4" /></Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="rounded-lg p-2 text-foreground hover:bg-muted md:hidden">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-card md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              <Link to="/" onClick={() => setIsOpen(false)}>
                <Button variant={isActive("/") ? "default" : "ghost"} className="w-full justify-start gap-2">
                  <Home className="h-4 w-4" /> Home
                </Button>
              </Link>

              {user ? (
                <>
                  {userMenuItems.map((item) => (
                    <Link key={item.to + item.label} to={item.to} onClick={() => setIsOpen(false)}>
                      <Button variant={isActive(item.to) ? "default" : "ghost"} className="w-full justify-start gap-2">
                        <item.icon className="h-4 w-4" /> {item.label}
                      </Button>
                    </Link>
                  ))}

                  {/* Contact Support */}
                  {settings.support_phone && (
                    <a href={`https://wa.me/${settings.support_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Phone className="h-4 w-4" /> Contact Support
                      </Button>
                    </a>
                  )}

                  {/* Follow Us */}
                  {socialLinks.length > 0 && (
                    <div className="mt-2 rounded-lg border border-border p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Follow Us</p>
                      <div className="flex gap-2">
                        {socialLinks.map((s) => (
                          <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                            <s.icon className="h-4 w-4" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Shield className="h-4 w-4" /> Admin Panel
                      </Button>
                    </Link>
                  )}

                  <div className="mt-2">
                    <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Link to="/auth" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/auth?mode=signup" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-accent text-accent-foreground">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
