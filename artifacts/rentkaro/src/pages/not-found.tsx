import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center py-20">
        <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-6xl font-black text-primary/30">404</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Page not found</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
          We couldn't find the page you were looking for. It may have been moved, deleted, or never existed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </Link>
          <Link href="/properties">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4" /> Browse Properties
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
