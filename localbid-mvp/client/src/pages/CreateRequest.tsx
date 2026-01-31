import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { 
  ShoppingBag, ArrowLeft, Upload, X, Image as ImageIcon, 
  MapPin, Clock, DollarSign, Package, LogOut, Loader2
} from "lucide-react";

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing & Apparel" },
  { value: "home_garden", label: "Home & Garden" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "automotive", label: "Automotive" },
  { value: "health_beauty", label: "Health & Beauty" },
  { value: "toys_games", label: "Toys & Games" },
  { value: "books_media", label: "Books & Media" },
  { value: "food_grocery", label: "Food & Grocery" },
  { value: "other", label: "Other" },
];

export default function CreateRequest() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [searchRadius, setSearchRadius] = useState(10);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [bidDuration, setBidDuration] = useState(24);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Create request mutation
  const createRequest = trpc.customer.createRequest.useMutation({
    onSuccess: (data) => {
      toast.success("Request created successfully!");
      setLocation("/customer/requests");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create request");
    },
  });

  const handleSignOut = () => {
    logout();
    window.location.href = "/";
  };

  // Upload image mutation
  const uploadImage = trpc.upload.uploadImage.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to upload image");
    },
  });

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        // Upload to S3
        const result = await uploadImage.mutateAsync({
          base64Data,
          fileName: file.name.replace(/\.[^/.]+$/, ""),
          mimeType: file.type,
        });
        
        setPhotos((prev) => [...prev, result.url]);
      }
    } catch (error) {
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (title.length < 5) {
      toast.error("Title must be at least 5 characters");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    const budgetMinNum = budgetMin ? parseFloat(budgetMin) : undefined;
    const budgetMaxNum = budgetMax ? parseFloat(budgetMax) : undefined;

    if (budgetMinNum && budgetMaxNum && budgetMinNum > budgetMaxNum) {
      toast.error("Minimum budget cannot be greater than maximum");
      return;
    }

    createRequest.mutate({
      title: title.trim(),
      description: description.trim(),
      category,
      quantity,
      searchRadiusMiles: searchRadius,
      budgetMin: budgetMinNum,
      budgetMax: budgetMaxNum,
      bidDurationHours: bidDuration,
      photos,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to create a request</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold">LocalBid</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Product Request</CardTitle>
            <CardDescription>
              Describe what you're looking for and let local shops compete with their best prices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., iPhone 15 Pro Max 256GB"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={255}
                />
                <p className="text-xs text-gray-500">{title.length}/255 characters</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you're looking for in detail. Include any specific requirements, preferred brands, colors, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500">{description.length}/1000 characters</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label>Photos (Optional)</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Add up to 5 reference photos to help shops understand what you're looking for.
                </p>
                
                {/* Photo Grid */}
                <div className="grid grid-cols-5 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {photos.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">Add</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Budget Range */}
              <div className="space-y-2">
                <Label>Budget Range (Optional)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Min"
                        min={0}
                        step={0.01}
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Max"
                        min={0}
                        step={0.01}
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Radius */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Search Radius</Label>
                  <span className="text-sm font-medium text-indigo-600">{searchRadius} miles</span>
                </div>
                <Slider
                  value={[searchRadius]}
                  onValueChange={(value) => setSearchRadius(value[0])}
                  min={5}
                  max={25}
                  step={1}
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Shops within {searchRadius} miles of your location will see this request.
                </p>
              </div>

              {/* Bid Duration */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Bid Duration</Label>
                  <span className="text-sm font-medium text-indigo-600">{bidDuration} hours</span>
                </div>
                <Slider
                  value={[bidDuration]}
                  onValueChange={(value) => setBidDuration(value[0])}
                  min={2}
                  max={24}
                  step={1}
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Shops can submit bids for the next {bidDuration} hours.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={createRequest.isPending}
                >
                  {createRequest.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Request...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Create Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
