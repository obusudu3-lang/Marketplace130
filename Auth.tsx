import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Phone, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const { settings } = usePlatformSettings();

  useEffect(() => {
    if (user && !showLoader) {
      navigate("/");
    }
  }, [user, navigate, showLoader]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        const msg = error.message?.includes("Email not confirmed") 
          ? "Please verify your email address first. Check your inbox for the verification link."
          : error.message;
        toast({ title: "Login Failed", description: msg, variant: "destructive" });
        setIsLoading(false);
        return;
      }
      // Show loading animation
      setShowLoader(true);
      setTimeout(() => {
        navigate("/");
      }, 5000);
    } else {
      if (!username.trim() || !phone.trim()) {
        toast({ title: "Missing Fields", description: "Username and phone are required", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      const { error } = await signUp(email, password, { username, phone, full_name: fullName });
      if (error) {
        toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
        setIsLoading(false);
        return;
      }
      toast({ title: "Account Created!", description: "A verification email has been sent. Please check your inbox and verify your email before signing in." });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!forgotUsername.trim() || !forgotPhone.trim()) {
      toast({ title: "Enter Details", description: "Please enter your username and phone number", variant: "destructive" });
      return;
    }
    const supportPhone = settings.support_phone || "+254700000000";
    const message = encodeURIComponent(`Forgot password ## ${forgotUsername}`);
    window.open(`https://wa.me/${supportPhone.replace(/[^0-9]/g, "")}?text=${message}`, "_blank");
    setShowForgotPassword(false);
  };

  // Loading animation screen
  if (showLoader) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary loader-ring" />
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-accent loader-ring" style={{ animationDelay: "-0.3s" }} />
          </div>
          <p className="mt-6 font-display text-lg font-semibold text-foreground">Welcome back!</p>
          <p className="mt-1 text-sm text-muted-foreground">Preparing your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 bg-hero lg:flex lg:flex-col lg:justify-between p-12">
        <Link to="/" className="flex items-center gap-3">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <span className="text-lg font-bold text-accent-foreground">
                {(settings.platform_name || "R")[0]}
              </span>
            </div>
          )}
          <span className="font-display text-xl font-bold text-primary-foreground">
            {settings.platform_name || "RentHub"}
          </span>
        </Link>

        <div>
          <h2 className="font-display text-4xl font-bold text-primary-foreground">
            {isLogin ? "Welcome Back" : "Join Us Today"}
          </h2>
          <p className="mt-3 text-lg text-primary-foreground/70">
            {settings.slogan || "Your Trusted Marketplace"}
          </p>
        </div>

        <p className="text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} {settings.platform_name || "RentHub"}. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                  <span className="font-bold text-accent-foreground">{(settings.platform_name || "R")[0]}</span>
                </div>
              )}
              <span className="font-display text-xl font-bold text-foreground">
                {settings.platform_name || "RentHub"}
              </span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {showForgotPassword ? (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="font-display text-2xl font-bold text-foreground">Reset Password</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your username and phone number. This will open WhatsApp to send a reset request.
                </p>
                <div className="mt-6 space-y-4">
                  <div>
                    <Label>Username</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Your username" value={forgotUsername} onChange={(e) => setForgotUsername(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="+254 7XX XXX XXX" value={forgotPhone} onChange={(e) => setForgotPhone(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <Button onClick={handleForgotPassword} className="w-full gap-2 bg-success text-success-foreground hover:bg-success/90">
                    <MessageCircle className="h-4 w-4" />
                    Send via WhatsApp
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                    Back to Sign In
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  {isLogin ? "Sign In" : "Create Account"}
                </h1>
                <p className="mt-1 text-muted-foreground">
                  {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  {!isLogin && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <div className="relative mt-1.5">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" required />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" placeholder="johndoe" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1.5" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative mt-1.5">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input id="phone" type="tel" placeholder="+254 7XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" required />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {isLogin && (
                        <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs font-medium text-primary hover:underline">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-10" required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary hover:underline">
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
