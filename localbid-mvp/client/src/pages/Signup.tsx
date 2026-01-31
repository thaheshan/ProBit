import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShoppingBag, Store, User } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"customer" | "shop">("customer");
  const [error, setError] = useState("");

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (data) => {
      // Redirect based on account type
      if (data.user.accountType === "shop") {
        setLocation("/shop/setup-profile");
      } else {
        setLocation("/customer/dashboard");
      }
    },
    onError: (error) => {
      setError(error.message || "Signup failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    signupMutation.mutate({
      name,
      email,
      password,
      accountType,
      businessName: accountType === "shop" ? businessName : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingBag className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">LocalBid</span>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join LocalBid and start bidding or selling today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>I want to</Label>
              <RadioGroup
                value={accountType}
                onValueChange={(value) => setAccountType(value as "customer" | "shop")}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="customer"
                    id="customer"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="customer"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer"
                  >
                    <User className="mb-3 h-6 w-6" />
                    <span className="font-medium">Buy</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Get quotes from shops
                    </span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="shop"
                    id="shop"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="shop"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer"
                  >
                    <Store className="mb-3 h-6 w-6" />
                    <span className="font-medium">Sell</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Bid on customer requests
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={signupMutation.isPending}
              />
            </div>

            {accountType === "shop" && (
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Acme Electronics"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  disabled={signupMutation.isPending}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={signupMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={signupMutation.isPending}
              />
              <p className="text-xs text-gray-500">At least 8 characters</p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-600 hover:underline font-medium">
                Sign in
              </a>
            </div>

            <div className="text-center">
              <a href="/" className="text-sm text-gray-600 hover:underline">
                ← Back to home
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
