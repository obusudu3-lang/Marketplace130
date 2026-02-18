import { Search, MapPin, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface SearchBarProps {
  categories?: string[];
  onSearch?: (filters: { location: string; category: string; sort: string }) => void;
}

const SearchBar = ({ categories = ["All"], onSearch }: SearchBarProps) => {
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");

  const handleSearch = () => {
    onSearch?.({ location, category, sort });
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-3 shadow-card md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by city, county, or country..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="w-full md:w-44">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-44">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Sort By</label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSearch} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
