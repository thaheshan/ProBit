import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Landing page
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Customer pages
import CreateRequest from "./pages/CreateRequest";
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerRequests from "./pages/customer/Requests";
import CustomerRequestDetail from "./pages/customer/RequestDetail";
import CustomerOrders from "./pages/customer/Orders";
import CustomerShops from "./pages/customer/Shops";

// Shop pages
import ShopRegister from "./pages/ShopRegister";
import ShopDashboard from "./pages/shop/Dashboard";
import ShopSetupProfile from "./pages/shop/SetupProfile";
import ShopFeed from "./pages/shop/Feed";
import ShopBids from "./pages/shop/Bids";
import ShopOrders from "./pages/shop/Orders";
import ShopAnalytics from "./pages/shop/Analytics";

function Router() {
  return (
    <Switch>
      {/* Landing */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      
      {/* Shop Register */}
      <Route path="/shop/register" component={ShopRegister} />
      
      {/* Customer Routes */}
      <Route path="/customer/dashboard" component={CustomerDashboard} />
      <Route path="/customer/create-request" component={CreateRequest} />
      <Route path="/customer/requests" component={CustomerRequests} />
      <Route path="/customer/requests/:id" component={CustomerRequestDetail} />
      <Route path="/customer/orders" component={CustomerOrders} />
      <Route path="/customer/shops" component={CustomerShops} />
      
      {/* Shop Routes */}
      <Route path="/shop/dashboard" component={ShopDashboard} />
      <Route path="/shop/setup-profile" component={ShopSetupProfile} />
      <Route path="/shop/feed" component={ShopFeed} />
      <Route path="/shop/bids" component={ShopBids} />
      <Route path="/shop/orders" component={ShopOrders} />
      <Route path="/shop/analytics" component={ShopAnalytics} />
      
      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
