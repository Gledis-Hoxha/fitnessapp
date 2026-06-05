import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutGrid, Calendar, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import WorkoutRemindersModal from "@/components/fitness/WorkoutRemindersModal";
import SettingsModal from "@/components/shared/SettingsModal";
import NotificationsModal from "@/components/shared/NotificationsModal";

// Map our routes to the 4 nav icons from the Figma design
const navItems = [
  { path: "/fitness", label: "Home", icon: LayoutGrid },
  { path: "/nutrition", label: "Schedule", icon: Calendar },
  { path: "/profile", label: "Stats", icon: BarChart2 },
  { path: "/coach", label: "Settings", icon: Settings },
];

const today = format(new Date(), "yyyy-MM-dd");

export default function AppLayout() {
  const location = useLocation();
  const [showReminders, setShowReminders] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNutritionSearch, setShowNutritionSearch] = useState(false);

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.filter({ status: "completed" }, "-date", 20),
  });
  const { data: meals = [] } = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => base44.entities.NutritionEntry.list("-date", 200),
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(248,24%,10%)" }}>
      {/* Main Content */}
      <main className="flex-1 pb-28">
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <Outlet context={{ showNutritionSearch, setShowNutritionSearch }} />
        </div>
      </main>

      {/* Pill Bottom Navigation — Figma style */}
      <nav className="fixed bottom-6 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 px-3 py-2.5 rounded-full shadow-2xl border border-white/10"
          style={{ background: "hsl(248,20%,14%)" }}>
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200",
                  active
                    ? "bg-white shadow-lg"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-[hsl(248,24%,10%)]" : "")} />
              </Link>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
        {showReminders && <WorkoutRemindersModal onClose={() => setShowReminders(false)} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
}