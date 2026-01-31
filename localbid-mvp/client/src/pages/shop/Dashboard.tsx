import ShopLayout from "@/components/ShopLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  Gavel, TrendingUp, DollarSign, Star, 
  Rss, Package, ArrowRight, Settings
} from "lucide-react";

export default function ShopDashboard() {
  const { data: profile, isLoading: profileLoading } = trpc.shop.getProfile.useQuery();
  const { data: analytics, isLoading: analyticsLoading } = trpc.shop.getAnalytics.useQuery();
  const { data: orders } = trpc.shop.getOrders.useQuery();
  const { data: requestFeed } = trpc.shop.getRequestFeed.useQuery();

  const hasProfile = profile && profile.length > 0;
  const pendingOrders = orders?.filter(o => 
    o.fulfillmentStatus !== "completed" && o.fulfillmentStatus !== "cancelled"
  ) || [];

  if (!hasProfile) {
    return (
      <ShopLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Set Up Your Shop Profile</h1>
          <p className="text-gray-600 mb-8">
            Complete your shop profile to start receiving customer requests and submitting bids.
          </p>
          <Link href="/shop/setup-profile">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Get Started
            </Button>
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile[0].businessName}!</h1>
        <p className="text-gray-600">Here's your shop performance overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Bids Submitted</p>
                <p className="text-3xl font-bold text-indigo-600">{analytics?.bidsSubmitted || 0}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Gavel className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Bids Won</p>
                <p className="text-3xl font-bold text-emerald-600">{analytics?.bidsWon || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-600">${Number(analytics?.totalRevenue || 0).toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rating</p>
                <p className="text-3xl font-bold text-amber-600">
                  {Number(analytics?.averageRating || 0) > 0 
                    ? Number(analytics?.averageRating).toFixed(1) 
                    : "—"}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600" />
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
                <CardTitle>New Requests</CardTitle>
                <CardDescription>Customer requests in your area</CardDescription>
              </div>
              <Link href="/shop/feed">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {requestFeed && requestFeed.length > 0 ? (
                <div className="space-y-3">
                  {requestFeed.slice(0, 5).map((request) => (
                    <Link key={request.id} href={`/shop/feed/${request.id}`}>
                      <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{request.title}</p>
                          <p className="text-sm text-gray-500">
                            {request.bidsCount || 0} bids • {request.category}
                          </p>
                        </div>
                        {request.budgetMax && (
                          <span className="text-sm font-medium text-emerald-600">
                            Up to ${Number(request.budgetMax).toFixed(0)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Rss className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No new requests in your area</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Pending Orders */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/shop/feed" className="block">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 justify-start">
                  <Rss className="w-4 h-4 mr-2" />
                  Browse Requests
                </Button>
              </Link>
              <Link href="/shop/bids" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Gavel className="w-4 h-4 mr-2" />
                  View My Bids
                </Button>
              </Link>
              <Link href="/shop/orders" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Manage Orders
                </Button>
              </Link>
            </CardContent>
          </Card>

          {pendingOrders.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-900">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800 mb-3">
                  You have {pendingOrders.length} order{pendingOrders.length > 1 ? "s" : ""} that need attention.
                </p>
                <Link href="/shop/orders">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    View Orders
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ShopLayout>
  );
}
