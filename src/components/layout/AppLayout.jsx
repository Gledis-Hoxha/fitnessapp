import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Dumbbell, Apple } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/fitness", label: "Fitness", icon: Dumbbell },
  { path: "/nutrition", label: "Nutrition", icon: Apple },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <h1 className="font-display text-xl font-bold">
            Vital<span className="text-primary">Flow</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 pb-24">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="max-w-5xl mx-auto flex items-stretch">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-200",
                  active ? "bg-primary/10" : ""
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn("text-xs font-medium", active ? "text-primary" : "")}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}