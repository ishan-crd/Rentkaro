import { useState } from "react";
import { useListProperties, getListPropertiesQueryKey, ListPropertiesSortBy, ListPropertiesGenderPreference } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Filter, Loader2, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type FilterState = {
  city: string;
  minRent: string;
  maxRent: string;
  genderPreference: string;
  roomType: string;
  sortBy: string;
};

function getInitialFilters(): FilterState {
  const params = new URLSearchParams(window.location.search);
  return {
    city: params.get("city") || "",
    minRent: params.get("minRent") || "",
    maxRent: params.get("maxRent") || "",
    genderPreference: params.get("genderPreference") || "any",
    roomType: params.get("roomType") || "any",
    sortBy: params.get("sortBy") || "newest",
  };
}

function FilterPanel({
  filters,
  setFilters,
  onApply,
}: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onApply: () => void;
}) {
  const set = (key: keyof FilterState) => (val: string) => setFilters({ ...filters, [key]: val });

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>City</Label>
        <Input placeholder="E.g. Bangalore" value={filters.city} onChange={(e) => set("city")(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>Min Rent (₹)</Label>
          <Input type="number" placeholder="0" value={filters.minRent} onChange={(e) => set("minRent")(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Max Rent (₹)</Label>
          <Input type="number" placeholder="Any" value={filters.maxRent} onChange={(e) => set("maxRent")(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gender</Label>
        <Select value={filters.genderPreference} onValueChange={set("genderPreference")}>
          <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="male">Male Only</SelectItem>
            <SelectItem value="female">Female Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Room Type</Label>
        <Select value={filters.roomType} onValueChange={set("roomType")}>
          <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="single">Single Room</SelectItem>
            <SelectItem value="double">Double Sharing</SelectItem>
            <SelectItem value="triple">Triple Sharing</SelectItem>
            <SelectItem value="shared">Dormitory (4+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select value={filters.sortBy} onValueChange={set("sortBy")}>
          <SelectTrigger><SelectValue placeholder="Newest" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="rent_asc">Rent (Low to High)</SelectItem>
            <SelectItem value="rent_desc">Rent (High to Low)</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="views">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button className="w-full mt-2" onClick={onApply}>
        Apply Filters
      </Button>
    </div>
  );
}

export default function Properties() {
  const [filters, setFilters] = useState<FilterState>(getInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(getInitialFilters);
  const [page, setPage] = useState(1);

  const queryParams = {
    city: appliedFilters.city || undefined,
    minRent: appliedFilters.minRent ? Number(appliedFilters.minRent) : undefined,
    maxRent: appliedFilters.maxRent ? Number(appliedFilters.maxRent) : undefined,
    genderPreference: appliedFilters.genderPreference !== "any" ? (appliedFilters.genderPreference as ListPropertiesGenderPreference) : undefined,
    roomType: appliedFilters.roomType !== "any" ? (appliedFilters.roomType as any) : undefined,
    sortBy: appliedFilters.sortBy as ListPropertiesSortBy,
    page,
    limit: 12,
  };

  const { data, isLoading, isError } = useListProperties(queryParams, {
    query: {
      queryKey: getListPropertiesQueryKey(queryParams),
    },
  });

  const handleApply = () => {
    setPage(1);
    setAppliedFilters({ ...filters });
    const params = new URLSearchParams();
    if (filters.city) params.set("city", filters.city);
    if (filters.minRent) params.set("minRent", filters.minRent);
    if (filters.maxRent) params.set("maxRent", filters.maxRent);
    if (filters.genderPreference !== "any") params.set("genderPreference", filters.genderPreference);
    if (filters.roomType !== "any") params.set("roomType", filters.roomType);
    if (filters.sortBy !== "newest") params.set("sortBy", filters.sortBy);
    window.history.pushState({}, "", `/properties${params.toString() ? `?${params}` : ""}`);
  };

  const handleClear = () => {
    const cleared: FilterState = { city: "", minRent: "", maxRent: "", genderPreference: "any", roomType: "any", sortBy: "newest" };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
    window.history.pushState({}, "", "/properties");
  };

  const activeFilterCount = [
    appliedFilters.city,
    appliedFilters.minRent,
    appliedFilters.maxRent,
    appliedFilters.genderPreference !== "any" ? appliedFilters.genderPreference : "",
    appliedFilters.roomType !== "any" ? appliedFilters.roomType : "",
    appliedFilters.sortBy !== "newest" ? appliedFilters.sortBy : "",
  ].filter(Boolean).length;

  return (
    <Layout>
      <div className="bg-primary/5 py-8 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground">Find Properties</h1>
          <p className="text-muted-foreground mt-2">Discover the perfect PG accommodation for you</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </h3>
              {activeFilterCount > 0 && (
                <button onClick={handleClear} className="text-xs text-primary hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel filters={filters} setFilters={setFilters} onApply={handleApply} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile header */}
          <div className="flex justify-between items-center mb-6 md:hidden">
            <div>
              <h2 className="text-xl font-bold">
                {data?.total !== undefined ? `${data.total} Properties Found` : "Properties"}
              </h2>
              {activeFilterCount > 0 && (
                <button onClick={handleClear} className="text-xs text-primary hover:underline mt-1">
                  Clear filters
                </button>
              )}
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 relative">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Refine your property search</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel filters={filters} setFilters={setFilters} onApply={handleApply} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop title row */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {data?.total !== undefined ? `${data.total} Properties Found` : "Properties"}
            </h2>
            {activeFilterCount > 0 && (
              <button onClick={handleClear} className="text-sm text-primary hover:underline">
                Clear all filters
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Loading properties...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-destructive text-center">
              <p className="text-lg font-semibold">Failed to load properties.</p>
              <p className="text-sm">Please try again later.</p>
            </div>
          ) : data?.properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-xl border border-dashed">
              <Search className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We couldn't find any properties matching your filters. Try adjusting your search.
              </p>
              <Button variant="outline" onClick={handleClear}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {data && data.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium px-4 py-2 bg-muted rounded-md">
                    Page {page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => { setPage((p) => Math.min(data.totalPages, p + 1)); window.scrollTo(0, 0); }}
                    disabled={page === data.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
