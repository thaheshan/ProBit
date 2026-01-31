import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { 
  FileText, Plus, Search, Filter, Clock, 
  Gavel, MapPin, DollarSign, ChevronRight, Image as ImageIcon
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function CustomerRequests() {
  const { data: requests, isLoading } = trpc.customer.getRequests.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRequests = requests?.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Active</span>;
      case "closed":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Closed</span>;
      case "expired":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Expired</span>;
      case "cancelled":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Unknown</span>;
    }
  };

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600">Manage your product requests and view bids</p>
        </div>
        <Link href="/customer/create-request">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const photos = request.photos as string[] | null;
            return (
              <Link key={request.id} href={`/customer/requests/${request.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {photos && photos.length > 0 ? (
                          <img src={photos[0]} alt={request.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{request.title}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        {request.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{request.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Gavel className="w-4 h-4" />
                            <span>{request.bidsCount || 0} bids</span>
                          </div>
                          
                          {request.lowestBidPrice && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>From ${Number(request.lowestBidPrice).toFixed(2)}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{request.searchRadiusMiles} mi</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>

                        {request.status === "active" && request.expiresAt && (
                          <p className="text-xs text-amber-600 mt-2">
                            Expires {formatDistanceToNow(new Date(request.expiresAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "Create your first request to get started"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link href="/customer/create-request">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Request
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </CustomerLayout>
  );
}
