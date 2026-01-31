import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  FileText, Gavel, Package, TrendingUp, Plus, 
  Clock, CheckCircle, AlertCircle, ArrowRight 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CustomerDashboard() {
  const { data: requests, isLoading: requestsLoading } = trpc.customer.getRequests.useQuery();
  const { data: orders, isLoading: ordersLoading } = trpc.customer.getOrders.useQuery();

  const activeRequests = requests?.filter(r => r.status === "active") || [];
  const totalBids = requests?.reduce((sum, r) => sum + (r.bidsCount || 0), 0) || 0;
  const completedOrders = orders?.filter(o => o.fulfillmentStatus === "completed") || [];
  const pendingOrders = orders?.filter(o => o.fulfillmentStatus !== "completed" && o.fulfillmentStatus !== "cancelled") || [];

  return (
    <CustomerLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600">Here's what's happening with your requests.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Requests</p>
                <p className="text-3xl font-bold text-indigo-600">{activeRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bids Received</p>
                <p className="text-3xl font-bold text-emerald-600">{totalBids}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Gavel className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-3xl font-bold text-amber-600">{pendingOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Orders</p>
                <p className="text-3xl font-bold text-blue-600">{completedOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>Your latest product requests</CardDescription>
              </div>
              <Link href="/customer/requests">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : requests && requests.length > 0 ? (
                <div className="space-y-3">
                  {requests.slice(0, 5).map((request) => (
                    <Link key={request.id} href={`/customer/requests/${request.id}`}>
                      <div className="flex items-center gap-4 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${
                          request.status === "active" ? "bg-indigo-100" :
                          request.status === "closed" ? "bg-emerald-100" : "bg-gray-100"
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            request.status === "active" ? "text-indigo-600" :
                            request.status === "closed" ? "text-emerald-600" : "text-gray-600"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{request.title}</p>
                          <p className="text-sm text-gray-500">
                            {request.bidsCount || 0} bids • {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === "active" ? "bg-indigo-100 text-indigo-700" :
                          request.status === "closed" ? "bg-emerald-100 text-emerald-700" :
                          request.status === "expired" ? "bg-gray-100 text-gray-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {request.status}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No requests yet</p>
                  <Link href="/customer/create-request">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Request
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/customer/create-request" className="block">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Request
                </Button>
              </Link>
              <Link href="/customer/requests" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View My Requests
                </Button>
              </Link>
              <Link href="/customer/orders" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Track Orders
                </Button>
              </Link>
              <Link href="/customer/shops" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Discover Shops
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
            <CardHeader>
              <CardTitle className="text-indigo-900">Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-indigo-800 space-y-2">
              <p>• Add photos to get more accurate bids</p>
              <p>• Set a realistic budget range</p>
              <p>• Check shop ratings before accepting</p>
              <p>• Respond to bids promptly</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
}
