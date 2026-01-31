import ShopLayout from "@/components/ShopLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Search, Filter, Clock, MapPin, DollarSign, 
  Image as ImageIcon, Gavel, Loader2, Package
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ShopFeed() {
  const { data: requests, isLoading, refetch } = trpc.shop.getRequestFeed.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);

  // Bid form state
  const [bidPrice, setBidPrice] = useState("");
  const [bidNotes, setBidNotes] = useState("");
  const [availability, setAvailability] = useState<"in_stock" | "can_order" | "limited">("in_stock");
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState("");

  const submitBid = trpc.shop.submitBid.useMutation({
    onSuccess: () => {
      toast.success("Bid submitted successfully!");
      setBidDialogOpen(false);
      resetBidForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit bid");
    },
  });

  const resetBidForm = () => {
    setBidPrice("");
    setBidNotes("");
    setAvailability("in_stock");
    setDeliveryAvailable(false);
    setDeliveryPrice("");
  };

  const handleSubmitBid = () => {
    if (!selectedRequest) return;
    
    const price = parseFloat(bidPrice);
    if (isNaN(price) || price < 5) {
      toast.error("Please enter a valid price (minimum $5)");
      return;
    }

    submitBid.mutate({
      requestId: selectedRequest.id,
      price,
      availability,
      deliveryAvailable,
      deliveryPrice: deliveryAvailable ? parseFloat(deliveryPrice) || 0 : 0,
      notes: bidNotes.trim() || undefined,
    });
  };

  const openBidDialog = (request: any) => {
    setSelectedRequest(request);
    setBidDialogOpen(true);
  };

  const filteredRequests = requests?.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || request.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = Array.from(new Set(requests?.map(r => r.category) || []));

  return (
    <ShopLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Request Feed</h1>
        <p className="text-gray-600">Browse and bid on customer requests in your area</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Request List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const photos = request.photos as string[] | null;
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {photos && photos.length > 0 ? (
                        <img src={photos[0]} alt={request.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{request.title}</h3>
                        <Badge variant="secondary" className="capitalize">
                          {request.category.replace("_", " ")}
                        </Badge>
                      </div>
                      
                      {request.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{request.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span>Qty: {request.quantity}</span>
                        </div>
                        
                        {(request.budgetMin || request.budgetMax) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>
                              Budget: ${request.budgetMin || "0"} - ${request.budgetMax || "∞"}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{request.searchRadiusMiles} mi</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Gavel className="w-4 h-4" />
                          <span>{request.bidsCount || 0} bids</span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => openBidDialog(request)}
                      >
                        <Gavel className="w-4 h-4 mr-2" />
                        Place Bid
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">
              {searchTerm || categoryFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "No active requests in your service area right now"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bid Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Bid</DialogTitle>
            <DialogDescription>
              {selectedRequest?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="price">Your Price *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="5"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
              {selectedRequest?.budgetMax && (
                <p className="text-xs text-gray-500 mt-1">
                  Customer budget: up to ${Number(selectedRequest.budgetMax).toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="availability">Availability</Label>
              <Select value={availability} onValueChange={(v: any) => setAvailability(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="can_order">Can Order</SelectItem>
                  <SelectItem value="limited">Limited Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="delivery"
                checked={deliveryAvailable}
                onCheckedChange={(checked) => setDeliveryAvailable(checked as boolean)}
              />
              <Label htmlFor="delivery" className="cursor-pointer">Delivery available</Label>
            </div>

            {deliveryAvailable && (
              <div>
                <Label htmlFor="deliveryPrice">Delivery Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="deliveryPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={deliveryPrice}
                    onChange={(e) => setDeliveryPrice(e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={bidNotes}
                onChange={(e) => setBidNotes(e.target.value)}
                placeholder="Add any notes for the customer..."
                rows={3}
                maxLength={200}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setBidDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitBid} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={submitBid.isPending}
            >
              {submitBid.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Bid"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ShopLayout>
  );
}
