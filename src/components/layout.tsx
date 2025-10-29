import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Jobs", href: "/jobs" },
  ];

  const isActive = (href: string) => location.pathname === href;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 md:h-18 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground">
                <IconInnerShadowTop className="h-5 w-5" stroke={1.5} />
              </div>
              <span className="text-lg md:text-xl font-semibold text-foreground">
                YTFCS ATS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  asChild
                  className="text-sm"
                >
                  <Link to={item.href}>{item.name}</Link>
                </Button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <Button variant="ghost" asChild size="sm">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/dashboard">Get Started</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild size="sm">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full p-0">
                        <Avatar className="h-9 w-9">
                          {user.avatar && (
                            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                          )}
                          <AvatarFallback>
                            {getInitials(`${user.firstName} ${user.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/account">Account Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <div
            className={cn(
              "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
              mobileMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
            )}
          >
            <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  asChild
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to={item.href}>{item.name}</Link>
                </Button>
              ))}
              <div className="flex flex-col gap-2 pt-2 mt-2 border-t border-border/40">
                {!user ? (
                  <>
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button 
                      asChild 
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/dashboard">Get Started</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/dashboard/account">Account</Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Log out
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                <IconInnerShadowTop className="h-4 w-4" stroke={1.5} />
              </div>
              <span className="text-sm text-muted-foreground">
                © 2025 YTFCS ATS. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}