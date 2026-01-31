import ShopLayout from "@/components/ShopLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Store, Loader2, Save, MapPin } from "lucide-react";

const CATEGORIES = [
  { id: "electronics", label: "Electronics" },
  { id: "clothing", label: "Clothing & Apparel" },
  { id: "home_garden", label: "Home & Garden" },
  { id: "sports", label: "Sports & Outdoors" },
  { id: "automotive", label: "Automotive" },
  { id: "books_media", label: "Books & Media" },
  { id: "health_beauty", label: "Health & Beauty" },
  { id: "toys_games", label: "Toys & Games" },
  { id: "food_grocery", label: "Food & Grocery" },
  { id: "other", label: "Other" },
];

export default function ShopSetupProfile() {
  const [, setLocation] = useLocation();
  const { data: existingProfile, isLoading } = trpc.shop.getProfile.useQuery();
  
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [serviceRadius, setServiceRadius] = useState(10);
  const [businessLicense, setBusinessLicense] = useState("");
  const [taxId, setTaxId] = useState("");

  useEffect(() => {
    if (existingProfile && existingProfile.length > 0) {
      const profile = existingProfile[0];
      setBusinessName(profile.businessName);
      setDescription(profile.description || "");
      setSelectedCategories((profile.categories as string[]) || []);
      setServiceRadius(profile.serviceRadiusMiles || 10);
      setBusinessLicense(profile.businessLicense || "");
      setTaxId(profile.taxId || "");
    }
  }, [existingProfile]);

  const setupProfile = trpc.shop.setupProfile.useMutation({
    onSuccess: () => {
      toast.success("Shop profile saved successfully!");
      setLocation("/shop/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save profile");
    },
  });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(c => c !== categoryId);
      }
      if (prev.length >= 5) {
        toast.error("Maximum 5 categories allowed");
        return prev;
      }
      return [...prev, categoryId];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim()) {
      toast.error("Business name is required");
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error("Select at least one category");
      return;
    }

    setupProfile.mutate({
      businessName: businessName.trim(),
      description: description.trim() || undefined,
      categories: selectedCategories,
      serviceRadiusMiles: serviceRadius,
      businessLicense: businessLicense.trim() || undefined,
      taxId: taxId.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <ShopLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shop Profile</h1>
          <p className="text-gray-600">Set up your shop to start receiving customer requests</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell customers about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Shop Name"
                  maxLength={255}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers what you offer..."
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{description.length}/1000</p>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Select up to 5 categories that describe your products (minimum 1)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCategories.includes(category.id)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {selectedCategories.length}/5 categories selected
              </p>
            </CardContent>
          </Card>

          {/* Service Area */}
          <Card>
            <CardHeader>
              <CardTitle>Service Area</CardTitle>
              <CardDescription>Define how far you can serve customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Service radius: <strong>{serviceRadius} miles</strong></span>
                </div>
                <Slider
                  value={[serviceRadius]}
                  onValueChange={(value) => setServiceRadius(value[0])}
                  min={5}
                  max={25}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>5 miles</span>
                  <span>25 miles</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Details (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details (Optional)</CardTitle>
              <CardDescription>Add verification details to build trust</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessLicense">Business License Number</Label>
                <Input
                  id="businessLicense"
                  value={businessLicense}
                  onChange={(e) => setBusinessLicense(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div>
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input
                  id="taxId"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={setupProfile.isPending}
          >
            {setupProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </form>
      </div>
    </ShopLayout>
  );
}
