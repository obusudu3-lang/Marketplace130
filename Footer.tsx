import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const Footer = () => {
  const { settings } = usePlatformSettings();

  const socialLinks = [
    { url: settings.social_facebook, icon: Facebook, label: "Facebook" },
    { url: settings.social_twitter, icon: Twitter, label: "Twitter" },
    { url: settings.social_instagram, icon: Instagram, label: "Instagram" },
    { url: settings.social_youtube, icon: Youtube, label: "YouTube" },
    { url: settings.social_linkedin, icon: Linkedin, label: "LinkedIn" },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                  <span className="text-lg font-bold text-accent-foreground">
                    {(settings.platform_name || "R")[0]}
                  </span>
                </div>
              )}
              <span className="font-display text-xl font-bold">{settings.platform_name || "RentHub"}</span>
            </div>
            <p className="text-sm text-primary-foreground/70">
              {settings.slogan || "Your trusted marketplace for finding the perfect items."}
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/" className="hover:text-accent transition-colors">Browse Listings</Link></li>
              <li><Link to="/list-property" className="hover:text-accent transition-colors">List an Item</Link></li>
              <li><Link to="/auth" className="hover:text-accent transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="mb-4 font-semibold">Customer Support</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              {settings.support_email && (
                <li>
                  <a href={`mailto:${settings.support_email}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                    <Mail className="h-4 w-4 text-accent" />
                    {settings.support_email}
                  </a>
                </li>
              )}
              {settings.support_phone && (
                <li>
                  <a href={`https://wa.me/${settings.support_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                    <Phone className="h-4 w-4 text-accent" />
                    {settings.support_phone}
                  </a>
                </li>
              )}
              {(settings.support_location_city || settings.support_location_area) && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  {[settings.support_location_city, settings.support_location_area].filter(Boolean).join(", ")}
                </li>
              )}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="mb-4 font-semibold">Follow Us</h4>
            {socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    title={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-primary-foreground/50">No social links configured</p>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/10 pt-8 text-center text-sm text-primary-foreground/50">
          {settings.footer_text || `© ${new Date().getFullYear()} ${settings.platform_name || "RentHub"}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
