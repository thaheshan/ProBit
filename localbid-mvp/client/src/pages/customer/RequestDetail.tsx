import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { 
  ArrowLeft, Clock, MapPin, DollarSign, Package, 
  Store, Star, Truck, CheckCircle, AlertCircle,
  Image as ImageIcon, Loader2, ChevronDown, ChevronUp
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";

export default function RequestDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const requestId = parseInt(params.id || "0");
  const [expandedBid, setExpandedBid] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.customer.getRequestDetail.useQuery(
    { requestId },
    { enabled: requestId > 0 }
  );

  const acceptBid = trpc.customer.acceptBid.useMutation({
    onSuccess: (result) => {
      toast.success("Bid accepted! Order created.");
      setLocation(`/customer/orders/${result.orderId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to accept bid");
    },
  });

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </CustomerLayout>
    );
  }

  if (!data) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request not found</h2>
          <Link href="/customer/requests">
            <Button variant="outline">Back to Requests</Button>
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  const { request, bids } = data;
  const photos = request.photos as string[] | null;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Active</Badge>;
      case "closed":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Closed</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Expired</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAvailabilityBadge = (availability: string | null) => {
    switch (availability) {
      case "in_stock":
        return <Badge className="bg-emerald-100 text-emerald-700">In Stock</Badge>;
      case "can_order":
        return <Badge className="bg-amber-100 text-amber-700">Can Order</Badge>;
      case "limited":
        return <Badge className="bg-red-100 text-red-700">Limited</Badge>;
      default:
        return null;
    }
  };

  return (
    <CustomerLayout>
      {/* Back Link */}
      <Link href="/customer/requests" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Requests
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Request Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{request.title}</CardTitle>
                  <CardDescription>
                    Posted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                  </CardDescription>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photos */}
              {photos && photos.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              {request.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-gray-600">{request.description}</p>
                </div>
              )}

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium capitalize">{request.category.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">{request.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Search Radius</p>
                  <p className="font-medium">{request.searchRadiusMiles} miles</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium">
                    {request.budgetMin || request.budgetMax
                      ? `$${request.budgetMin || "0"} - $${request.budgetMax || "∞"}`
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {request.status === "active" && request.expiresAt && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Bidding ends {formatDistanceToNow(new Date(request.expiresAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bids Section */}
          <Card>
            <CardHeader>
              <CardTitle>Bids ({bids.length})</CardTitle>
              <CardDescription>
                {bids.length > 0 
                  ? "Compare bids from local shops and accept the best offer"
                  : "No bids yet. Shops in your area will submit bids soon."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bids.length > 0 ? (
                <div className="space-y-4">
                  {bids.map((bid, index) => (
                    <div 
                      key={bid.id} 
                      className={`border rounded-lg overflow-hidden ${
                        index === 0 ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200"
                      }`}
                    >
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedBid(expandedBid === bid.id ? null : bid.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Store className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Shop #{bid.shopId}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span>4.8</span>
                                {getAvailabilityBadge(bid.availability)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">${Number(bid.price).toFixed(2)}</p>
                              {bid.deliveryAvailable && (
                                <p className="text-xs text-gray-500">
                                  +${Number(bid.deliveryPrice).toFixed(2)} delivery
                                </p>
                              )}
                            </div>
                            {expandedBid === bid.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {index === 0 && (
                          <div className="mt-2">
                            <Badge className="bg-emerald-100 text-emerald-700">Lowest Price</Badge>
                          </div>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {expandedBid === bid.id && (
                        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Availability</p>
                              <p className="font-medium capitalize">{bid.availability?.replace("_", " ")}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Delivery</p>
                              <p className="font-medium">
                                {bid.deliveryAvailable ? `Available ($${Number(bid.deliveryPrice).toFixed(2)})` : "Pickup only"}
                              </p>
                            </div>
                          </div>

                          {bid.notes && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-500">Notes from shop</p>
                              <p className="text-gray-700">{bid.notes}</p>
                            </div>
                          )}

                          {request.status === "active" && bid.status === "active" && (
                            <Button 
                              className="w-full bg-emerald-600 hover:bg-emerald-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                acceptBid.mutate({ bidId: bid.id });
                              }}
                              disabled={acceptBid.isPending}
                            >
                              {acceptBid.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Accept This Bid
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Waiting for shops to submit bids...</p>
                  <p className="text-sm text-gray-400 mt-1">
                    You'll be notified when new bids arrive
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Bids</span>
                <span className="font-medium">{bids.length}</span>
              </div>
              {request.lowestBidPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Lowest Bid</span>
                  <span className="font-medium text-emerald-600">${Number(request.lowestBidPrice).toFixed(2)}</span>
                </div>
              )}
              {request.averageBidPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Average Bid</span>
                  <span className="font-medium">${Number(request.averageBidPrice).toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                {getStatusBadge(request.status)}
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900 text-base">Tips for Choosing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>• Check shop ratings and reviews</p>
              <p>• Consider delivery options</p>
              <p>• Read notes from shops carefully</p>
              <p>• Compare total cost including delivery</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
}
