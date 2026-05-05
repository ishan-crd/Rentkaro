import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetPlatformStats, useGetPropertyCities, useGetRecommendedProperties, getGetPlatformStatsQueryKey, getGetPropertyCitiesQueryKey, getGetRecommendedPropertiesQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, CheckCircle, Home as HomeIcon, TrendingUp, Users } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";

export default function Home() {
  const [, setLocation] = useLocation();
  const [city, setCity] = useState("");
  const [maxRent, setMaxRent] = useState("");

  const { data: stats } = useGetPlatformStats({
    query: { queryKey: getGetPlatformStatsQueryKey() }
  });

  const { data: cities } = useGetPropertyCities({
    query: { queryKey: getGetPropertyCitiesQueryKey() }
  });

  const { data: recommendedProperties } = useGetRecommendedProperties({ limit: 4 }, {
    query: { queryKey: getGetRecommendedPropertiesQueryKey({ limit: 4 }) }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (maxRent) params.append("maxRent", maxRent);
    setLocation(`/properties?${params.toString()}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-40 overflow-hidden bg-primary/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Find your next home in <span className="text-primary">the city</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover trusted PG accommodations for students and young professionals across India. Clean, verified, and hassle-free.
            </p>
            
            <div className="bg-card p-4 rounded-xl shadow-lg border max-w-3xl mx-auto mt-8">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Enter city (e.g. Bangalore)" 
                    className="pl-10 h-12 text-base"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    data-testid="input-search-city"
                  />
                </div>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                  <Input 
                    type="number" 
                    placeholder="Max budget per month" 
                    className="pl-8 h-12 text-base"
                    value={maxRent}
                    onChange={(e) => setMaxRent(e.target.value)}
                    data-testid="input-search-budget"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8 text-base font-semibold w-full md:w-auto" data-testid="button-search">
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold">{stats?.totalProperties || '1,000+'}</div>
              <div className="text-primary-foreground/80 font-medium uppercase tracking-wider text-sm">Verified PGs</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">{stats?.totalCities || '50+'}</div>
              <div className="text-primary-foreground/80 font-medium uppercase tracking-wider text-sm">Cities</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">{stats?.totalTenants || '10k+'}</div>
              <div className="text-primary-foreground/80 font-medium uppercase tracking-wider text-sm">Happy Tenants</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">{stats?.totalBookings || '25k+'}</div>
              <div className="text-primary-foreground/80 font-medium uppercase tracking-wider text-sm">Bookings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Section */}
      {recommendedProperties && recommendedProperties.length > 0 && (
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-4">Recommended for you</h2>
                <p className="text-muted-foreground text-lg">Top-rated properties based on recent activity</p>
              </div>
              <Link href="/properties" className="hidden md:block">
                <Button variant="outline">View all properties</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link href="/properties">
                <Button variant="outline" className="w-full">View all properties</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Cities Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Popular Cities</h2>
          <p className="text-muted-foreground text-lg text-center mb-12 max-w-2xl mx-auto">Find the best PG accommodations in India's top educational and IT hubs.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(cities || [
              { city: 'Bangalore', count: 120 },
              { city: 'Pune', count: 85 },
              { city: 'Delhi', count: 95 },
              { city: 'Mumbai', count: 110 },
              { city: 'Hyderabad', count: 70 },
              { city: 'Chennai', count: 65 }
            ]).slice(0, 8).map((cityItem) => (
              <Link 
                key={cityItem.city} 
                href={`/properties?city=${encodeURIComponent(cityItem.city)}`}
                className="group relative overflow-hidden rounded-xl aspect-[4/3] flex items-end p-6 border bg-card hover:border-primary transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                <img 
                  src={`https://picsum.photos/seed/${cityItem.city}/400/300`} 
                  alt={cityItem.city}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="relative z-20">
                  <h3 className="text-xl font-bold text-white mb-1">{cityItem.city}</h3>
                  <p className="text-white/80 text-sm font-medium">{cityItem.count} properties</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">How RentKaro Works</h2>
            <p className="text-muted-foreground text-lg">We've simplified the process of finding your perfect PG accommodation. No brokers, no hidden fees, just straightforward renting.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-muted-foreground/20 -z-10" />
            
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary rotate-3">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold">1. Search & Filter</h3>
              <p className="text-muted-foreground">Browse thousands of verified PGs based on your preferred location, budget, and amenities.</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary -rotate-3">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold">2. Select & Verify</h3>
              <p className="text-muted-foreground">Check real photos, read reviews, and see sentiment scores to make an informed decision.</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary rotate-3">
                <HomeIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold">3. Book & Move In</h3>
              <p className="text-muted-foreground">Contact the owner directly through our platform, schedule a visit, and confirm your booking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50 border-t border-b">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to list your property?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of PG owners who are finding verified tenants effortlessly on RentKaro.
          </p>
          <Link href="/register">
            <Button size="lg" className="px-8 font-semibold">List Your PG Now</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
