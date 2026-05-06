import { Switch, Route, Router as WouterRouter } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

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

      <Route path="/tenant/bookings">
        <ProtectedRoute>
          <TenantBookings />
        </ProtectedRoute>
      </Route>

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
    <TooltipProvider>
      <WouterRouter>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
