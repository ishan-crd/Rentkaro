import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Edit, Trash2, MapPin, Eye, ExternalLink, Home } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function OwnerProperties() {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);

  const properties = useQuery(api.properties.myProperties, userId ? { ownerId: userId } : "skip");
  const isLoading = properties === undefined;

  const deleteProp = useMutation(api.properties.remove);
  const updateProp = useMutation(api.properties.update);

  const handleToggleAvailability = async (id: string, currentAvailability: boolean) => {
    setIsTogglingId(id);
    try {
      await updateProp({ id, availability: !currentAvailability });
      toast({ title: "Availability updated" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update failed", description: err.message });
    } finally {
      setIsTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      await deleteProp({ id });
      toast({ title: "Property deleted" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error deleting property", description: err.message });
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
            <p className="text-muted-foreground mt-1">Manage your PG listings</p>
          </div>
          <Link href="/owner/properties/add">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add New Property
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
              <Card key={property._id} className="overflow-hidden flex flex-col">
                <div className="relative aspect-[16/9] w-full bg-muted group">
                  {property.images && property.images.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                      <span className="text-muted-foreground text-sm">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={property.availability ? "default" : "secondary"} className={property.availability ? "bg-green-500 hover:bg-green-600" : ""}>
                      {property.availability ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                    <Link href={`/properties/${property._id}`}>
                      <Button variant="secondary" size="icon" title="View Public Page">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/owner/properties/${property._id}/edit`}>
                      <Button variant="secondary" size="icon" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Property?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the property "{property.title}" and remove all its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(property._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg line-clamp-1" title={property.title}>{property.title}</h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1 mb-4">
                    <MapPin className="w-3 h-3" /> {property.city}
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-sm mb-6 mt-auto">
                    <div className="text-muted-foreground">Rent</div>
                    <div className="font-medium text-right">₹{property.rent.toLocaleString('en-IN')}/mo</div>

                    <div className="text-muted-foreground">Type</div>
                    <div className="font-medium text-right capitalize">{property.roomType}</div>

                    <div className="text-muted-foreground">Reviews</div>
                    <div className="font-medium text-right">{property.reviewCount || 0}</div>

                    <div className="text-muted-foreground">Inquiries</div>
                    <div className="font-medium text-right">{(property as any).bookingCount ?? 0}</div>

                    <div className="text-muted-foreground">Views</div>
                    <div className="font-medium text-right">{(property as any).viewCount ?? 0}</div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t mt-auto">
                    <span className="text-sm font-medium">List publicly</span>
                    <Switch
                      checked={property.availability}
                      onCheckedChange={() => handleToggleAvailability(property._id, property.availability)}
                      disabled={isTogglingId === property._id}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed rounded-xl bg-muted/10">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No properties listed yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Add your first PG accommodation to start receiving inquiries from potential tenants.
            </p>
            <Link href="/owner/properties/add">
              <Button>Add Your First Property</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
