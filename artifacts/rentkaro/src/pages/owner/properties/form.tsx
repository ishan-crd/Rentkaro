import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";

const COMMON_AMENITIES = [
  "WiFi", "AC", "Washing Machine", "Power Backup",
  "Food Included", "Attached Bathroom", "Daily Cleaning",
  "Security", "Lift", "Parking", "TV", "Fridge"
];

const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be detailed (min 20 chars)"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(10, "Full address is required"),
  rent: z.coerce.number().min(500, "Rent must be at least 500"),
  deposit: z.coerce.number().min(0, "Deposit cannot be negative"),
  genderPreference: z.enum(["male", "female", "any"]),
  roomType: z.enum(["single", "double", "triple", "shared"]),
  amenities: z.array(z.string()).default([]),
  availability: z.boolean().default(true),
  images: z.array(z.string()).default([]),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export default function PropertyForm() {
  const [, setLocation] = useLocation();
  const [matchAdd] = useRoute("/owner/properties/add");
  const [matchEdit, params] = useRoute("/owner/properties/:id/edit");
  const propertyId = params?.id as Id<"properties"> | undefined;
  const isEditMode = matchEdit && !!propertyId;

  const { userId } = useAuth();
  const { toast } = useToast();
  const initializedForId = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const property = useQuery(api.properties.get, propertyId ? { id: propertyId } : "skip");
  const isFetching = isEditMode && property === undefined;

  const createProperty = useMutation(api.properties.create);
  const updateProperty = useMutation(api.properties.update);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      city: "",
      address: "",
      rent: 0,
      deposit: 0,
      genderPreference: "any",
      roomType: "single",
      amenities: [],
      availability: true,
      images: [],
    },
  });

  useEffect(() => {
    if (isEditMode && property && initializedForId.current !== property._id) {
      initializedForId.current = property._id;
      form.reset({
        title: property.title,
        description: property.description,
        city: property.city,
        address: property.address,
        rent: property.rent,
        deposit: property.deposit,
        genderPreference: property.genderPreference,
        roomType: property.roomType,
        amenities: property.amenities || [],
        availability: property.availability,
        images: property.images || [],
      });
    }
  }, [property, isEditMode, form]);

  const onSubmit = async (data: PropertyFormValues) => {
    // For demo purposes, auto-generate images if none provided
    const payload = {
      ...data,
      images: data.images.length ? data.images : [
        `https://picsum.photos/seed/${Math.random()}/800/600`,
        `https://picsum.photos/seed/${Math.random()}/800/600`,
        `https://picsum.photos/seed/${Math.random()}/800/600`
      ]
    };

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateProperty({ id: propertyId, ...payload });
        toast({ title: "Property updated successfully!" });
        setLocation("/owner/properties");
      } else {
        await createProperty({ ...payload, ownerId: userId! });
        toast({ title: "Property listed successfully!" });
        setLocation("/owner/properties");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: isEditMode ? "Update failed" : "Failed to list property", description: err.message || err.error });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isFetching) {
    return (
      <Layout>
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6 -ml-4" onClick={() => setLocation("/owner/properties")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Properties
        </Button>

        <h1 className="text-3xl font-bold mb-8">{isEditMode ? 'Edit Property' : 'List New Property'}</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Make your property stand out with a clear title and description.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Sunrise Premium PG for Girls" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the atmosphere, nearby landmarks, transport access..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. Bangalore" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123, Koramangala 1st Block..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Rent (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Security Deposit (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Room Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="genderPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender Preference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="any">Unisex / Any</SelectItem>
                            <SelectItem value="male">Male Only</SelectItem>
                            <SelectItem value="female">Female Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single">Single Room</SelectItem>
                            <SelectItem value="double">Double Sharing</SelectItem>
                            <SelectItem value="triple">Triple Sharing</SelectItem>
                            <SelectItem value="shared">Dormitory (4+)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
                <CardDescription>Select all amenities provided with the rent.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="amenities"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                        {COMMON_AMENITIES.map((amenity) => (
                          <FormField
                            key={amenity}
                            control={form.control}
                            name="amenities"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={amenity}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(amenity)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, amenity])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== amenity
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm cursor-pointer">
                                    {amenity}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">List publicly</FormLabel>
                        <FormDescription>
                          Make this property visible in search results immediately.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setLocation("/owner/properties")}>
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : isEditMode ? 'Save Changes' : 'List Property'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
