import ShopLayout from "@/components/ShopLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Gavel, Clock, CheckCircle, XCircle, AlertCircle, DollarSign
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ShopBids() {
  const { data: bids, isLoading } = trpc.shop.getBids.useQuery();

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-700">Active</Badge>;
      case "accepted":
        return <Badge className="bg-emerald-100 text-emerald-700">Won</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Not Selected</Badge>;
      case "withdrawn":
        return <Badge className="bg-gray-100 text-gray-700">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "active":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const activeBids = bids?.filter(b => b.status === "active") || [];
  const wonBids = bids?.filter(b => b.status === "accepted") || [];
  const otherBids = bids?.filter(b => b.status !== "active" && b.status !== "accepted") || [];

  return (
    <ShopLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
        <p className="text-gray-600">Track your submitted bids and their status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{activeBids.length}</p>
            <p className="text-sm text-gray-500">Active Bids</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-emerald-600">{wonBids.length}</p>
            <p className="text-sm text-gray-500">Won</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gray-600">{bids?.length || 0}</p>
            <p className="text-sm text-gray-500">Total Bids</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bids && bids.length > 0 ? (
        <div className="space-y-6">
          {/* Active Bids */}
          {activeBids.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Bids</h2>
              <div className="space-y-3">
                {activeBids.map((bid) => (
                  <Card key={bid.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {getStatusIcon(bid.status)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Request #{bid.requestId}</p>
                            <p className="text-sm text-gray-500">
                              Submitted {formatDistanceToNow(new Date(bid.submittedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-gray-900">${Number(bid.price).toFixed(2)}</p>
                            {bid.deliveryAvailable && (
                              <p className="text-xs text-gray-500">+${Number(bid.deliveryPrice).toFixed(2)} delivery</p>
                            )}
                          </div>
                          {getStatusBadge(bid.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Won Bids */}
          {wonBids.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Won Bids</h2>
              <div className="space-y-3">
                {wonBids.map((bid) => (
                  <Card key={bid.id} className="border-emerald-200 bg-emerald-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            {getStatusIcon(bid.status)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Request #{bid.requestId}</p>
                            <p className="text-sm text-gray-500">
                              Won {formatDistanceToNow(new Date(bid.acceptedAt || bid.submittedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-emerald-700">${Number(bid.price).toFixed(2)}</p>
                          {getStatusBadge(bid.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Bids */}
          {otherBids.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Bids</h2>
              <div className="space-y-3">
                {otherBids.map((bid) => (
                  <Card key={bid.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getStatusIcon(bid.status)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Request #{bid.requestId}</p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(bid.submittedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium text-gray-600">${Number(bid.price).toFixed(2)}</p>
                          {getStatusBadge(bid.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Gavel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bids yet</h3>
            <p className="text-gray-600">
              Start bidding on customer requests to grow your business
            </p>
          </CardContent>
        </Card>
      )}
    </ShopLayout>
  );
}
