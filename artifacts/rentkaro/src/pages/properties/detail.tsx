import { useState } from "react";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetProperty, useCreateBooking, getGetPropertyQueryKey, getListBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SentimentBadge, SentimentBar } from "@/components/SentimentBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Users, Bed, Check, ShieldCheck, Mail, Phone, Calendar, Info, Star } from "lucide-react";

const bookingSchema = z.object({
  message: z.string().min(10, "Please provide a brief message to the owner (min 10 chars)"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function PropertyDetail() {
  const [, params] = useRoute("/properties/:id");
  const propertyId = Number(params?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { data: property, isLoading, isError } = useGetProperty(propertyId, {
    query: {
      enabled: !!propertyId,
      queryKey: getGetPropertyQueryKey(propertyId)
    }
  });

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      message: "",
    },
  });

  const createBookingMutation = useCreateBooking({
    mutation: {
      onSuccess: () => {
        toast({ title: "Inquiry sent successfully", description: "The owner will contact you soon." });
        setIsBookingOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Failed to send inquiry", description: err.error || "An error occurred." });
      }
    }
  });

  const onSubmit = (data: BookingFormValues) => {
    createBookingMutation.mutate({ data: { propertyId, message: data.message } });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <Skeleton className="w-full aspect-[21/9] md:aspect-[21/7] rounded-xl mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-destructive">Property not found</h2>
          <p className="text-muted-foreground mt-2">The property you're looking for might have been removed.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {property.address}, {property.city}
              </span>
              {property.rating && (
                <span className="flex items-center gap-1 font-medium text-yellow-600 dark:text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  {property.rating.toFixed(1)} ({property.reviewCount} reviews)
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={property.genderPreference === 'female' ? "destructive" : property.genderPreference === 'male' ? "secondary" : "default"} className="px-3 py-1 text-sm capitalize">
              {property.genderPreference === 'any' ? 'Unisex' : property.genderPreference} Only
            </Badge>
            <Badge variant={property.availability ? "default" : "secondary"} className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white">
              {property.availability ? 'Available Now' : 'Not Available'}
            </Badge>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-10 h-[400px] md:h-[500px]">
          <div className="md:col-span-2 h-full rounded-l-xl overflow-hidden relative group cursor-pointer">
            <img 
              src={property.images && property.images.length > 0 ? property.images[0] : `https://picsum.photos/seed/${property.id}/1200/800`} 
              alt="Main property image" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="hidden md:flex flex-col gap-4 h-full">
            <div className="h-[calc(50%-0.5rem)] rounded-tr-xl overflow-hidden relative group cursor-pointer">
              <img 
                src={property.images && property.images.length > 1 ? property.images[1] : `https://picsum.photos/seed/${property.id+1}/600/400`} 
                alt="Property interior" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="h-[calc(50%-0.5rem)] rounded-br-xl overflow-hidden relative group cursor-pointer">
              <img 
                src={property.images && property.images.length > 2 ? property.images[2] : `https://picsum.photos/seed/${property.id+2}/600/400`} 
                alt="Property exterior" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-medium">View Gallery</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About this PG</h2>
              <div className="prose max-w-none text-muted-foreground whitespace-pre-line">
                {property.description}
              </div>
            </section>

            <Separator />

            {/* Room Details */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Room Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border bg-card flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Bed className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Room Type</span>
                  <span className="font-semibold capitalize">{property.roomType}</span>
                </div>
                <div className="p-4 rounded-xl border bg-card flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">For</span>
                  <span className="font-semibold capitalize">{property.genderPreference === 'any' ? 'Anyone' : property.genderPreference}</span>
                </div>
                <div className="p-4 rounded-xl border bg-card flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Available</span>
                  <span className="font-semibold">{property.availability ? 'Immediately' : 'Currently Full'}</span>
                </div>
                <div className="p-4 rounded-xl border bg-card flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Verified</span>
                  <span className="font-semibold text-green-600">Yes</span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Amenities */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Amenities included</h2>
              {property.amenities && property.amenities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map(amenity => (
                    <div key={amenity} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-muted-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No amenities listed.</p>
              )}
            </section>

            <Separator />

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Reviews</h2>
                {property.sentimentScore !== undefined && property.sentimentScore !== null && (
                  <div className="w-48 hidden md:block">
                    <SentimentBar score={property.sentimentScore} />
                  </div>
                )}
              </div>
              
              {property.reviews && property.reviews.length > 0 ? (
                <div className="space-y-6">
                  {property.reviews.map(review => (
                    <div key={review.id} className="p-5 rounded-xl border bg-card/50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{review.tenantName}</div>
                          <div className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted stroke-muted-foreground/30'}`} />
                            ))}
                          </div>
                          {review.sentimentLabel && review.sentimentScore !== null && review.sentimentScore !== undefined && (
                            <SentimentBadge score={review.sentimentScore} showLabel />
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-muted/20 rounded-xl border border-dashed">
                  <p className="text-muted-foreground">No reviews yet for this property.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border rounded-xl shadow-lg bg-card overflow-hidden">
              <div className="p-6 border-b bg-muted/10">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">₹{property.rent.toLocaleString('en-IN')}</span>
                  <span className="text-muted-foreground font-medium mb-1">/ month</span>
                </div>
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Security Deposit</span>
                  <span className="font-semibold text-foreground">₹{property.deposit.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {property.sentimentScore !== undefined && property.sentimentScore !== null && (
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <div className="text-sm font-medium mb-2">Overall Community Sentiment</div>
                    <SentimentBar score={property.sentimentScore} />
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold">Owner Details</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                      {property.ownerName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{property.ownerName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-green-500" /> Identity Verified
                      </div>
                    </div>
                  </div>
                  {user && (
                    <div className="pt-2 space-y-2 text-sm">
                      {property.ownerPhone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" /> {property.ownerPhone}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {user ? (
                  user.role === 'tenant' ? (
                    <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full h-12 text-base font-semibold" disabled={!property.availability}>
                          {property.availability ? 'Contact Owner' : 'Currently Unavailable'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Contact Owner</DialogTitle>
                          <DialogDescription>
                            Send an inquiry for {property.title}. The owner will receive your contact details.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <FormField
                              control={form.control}
                              name="message"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Message</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Hi, I'm interested in this PG. I am a student looking to move in next month..." 
                                      className="min-h-[120px]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end pt-4">
                              <Button type="submit" disabled={createBookingMutation.isPending}>
                                {createBookingMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button className="w-full" disabled variant="outline">
                      Owners cannot book properties
                    </Button>
                  )
                ) : (
                  <div className="space-y-3">
                    <Button className="w-full" asChild>
                      <a href="/login">Login to Contact Owner</a>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      You need to be logged in as a tenant to send inquiries.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
