import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, TrendingUp, Shield, Users, MapPin, CheckCircle2, ArrowRight, Star, DollarSign, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ShopRegister() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already authenticated as shop
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.accountType === "shop") {
        setLocation("/shop/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Store className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">LocalBid</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              Shop Portal
            </span>
          </div>
          <a href="/">
            <Button variant="outline">Back to Home</Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Register Your Shop on <span className="text-emerald-600">LocalBid</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join the hyperlocal marketplace and start receiving customer requests. 
            Compete with other shops, win bids, and grow your business.
          </p>
          <a href={getLoginUrl("shop")}>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6">
              <Store className="w-5 h-5 mr-2" />
              Register Your Shop Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Why Join LocalBid?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Everything you need to grow your local business and reach more customers
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-emerald-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle>Reach Active Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with customers who are actively looking to buy. No more waiting for walk-ins or hoping customers find you.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle>Increase Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Win more business through competitive bidding. Set your prices, compete fairly, and grow your revenue.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle>Control Your Service Area</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Set your service radius (5-25 miles) and only see requests within your reach. Focus on what you can deliver.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle>Build Trust & Credibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get verified, collect reviews, and build your reputation. Customers trust verified shops with good ratings.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle>Save Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No need to spend time on marketing. Customers come to you with specific requests. Just bid and win.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle>Grow Your Customer Base</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Turn one-time customers into repeat buyers. Build relationships and grow your local presence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Get started in three simple steps
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Register & Set Up</h3>
              <p className="text-gray-600">
                Create your shop account, add your business details, select product categories, and set your service radius.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Browse Requests</h3>
              <p className="text-gray-600">
                View active product requests from customers in your area. Filter by category, price range, and location.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Bid & Win</h3>
              <p className="text-gray-600">
                Submit competitive bids with your best prices. When customers accept your bid, fulfill the order and get paid.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What You Get</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Shop Dashboard</h3>
                <p className="text-sm text-gray-600">Manage your profile, view analytics, and track performance</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Request Feed</h3>
                <p className="text-sm text-gray-600">See all active customer requests in your service area</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Bid Management</h3>
                <p className="text-sm text-gray-600">Submit, edit, and track all your bids in one place</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Order Management</h3>
                <p className="text-sm text-gray-600">Track orders from acceptance to completion</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Analytics & Insights</h3>
                <p className="text-sm text-gray-600">Monitor your win rate, revenue, and customer ratings</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Customer Reviews</h3>
                <p className="text-sm text-gray-600">Build your reputation with customer ratings and reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-emerald-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-5xl font-bold mb-2">500+</p>
              <p className="text-emerald-200">Active Shops</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">10K+</p>
              <p className="text-emerald-200">Bids Submitted</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">$2M+</p>
              <p className="text-emerald-200">Revenue Generated</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">4.8★</p>
              <p className="text-emerald-200">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join hundreds of local shops already using LocalBid to reach more customers and increase revenue.
          </p>
          <a href={getLoginUrl("shop")}>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6">
              <Store className="w-5 h-5 mr-2" />
              Register Your Shop Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
          <p className="text-sm text-gray-500 mt-4">
            Free to join • No upfront costs • Only pay when you win a bid
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; 2026 LocalBid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
