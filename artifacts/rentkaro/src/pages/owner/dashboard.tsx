import { useGetOwnerStats, getGetOwnerStatsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Inbox, Star, CalendarDays, Plus, Eye, CheckCircle2 } from "lucide-react";

export default function OwnerDashboard() {
  const { data: stats, isLoading } = useGetOwnerStats({
    query: { queryKey: getGetOwnerStatsQueryKey() }
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your properties and inquiries</p>
          </div>
          <Link href="/owner/properties/add">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Property
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProperties}</div>
                  <Link href="/owner/properties" className="text-xs text-blue-500 hover:underline mt-1 block">
                    Manage properties
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                  <Inbox className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInquiries}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.pendingInquiries} pending review
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved Bookings</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approvedBookings}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Successful conversions
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Across all properties
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentInquiries && stats.recentInquiries.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentInquiries.slice(0, 5).map(inquiry => (
                        <div key={inquiry.id} className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div>
                            <div className="font-medium">{inquiry.tenantName}</div>
                            <div className="text-sm text-primary font-medium mt-1">{inquiry.propertyTitle}</div>
                            <div className="text-xs text-muted-foreground mt-2 line-clamp-1">{inquiry.message || "No message provided"}</div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end justify-between mt-3 sm:mt-0">
                            <Badge variant={
                              inquiry.status === 'pending' ? 'secondary' : 
                              inquiry.status === 'approved' ? 'default' : 
                              'destructive'
                            } className={inquiry.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}>
                              {inquiry.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground mt-2">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed rounded-lg bg-muted/20">
                      <Inbox className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                      <p className="text-muted-foreground font-medium">No inquiries yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/owner/properties/add" className="block p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">List New Property</div>
                        <div className="text-sm text-muted-foreground">Add a new PG to your portfolio</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/owner/properties" className="block p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">Manage Properties</div>
                        <div className="text-sm text-muted-foreground">Update details, photos, or availability</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/tenant/bookings" className="block p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">View All Inquiries</div>
                        <div className="text-sm text-muted-foreground">Respond to tenant requests</div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  );
}
