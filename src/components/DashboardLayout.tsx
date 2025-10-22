import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Wallet, TrendingUp, Repeat, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfile } from "@/components/UserProfile";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Overview" },
  { path: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
  { path: "/dashboard/market", icon: TrendingUp, label: "Market" },
  { path: "/dashboard/trade", icon: Repeat, label: "Trade" },
];

export const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="text-2xl font-bold text-gradient">Bit-Lover</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="glass border-b">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 transition-all duration-300 border-b-2",
                    isActive
                      ? "border-primary text-primary font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
