import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, CalendarDays, LogOut, Menu, Search, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user, logout: contextLogout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        contextLogout();
        toast({ title: "Logged out successfully" });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err.message || "Failed to log out" });
      },
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileOpen(false);
  };

  const navLinks = [
    { href: "/properties", label: "Find PGs", icon: <Search className="h-4 w-4" /> },
    { href: "/contact", label: "Support", icon: null },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-primary">RentKaro</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
              <Link href="/register">
                <Button>List your Property / Join</Button>
              </Link>
            </>
          ) : (
            <>
              {user.role === "owner" ? (
                <Link href="/owner/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/tenant/bookings">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    My Bookings
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline-block max-w-[120px] truncate">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-primary capitalize mt-1 font-medium">{user.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/profile")} className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  {user.role === "owner" && (
                    <>
                      <DropdownMenuItem onClick={() => setLocation("/owner/dashboard")} className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation("/owner/properties")} className="cursor-pointer">
                        <Home className="mr-2 h-4 w-4" /> My Properties
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === "tenant" && (
                    <DropdownMenuItem onClick={() => setLocation("/tenant/bookings")} className="cursor-pointer">
                      <CalendarDays className="mr-2 h-4 w-4" /> My Bookings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="flex items-center gap-2 text-primary">
                  <Home className="h-5 w-5" /> RentKaro
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {link.icon && <span className="text-muted-foreground">{link.icon}</span>}
                    {link.label}
                  </Link>
                ))}

                <div className="my-3 h-px bg-border" />

                {!user ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full mt-2">List your Property / Join</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 mb-1">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-primary capitalize font-medium mt-1">{user.role} account</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <UserCircle className="h-4 w-4 text-muted-foreground" /> My Profile
                    </Link>
                    {user.role === "owner" && (
                      <>
                        <Link
                          href="/owner/dashboard"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Dashboard
                        </Link>
                        <Link
                          href="/owner/properties"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted transition-colors"
                        >
                          <Home className="h-4 w-4 text-muted-foreground" /> My Properties
                        </Link>
                        <Link
                          href="/tenant/bookings"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted transition-colors"
                        >
                          <CalendarDays className="h-4 w-4 text-muted-foreground" /> Tenant Inquiries
                        </Link>
                      </>
                    )}
                    {user.role === "tenant" && (
                      <Link
                        href="/tenant/bookings"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <CalendarDays className="h-4 w-4 text-muted-foreground" /> My Bookings
                      </Link>
                    )}

                    <div className="my-2 h-px bg-border" />
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      {logoutMutation.isPending ? "Logging out..." : "Log out"}
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
