import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  Package, Clock, CheckCircle, Truck, Store,
  ChevronRight, AlertCircle, Copy
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

export default function CustomerOrders() {
  const { data: orders, isLoading } = trpc.customer.getOrders.useQuery();

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

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-amber-600" />;
      case "preparing":
        return <Package className="w-5 h-5 text-blue-600" />;
      case "ready":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-400" />;
    }
  };

  const copyPickupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Pickup code copied!");
  };

  const activeOrders = orders?.filter(o => 
    o.fulfillmentStatus !== "completed" && o.fulfillmentStatus !== "cancelled"
  ) || [];
  
  const completedOrders = orders?.filter(o => 
    o.fulfillmentStatus === "completed" || o.fulfillmentStatus === "cancelled"
  ) || [];

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600">Track your orders and pickup status</p>
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
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Orders</h2>
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          order.fulfillmentStatus === "ready" ? "bg-emerald-100" :
                          order.fulfillmentStatus === "preparing" ? "bg-blue-100" : "bg-amber-100"
                        }`}>
                          {getStatusIcon(order.fulfillmentStatus)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                              <p className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            {getStatusBadge(order.fulfillmentStatus)}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Store className="w-4 h-4" />
                              <span>Shop #{order.shopId}</span>
                            </div>
                            <div className="font-medium text-gray-900">
                              ${Number(order.totalAmount).toFixed(2)}
                            </div>
                          </div>

                          {/* Pickup Code for Ready Orders */}
                          {order.fulfillmentStatus === "ready" && order.pickupCode && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-3">
                              <p className="text-sm text-emerald-700 mb-2">Your pickup code:</p>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-mono font-bold text-emerald-700 tracking-wider">
                                  {order.pickupCode}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyPickupCode(order.pickupCode!)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-xs text-emerald-600 mt-2">
                                Show this code to the shop when picking up your order
                              </p>
                            </div>
                          )}

                          {/* Progress Steps */}
                          <div className="flex items-center gap-2 mt-4">
                            <div className={`w-2 h-2 rounded-full ${
                              ["pending", "preparing", "ready", "completed"].includes(order.fulfillmentStatus || "") 
                                ? "bg-emerald-500" : "bg-gray-300"
                            }`}></div>
                            <div className={`flex-1 h-0.5 ${
                              ["preparing", "ready", "completed"].includes(order.fulfillmentStatus || "") 
                                ? "bg-emerald-500" : "bg-gray-300"
                            }`}></div>
                            <div className={`w-2 h-2 rounded-full ${
                              ["preparing", "ready", "completed"].includes(order.fulfillmentStatus || "") 
                                ? "bg-emerald-500" : "bg-gray-300"
                            }`}></div>
                            <div className={`flex-1 h-0.5 ${
                              ["ready", "completed"].includes(order.fulfillmentStatus || "") 
                                ? "bg-emerald-500" : "bg-gray-300"
                            }`}></div>
                            <div className={`w-2 h-2 rounded-full ${
                              ["ready", "completed"].includes(order.fulfillmentStatus || "") 
                                ? "bg-emerald-500" : "bg-gray-300"
                            }`}></div>
                            <div className={`flex-1 h-0.5 ${
                              order.fulfillmentStatus === "completed" 
                                ? "bg-emerald-500" : "bg-gray-300"
                            }`}></div>
                            <div className={`w-2 h-2 rounded-full ${
                              order.fulfillmentStatus === "completed" 
                                ? "bg-emerald-500" : "bg-gray-300"
                            }`}></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Confirmed</span>
                            <span>Preparing</span>
                            <span>Ready</span>
                            <span>Complete</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Orders */}
          {completedOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order History</h2>
              <div className="space-y-3">
                {completedOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            order.fulfillmentStatus === "completed" ? "bg-gray-100" : "bg-red-100"
                          }`}>
                            {getStatusIcon(order.fulfillmentStatus)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(order.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">${Number(order.totalAmount).toFixed(2)}</span>
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
            <p className="text-gray-600 mb-6">
              Accept a bid on one of your requests to create an order
            </p>
            <Link href="/customer/requests">
              <Button variant="outline">View My Requests</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </CustomerLayout>
  );
}
