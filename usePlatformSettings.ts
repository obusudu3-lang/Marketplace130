import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type PlatformSettings = Tables<"platform_settings">;

const defaultSettings: PlatformSettings = {
  id: "",
  platform_name: "RentHub",
  slogan: "Your Trusted Marketplace",
  logo_url: null,
  background_url: null,
  footer_text: "© RentHub. All rights reserved.",
  support_email: null,
  support_phone: null,
  support_location_city: null,
  support_location_area: null,
  social_facebook: null,
  social_twitter: null,
  social_instagram: null,
  social_tiktok: null,
  social_youtube: null,
  social_linkedin: null,
  payment_provider: "paystack",
  paystack_public_key: null,
  stripe_public_key: null,
  payment_active: true,
  listing_fee_daily: 0,
  listing_fee_monthly: 0,
  listing_fee_yearly: 0,
  guest_access: false,
  disclaimer: null,
  updated_at: null,
};

export const usePlatformSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("platform_settings").select("*").limit(1).single();
      if (data) setSettings(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return { settings, loading };
};
