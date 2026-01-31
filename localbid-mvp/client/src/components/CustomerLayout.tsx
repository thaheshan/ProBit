import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  ShoppingBag, LogOut, LayoutDashboard, FileText, 
  Package, Store, Bell, User, Plus 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const handleSignOut = () => {
    logout();
    window.location.href = "/";
  };

  const navItems = [
    { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customer/requests", label: "My Requests", icon: FileText },
    { href: "/customer/orders", label: "Orders", icon: Package },
    { href: "/customer/shops", label: "Shops", icon: Store },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">LocalBid</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/customer/create-request">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-1" />
                New Request
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                0
              </span>
            </Button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.name?.split(" ")[0] || "User"}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-500 hover:text-gray-700">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href || 
                (item.href === "/customer/dashboard" && location === "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
