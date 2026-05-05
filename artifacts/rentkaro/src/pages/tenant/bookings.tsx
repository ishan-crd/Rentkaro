import { useListBookings, useUpdateBookingStatus, getListBookingsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Calendar, Clock, CheckCircle2, XCircle, Ban, ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TenantBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isOwner = user?.role === 'owner';

  const { data: bookings, isLoading } = useListBookings({
    query: { queryKey: getListBookingsQueryKey() }
  });

  const updateStatusMutation = useUpdateBookingStatus();

  const handleStatusUpdate = (id: number, status: 'approved' | 'rejected' | 'cancelled') => {
    updateStatusMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: "Status updated successfully" });
          queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Update failed", description: err.error });
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="gap-1 text-muted-foreground"><Ban className="w-3 h-3" /> Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {isOwner ? 'Tenant Inquiries' : 'My Bookings'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isOwner ? 'Manage requests for your properties' : 'Track your PG inquiries and booking status'}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map(booking => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="bg-muted/30 p-6 sm:w-1/3 border-b sm:border-b-0 sm:border-r flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        {getStatusBadge(booking.status)}
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Link href={`/properties/${booking.propertyId}`} className="group inline-block mt-2">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors flex items-start gap-1">
                          {booking.propertyTitle}
                          <ExternalLink className="w-3 h-3 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                      </Link>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 shrink-0" /> {booking.propertyCity}
                      </div>
                    </div>
                    
                    <div className="p-6 sm:w-2/3 flex flex-col">
                      <div className="mb-4 flex-1">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {isOwner ? 'Tenant Details & Message' : 'Your Message'}
                        </div>
                        {isOwner && (
                          <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <div className="font-medium">{booking.tenantName}</div>
                            <div className="text-sm text-muted-foreground mt-1 flex flex-col gap-1">
                              <span>{booking.tenantEmail}</span>
                              {booking.tenantPhone && <span>{booking.tenantPhone}</span>}
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-foreground bg-muted/20 p-4 rounded-lg border">
                          "{booking.message || "I am interested in this property and would like to know more."}"
                        </p>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t gap-3 mt-auto">
                        {isOwner && booking.status === 'pending' ? (
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button 
                              variant="outline" 
                              className="text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                              onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Reject
                            </Button>
                            <Button 
                              className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                              onClick={() => handleStatusUpdate(booking.id, 'approved')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Approve
                            </Button>
                          </div>
                        ) : !isOwner && booking.status === 'pending' ? (
                          <Button 
                            variant="outline" 
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Cancel Inquiry
                          </Button>
                        ) : isOwner ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Change Status:</span>
                            <Select 
                              defaultValue={booking.status}
                              onValueChange={(val: any) => handleStatusUpdate(booking.id, val)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">No further actions available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed rounded-xl bg-muted/10">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No inquiries yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {isOwner 
                ? "You haven't received any booking inquiries for your properties yet."
                : "You haven't sent any inquiries yet. Browse properties to find your next home."}
            </p>
            {!isOwner && (
              <Link href="/properties">
                <Button>Browse Properties</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
