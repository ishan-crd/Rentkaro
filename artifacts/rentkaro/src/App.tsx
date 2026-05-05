import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "@/lib/auth";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Properties from "@/pages/properties/index";
import PropertyDetail from "@/pages/properties/detail";
import Contact from "@/pages/contact";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

import OwnerDashboard from "@/pages/owner/dashboard";
import OwnerProperties from "@/pages/owner/properties/index";
import PropertyForm from "@/pages/owner/properties/form";

import TenantBookings from "@/pages/tenant/bookings";
import ProfilePage from "@/pages/profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 mins
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Owner Routes */}
      <Route path="/owner/dashboard">
        <ProtectedRoute role="owner">
          <OwnerDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/properties">
        <ProtectedRoute role="owner">
          <OwnerProperties />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/properties/add">
        <ProtectedRoute role="owner">
          <PropertyForm />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/properties/:id/edit">
        <ProtectedRoute role="owner">
          <PropertyForm />
        </ProtectedRoute>
      </Route>

      {/* Tenant/Shared Routes */}
      <Route path="/tenant/bookings">
        <ProtectedRoute>
          <TenantBookings />
        </ProtectedRoute>
      </Route>

      {/* Profile */}
      <Route path="/profile">
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
