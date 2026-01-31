import ShopLayout from "@/components/ShopLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Package, Clock, CheckCircle, Truck, AlertCircle,
  ChevronRight, DollarSign, Loader2
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function ShopOrders() {
  const { data: orders, isLoading, refetch } = trpc.shop.getOrders.useQuery();

  const updateStatus = trpc.shop.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case "preparing":
        return <Badge className="bg-blue-100 text-blue-700">Preparing</Badge>;
      case "ready":
        return <Badge className="bg-emerald-100 text-emerald-700">Ready for Pickup</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-700">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getNextStatus = (current: string | null): "preparing" | "ready" | "completed" | null => {
    switch (current) {
      case "pending": return "preparing";
      case "preparing": return "ready";
      case "ready": return "completed";
      default: return null;
    }
  };

  const getNextStatusLabel = (current: string | null): string => {
    switch (current) {
      case "pending": return "Start Preparing";
      case "preparing": return "Mark as Ready";
      case "ready": return "Complete Order";
      default: return "";
    }
  };

  const pendingOrders = orders?.filter(o => 
    o.fulfillmentStatus !== "completed" && o.fulfillmentStatus !== "cancelled"
  ) || [];
  
  const completedOrders = orders?.filter(o => 
    o.fulfillmentStatus === "completed" || o.fulfillmentStatus === "cancelled"
  ) || [];

  return (
    <ShopLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage customer orders and fulfillment</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-8">
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Active Orders ({pendingOrders.length})
              </h2>
              <div className="space-y-4">
                {pendingOrders.map((order) => {
                  const nextStatus = getNextStatus(order.fulfillmentStatus);
                  return (
                    <Card key={order.id} className={`${
                      order.fulfillmentStatus === "pending" ? "border-amber-200" :
                      order.fulfillmentStatus === "preparing" ? "border-blue-200" :
                      "border-emerald-200"
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {getStatusBadge(order.fulfillmentStatus)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="font-bold text-lg">${Number(order.totalAmount).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Your Earnings</p>
                            <p className="font-bold text-lg text-emerald-600">
                              ${Number(order.shopAmount).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {order.fulfillmentStatus === "ready" && order.pickupCode && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-emerald-700 mb-1">Pickup Code:</p>
                            <p className="text-2xl font-mono font-bold text-emerald-700 tracking-wider">
                              {order.pickupCode}
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">
                              Customer will show this code at pickup
                            </p>
                          </div>
                        )}

                        {/* Progress Steps */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className={`w-3 h-3 rounded-full ${
                            ["pending", "preparing", "ready", "completed"].includes(order.fulfillmentStatus || "") 
                              ? "bg-emerald-500" : "bg-gray-300"
                          }`}></div>
                          <div className={`flex-1 h-1 ${
                            ["preparing", "ready", "completed"].includes(order.fulfillmentStatus || "") 
                              ? "bg-emerald-500" : "bg-gray-300"
                          }`}></div>
                          <div className={`w-3 h-3 rounded-full ${
                            ["preparing", "ready", "completed"].includes(order.fulfillmentStatus || "") 
                              ? "bg-emerald-500" : "bg-gray-300"
                          }`}></div>
                          <div className={`flex-1 h-1 ${
                            ["ready", "completed"].includes(order.fulfillmentStatus || "") 
                              ? "bg-emerald-500" : "bg-gray-300"
                          }`}></div>
                          <div className={`w-3 h-3 rounded-full ${
                            ["ready", "completed"].includes(order.fulfillmentStatus || "") 
                              ? "bg-emerald-500" : "bg-gray-300"
                          }`}></div>
                          <div className={`flex-1 h-1 ${
                            order.fulfillmentStatus === "completed" 
                              ? "bg-emerald-500" : "bg-gray-300"
                          }`}></div>
                          <div className={`w-3 h-3 rounded-full ${
                            order.fulfillmentStatus === "completed" 
                              ? "bg-emerald-500" : "bg-gray-300"
                          }`}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mb-4">
                          <span>Confirmed</span>
                          <span>Preparing</span>
                          <span>Ready</span>
                          <span>Complete</span>
                        </div>

                        {nextStatus && (
                          <Button 
                            className={`w-full ${
                              order.fulfillmentStatus === "pending" ? "bg-blue-600 hover:bg-blue-700" :
                              order.fulfillmentStatus === "preparing" ? "bg-emerald-600 hover:bg-emerald-700" :
                              "bg-gray-800 hover:bg-gray-900"
                            }`}
                            onClick={() => updateStatus.mutate({ orderId: order.id, status: nextStatus })}
                            disabled={updateStatus.isPending}
                          >
                            {updateStatus.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <ChevronRight className="w-4 h-4 mr-2" />
                                {getNextStatusLabel(order.fulfillmentStatus)}
                              </>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Orders */}
          {completedOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order History</h2>
              <div className="space-y-3">
                {completedOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-emerald-600">
                            +${Number(order.shopAmount).toFixed(2)}
                          </span>
                          {getStatusBadge(order.fulfillmentStatus)}
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
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">
              Win bids on customer requests to receive orders
            </p>
          </CardContent>
        </Card>
      )}
    </ShopLayout>
  );
}
