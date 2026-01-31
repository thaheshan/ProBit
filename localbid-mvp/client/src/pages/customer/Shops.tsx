import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Store, Search, Star, MapPin, Heart, HeartOff,
  Clock, CheckCircle, Filter
} from "lucide-react";

export default function CustomerShops() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: shops, isLoading } = trpc.shop.listShops.useQuery({});
  const { data: favorites, refetch: refetchFavorites } = trpc.customer.getFavoriteShops.useQuery();
  
  const addFavorite = trpc.customer.addFavoriteShop.useMutation({
    onSuccess: () => {
      toast.success("Shop added to favorites!");
      refetchFavorites();
    },
    onError: (error) => toast.error(error.message),
  });

  const removeFavorite = trpc.customer.removeFavoriteShop.useMutation({
    onSuccess: () => {
      toast.success("Shop removed from favorites");
      refetchFavorites();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const favoriteShopIds = new Set(favorites?.map((f: { userId: number }) => f.userId) || []);

  const filteredShops = shops?.filter((shop: { businessName: string; description: string | null }) => 
    shop.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (shop.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const toggleFavorite = (shopId: number) => {
    if (favoriteShopIds.has(shopId)) {
      removeFavorite.mutate({ shopId });
    } else {
      addFavorite.mutate({ shopId });
    }
  };

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Discover Shops</h1>
        <p className="text-gray-600">Find and favorite local shops in your area</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search shops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Shops Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredShops.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.map((shop) => {
            const isFavorite = favoriteShopIds.has(shop.userId);
            const categories = shop.categories as string[] | null;
            
            return (
              <Card key={shop.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                      {shop.logo ? (
                        <img src={shop.logo} alt={shop.businessName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Store className="w-7 h-7 text-emerald-600" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(shop.userId)}
                      className={isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"}
                    >
                      {isFavorite ? (
                        <Heart className="w-5 h-5 fill-current" />
                      ) : (
                        <Heart className="w-5 h-5" />
                      )}
                    </Button>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">{shop.businessName}</h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{Number(shop.averageRating).toFixed(1)}</span>
                    <span className="text-gray-400">({shop.totalReviews} reviews)</span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{shop.serviceRadiusMiles} mile radius</span>
                  </div>

                  {categories && categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {categories.slice(0, 3).map((cat, i) => (
                        <Badge key={i} variant="secondary" className="text-xs capitalize">
                          {cat.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {shop.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{shop.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{shop.bidsWon} orders</span>
                    </div>
                    {shop.isVerified && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">Verified</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No shops found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search" : "No shops available in your area yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </CustomerLayout>
  );
}
