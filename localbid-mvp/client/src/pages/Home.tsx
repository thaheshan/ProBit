import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Store, TrendingUp, MapPin, Clock, Shield, LogOut, Users, Award, Zap } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.accountType === "shop") {
        setLocation("/shop/dashboard");
      } else {
        setLocation("/customer/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">LocalBid</span>
          </div>
          <a href={getLoginUrl()}>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Sign In</Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Connect with Local Shops. <span className="text-indigo-600">Get Better Prices.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              LocalBid is a hyperlocal marketplace where customers post product requests and local shops compete with their best prices. Support local businesses while saving money.
            </p>
            <div className="flex gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  Get Started
                </Button>
              </a>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Post a product request</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Shops compete with bids</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Choose the best offer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-indigo-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-4xl font-bold">500+</p>
              <p className="text-indigo-200">Local Shops</p>
            </div>
            <div>
              <p className="text-4xl font-bold">10K+</p>
              <p className="text-indigo-200">Requests Fulfilled</p>
            </div>
            <div>
              <p className="text-4xl font-bold">25%</p>
              <p className="text-indigo-200">Avg. Savings</p>
            </div>
            <div>
              <p className="text-4xl font-bold">4.8★</p>
              <p className="text-indigo-200">Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            A simple 3-step process that connects you with local shops for the best deals
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-indigo-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>1. Post Your Request</CardTitle>
                <CardDescription>Describe what you need with photos and budget</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-500" /> Add product details</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-500" /> Set your budget range</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-500" /> Choose search radius</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Store className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>2. Receive Bids</CardTitle>
                <CardDescription>Local shops compete for your business</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-green-500" /> Compare prices</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-green-500" /> Check shop ratings</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-green-500" /> Review availability</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>3. Accept & Pickup</CardTitle>
                <CardDescription>Choose the best offer and complete your order</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500" /> Accept winning bid</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500" /> Secure payment</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500" /> Pickup locally</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Shops Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Are You a Shop Owner?</h2>
              <p className="text-gray-600 mb-8">
                Join LocalBid and reach customers actively looking for your products. 
                No upfront costs - only pay when you win a bid.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Reach customers in your area</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Grow your business with competitive bidding</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Set your service radius (5-25 miles)</span>
                </li>
              </ul>
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Store className="w-4 h-4 mr-2" />
                  Register Your Shop
                </Button>
              </a>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="font-semibold text-lg mb-4">Shop Dashboard Preview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">New Requests</span>
                  <span className="font-bold text-indigo-600">12</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Active Bids</span>
                  <span className="font-bold text-blue-600">5</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Won This Week</span>
                  <span className="font-bold text-green-600">3</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-bold text-emerald-600">$1,250</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to join the marketplace?</h2>
          <p className="text-lg mb-8 opacity-90">
            Start saving money or reach new customers today.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
              Sign Up Now
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-6 h-6 text-indigo-400" />
                <span className="font-bold text-white">LocalBid</span>
              </div>
              <p className="text-sm">Connecting customers with local shops through competitive bidding.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Customers</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white cursor-pointer">How it works</span></li>
                <li><span className="hover:text-white cursor-pointer">Browse shops</span></li>
                <li><span className="hover:text-white cursor-pointer">Safety</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Shops</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white cursor-pointer">Join us</span></li>
                <li><span className="hover:text-white cursor-pointer">Pricing</span></li>
                <li><span className="hover:text-white cursor-pointer">Resources</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white cursor-pointer">About</span></li>
                <li><span className="hover:text-white cursor-pointer">Contact</span></li>
                <li><span className="hover:text-white cursor-pointer">Terms</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 LocalBid. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
