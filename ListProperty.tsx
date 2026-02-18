import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Camera, DollarSign, MapPin, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const listingCategories = [
  { value: "property", label: "Property", types: ["Apartment", "House", "Studio", "Villa"] },
  { value: "electronics", label: "Electronics", types: ["TV", "Laptop", "Desktop", "Speaker", "Camera"] },
  { value: "furniture", label: "Furniture", types: ["Sofa", "Bed", "Table", "Chair", "Cabinet"] },
  { value: "cars", label: "Cars", types: ["Sedan", "SUV", "Hatchback", "Truck", "Van"] },
  { value: "phones", label: "Phones", types: ["Phone", "Tablet", "Smartwatch"] },
  { value: "computers", label: "Computers", types: ["Laptop", "Desktop", "Monitor", "Printer"] },
  { value: "machinery", label: "Machinery", types: ["Excavator", "Generator", "Tractor", "Forklift"] },
  { value: "utensils", label: "Utensils", types: ["Cookware", "Cutlery", "Appliances"] },
  { value: "accessories", label: "Accessories", types: ["Bags", "Watches", "Jewelry", "Shoes"] },
];

const ListProperty = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { settings } = usePlatformSettings();
  const navigate = useNavigate();
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [size, setSize] = useState("");
  const [country, setCountry] = useState("");
  const [county, setCounty] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = listingCategories.find((c) => c.value === category);
  const isProperty = category === "property";

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - images.length;
    const toAdd = files.slice(0, remaining);
    const newImages = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].preview);
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to list an item.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!profile?.avatar_url) {
      toast({ title: "Profile Picture Required", description: "Upload a profile picture in your account settings before listing.", variant: "destructive" });
      return;
    }
    if (images.length < 4) {
      toast({ title: "Minimum 4 Images Required", description: "Please upload at least 4 images.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const img of images) {
        const ext = img.file.name.split(".").pop();
        const path = `listings/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("uploads").upload(path, img.file);
        if (error) throw error;
        const { data } = supabase.storage.from("uploads").getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }

      // Insert listing
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title,
        description,
        price: Number(price),
        type,
        bedrooms: isProperty ? Number(bedrooms) : null,
        bathrooms: isProperty ? Number(bathrooms) : null,
        size,
        country,
        county,
        location,
        images: imageUrls,
        status: "pending",
      });

      if (error) throw error;

      toast({ title: "Listing Submitted!", description: "Your listing is under review and will be visible once approved by admin." });
      navigate("/my-listings");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">Create a Listing</h1>
          <p className="mt-1 text-muted-foreground">List anything — properties, electronics, cars, furniture and more</p>

          {/* Disclaimer */}
          {settings.disclaimer && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive">{settings.disclaimer}</p>
            </div>
          )}

          {/* Profile Picture Notice */}
          {(!profile?.avatar_url) && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-accent/10 p-4">
              <Camera className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">Profile picture required</p>
                <p className="text-xs text-muted-foreground">Upload a profile picture before listing</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Images */}
            <div>
              <Label className="text-base font-semibold">Images (min. 4)</Label>
              <p className="text-sm text-muted-foreground">Select photos from your files</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {images.map((img, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
                    <img src={img.preview} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 10 && (
                  <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                    <div className="text-center">
                      <Plus className="mx-auto h-6 w-6" />
                      <span className="mt-1 block text-xs">Add Photo</span>
                    </div>
                  </label>
                )}
              </div>
              {images.length < 4 && (
                <p className="mt-2 text-xs text-destructive">
                  {4 - images.length} more image{4 - images.length > 1 ? "s" : ""} required
                </p>
              )}
            </div>

            {/* Category & Type */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => { setCategory(v); setType(""); }}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {listingCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={setType} disabled={!selectedCategory}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {selectedCategory?.types.map((t) => (
                      <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Title</Label>
                <Input placeholder="e.g. Modern 2BR Apartment in Westlands" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" required />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe your listing..." value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" rows={4} required />
              </div>
              <div>
                <Label>{isProperty ? "Monthly Rent" : "Price"}</Label>
                <div className="flex gap-2 mt-1.5">
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="number" placeholder="45000" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-9" required />
                  </div>
                </div>
              </div>
              <div>
                <Label>{isProperty ? "Size (sqm)" : "Specs / Size"}</Label>
                <Input placeholder={isProperty ? "85" : "e.g. 256GB, 2000cc"} value={size} onChange={(e) => setSize(e.target.value)} className="mt-1.5" required />
              </div>
              {isProperty && (
                <>
                  <div>
                    <Label>Bedrooms</Label>
                    <Input type="number" placeholder="2" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="mt-1.5" required />
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <Input type="number" placeholder="2" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="mt-1.5" required />
                  </div>
                </>
              )}
            </div>

            {/* Location */}
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-accent" />Location
              </h3>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Country</Label>
                  <Input placeholder="Kenya" value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1.5" required />
                </div>
                <div>
                  <Label>County</Label>
                  <Input placeholder="Nairobi" value={county} onChange={(e) => setCounty(e.target.value)} className="mt-1.5" required />
                </div>
                <div>
                  <Label>Location / Area</Label>
                  <Input placeholder="Westlands" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5" required />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-6">
              <div>
                <p className="font-semibold text-card-foreground">Ready to list?</p>
                <p className="text-sm text-muted-foreground">A listing fee may apply</p>
              </div>
              <Button type="submit" size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                <ShoppingBag className="h-4 w-4" />
                {isSubmitting ? "Publishing..." : "Publish Listing"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default ListProperty;
