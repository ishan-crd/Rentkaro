import { useState } from "react";
import { useLocation } from "wouter";
import { useListProperties, getListPropertiesQueryKey, ListPropertiesSortBy, ListPropertiesGenderPreference } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Filter, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Properties() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [minRent, setMinRent] = useState(searchParams.get("minRent") || "");
  const [maxRent, setMaxRent] = useState(searchParams.get("maxRent") || "");
  const [genderPreference, setGenderPreference] = useState<string>(searchParams.get("genderPreference") || "any");
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sortBy") || "newest");
  const [page, setPage] = useState(1);

  const queryParams = {
    city: city || undefined,
    minRent: minRent ? Number(minRent) : undefined,
    maxRent: maxRent ? Number(maxRent) : undefined,
    genderPreference: genderPreference !== 'any' ? genderPreference as ListPropertiesGenderPreference : undefined,
    sortBy: sortBy as ListPropertiesSortBy,
    page,
    limit: 12
  };

  const { data, isLoading, isError } = useListProperties(queryParams, {
    query: {
      queryKey: getListPropertiesQueryKey(queryParams),
      keepPreviousData: true
    }
  });

  const handleFilter = () => {
    setPage(1);
    const newParams = new URLSearchParams();
    if (city) newParams.append("city", city);
    if (minRent) newParams.append("minRent", minRent);
    if (maxRent) newParams.append("maxRent", maxRent);
    if (genderPreference && genderPreference !== 'any') newParams.append("genderPreference", genderPreference);
    if (sortBy && sortBy !== 'newest') newParams.append("sortBy", sortBy);
    
    const newUrl = `/properties${newParams.toString() ? `?${newParams.toString()}` : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <Layout>
      <div className="bg-primary/5 py-8 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground">Find Properties</h1>
          <p className="text-muted-foreground mt-2">Discover the perfect PG accommodation for you</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block w-64 shrink-0 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Filters</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input 
                    placeholder="E.g. Bangalore" 
                    value={city} 
                    onChange={e => setCity(e.target.value)} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Min Rent</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={minRent} 
                      onChange={e => setMinRent(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Rent</Label>
                    <Input 
                      type="number" 
                      placeholder="Any" 
                      value={maxRent} 
                      onChange={e => setMaxRent(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={genderPreference} onValueChange={setGenderPreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="male">Male Only</SelectItem>
                      <SelectItem value="female">Female Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Newest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="rent_asc">Rent (Low to High)</SelectItem>
                      <SelectItem value="rent_desc">Rent (High to Low)</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full mt-4" onClick={handleFilter}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-xl font-bold">Results</h2>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Refine your property search</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input 
                      placeholder="E.g. Bangalore" 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Min Rent</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={minRent} 
                        onChange={e => setMinRent(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Rent</Label>
                      <Input 
                        type="number" 
                        placeholder="Any" 
                        value={maxRent} 
                        onChange={e => setMaxRent(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={genderPreference} onValueChange={setGenderPreference}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="male">Male Only</SelectItem>
                        <SelectItem value="female">Female Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Newest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="rent_asc">Rent (Low to High)</SelectItem>
                        <SelectItem value="rent_desc">Rent (High to Low)</SelectItem>
                        <SelectItem value="rating">Top Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={handleFilter}>
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {data?.total ? `${data.total} Properties Found` : 'Properties'}
            </h2>
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
              <p className="text-muted-foreground max-w-md mx-auto mb-6">We couldn't find any properties matching your current filters. Try adjusting your search criteria.</p>
              <Button variant="outline" onClick={() => {
                setCity("");
                setMinRent("");
                setMaxRent("");
                setGenderPreference("any");
                handleFilter();
              }}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {data?.properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              
              {data && data.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button 
                    variant="outline" 
                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium px-4 py-2 bg-muted rounded-md">
                    Page {page} of {data.totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => { setPage(p => Math.min(data.totalPages, p + 1)); window.scrollTo(0,0); }}
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
