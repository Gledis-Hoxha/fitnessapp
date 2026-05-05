import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Dumbbell, Apple, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home", icon: Home, activeColor: "text-green-400", activeBg: "bg-green-500/15" },
  { path: "/fitness", label: "Fitness", icon: Dumbbell, activeColor: "text-blue-400", activeBg: "bg-blue-500/15" },
  { path: "/nutrition", label: "Nutrition", icon: Apple, activeColor: "text-green-400", activeBg: "bg-green-500/15" },
  { path: "/profile", label: "Profile", icon: User, activeColor: "text-purple-400", activeBg: "bg-purple-500/15" },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <h1 className="font-display text-xl font-bold text-white">
            Vital<span className="text-green-400">Flow</span>
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
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-md border-t border-white/10">
        <div className="max-w-5xl mx-auto flex items-stretch">
          {navItems.map(({ path, label, icon: Icon, activeColor, activeBg }) => {
            const active = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200",
                  active ? activeColor : "text-white/40 hover:text-white/70"
                )}
              >
                <div className={cn("p-1.5 rounded-xl transition-all duration-200", active ? activeBg : "")}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}