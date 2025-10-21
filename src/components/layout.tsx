import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Layout() {
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Jobs", href: "/jobs" },
    { name: "Auth", href: "/auth" },
  ];

  return (
    <div className="min-h-screen bg-sidebar">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">ATS</h1>
              <div className="flex space-x-2">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    variant={location.pathname === item.href ? "default" : "ghost"}
                    asChild
                  >
                    <Link to={item.href}>{item.name}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}