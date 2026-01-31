import ShopLayout from "@/components/ShopLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, DollarSign, Star, Gavel, 
  Target, Award, BarChart3
} from "lucide-react";

export default function ShopAnalytics() {
  const { data: analytics, isLoading } = trpc.shop.getAnalytics.useQuery();

  const winRate = analytics && (analytics.bidsSubmitted ?? 0) > 0 
    ? (((analytics.bidsWon ?? 0) / (analytics.bidsSubmitted ?? 1)) * 100).toFixed(1)
    : "0";

  return (
    <ShopLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your shop performance and growth</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${Number(analytics?.totalRevenue || 0).toFixed(0)}
                </p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Gavel className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.bidsSubmitted || 0}
                </p>
                <p className="text-sm text-gray-500">Bids Submitted</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.bidsWon || 0}
                </p>
                <p className="text-sm text-gray-500">Bids Won</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{winRate}%</p>
                <p className="text-sm text-gray-500">Win Rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {Number(analytics?.averageRating || 0) > 0 
                    ? Number(analytics?.averageRating).toFixed(1) 
                    : "—"}
                </p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.totalReviews || 0}
                </p>
                <p className="text-sm text-gray-500">Total Reviews</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Your shop's key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-bold text-gray-900">
                    ${analytics?.bidsWon && analytics.bidsWon > 0 
                      ? (Number(analytics.totalRevenue) / analytics.bidsWon).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-bold text-gray-900">{winRate}%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="font-bold text-gray-900">
                    {Number(analytics?.averageRating || 0) >= 4 ? "Excellent" :
                     Number(analytics?.averageRating || 0) >= 3 ? "Good" :
                     Number(analytics?.averageRating || 0) > 0 ? "Needs Improvement" : "No ratings yet"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </ShopLayout>
  );
}
