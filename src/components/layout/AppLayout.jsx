import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Dumbbell, Apple, User, Sparkles, Bell, Settings, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import WorkoutRemindersModal from "@/components/fitness/WorkoutRemindersModal";
import SettingsModal from "@/components/shared/SettingsModal";
import NotificationsModal from "@/components/shared/NotificationsModal";

const navItems = [
  { path: "/fitness", label: "Fitness", icon: Dumbbell, activeColor: "text-blue-400", activeBg: "bg-blue-500/15" },
  { path: "/nutrition", label: "Nutrition", icon: Apple, activeColor: "text-green-400", activeBg: "bg-green-500/15" },
  { path: "/coach", label: "Coach", icon: Sparkles, activeColor: "text-purple-400", activeBg: "bg-purple-500/15" },
  { path: "/profile", label: "Profile", icon: User, activeColor: "text-white", activeBg: "bg-white/15" },
];

const today = format(new Date(), "yyyy-MM-dd");

export default function AppLayout() {
  const location = useLocation();
  const [showReminders, setShowReminders] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // Nutrition search state lifted here to avoid portal issues
  const [showNutritionSearch, setShowNutritionSearch] = useState(false);

  const isNutrition = location.pathname === "/nutrition";

  // Fetch data for notification badge count
  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.filter({ status: "completed" }, "-date", 20),
  });
  const { data: meals = [] } = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => base44.entities.NutritionEntry.list("-date", 200),
  });

  const todayMeals = meals.filter((m) => m.date === today);
  const todayWorkout = workouts.find((w) => w.date === today);
  const notifCount = (todayMeals.length === 0 ? 1 : 0) + (!todayWorkout ? 1 : 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-md border-b border-white/8">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between gap-3">
          <h1 className="font-display tracking-tight text-white text-lg font-bold capitalize flex-shrink-0">Protein</h1>

          <div className="flex items-center gap-1.5 flex-1 justify-end">
            {/* Nutrition search inline (not portal) */}
            {isNutrition && (
              <button
                id="nutrition-search-trigger"
                onClick={() => setShowNutritionSearch(true)}
                className="flex items-center gap-2 flex-1 max-w-xs px-3 py-1.5 rounded-xl bg-white/8 hover:bg-white/12 border border-white/8 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                <span className="text-xs text-white/35 truncate">Search food…</span>
              </button>
            )}

            {/* Bell — opens notification panel */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-xl bg-white/6 hover:bg-white/10 border border-white/8 transition-colors flex-shrink-0"
            >
              <Bell className="w-4 h-4 text-white/60" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none">
                  {notifCount}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-white/6 hover:bg-white/10 border border-white/8 transition-colors flex-shrink-0"
            >
              <Settings className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-12 pb-20">
        <div className="max-w-2xl mx-auto p-4">
          {/* Pass search trigger down to Nutrition via context-free prop — we use a global event */}
          <Outlet context={{ showNutritionSearch, setShowNutritionSearch }} />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-md border-t border-white/8 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto flex items-stretch">
          {navItems.map(({ path, label, icon: Icon, activeColor, activeBg }) => {
            const active = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200",
                  active ? activeColor : "text-white/35 hover:text-white/60"
                )}
              >
                <div className={cn("p-1.5 rounded-lg transition-all duration-200", active ? activeBg : "")}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn("text-[10px] font-semibold tracking-wide", active ? "" : "text-white/35")}>{label}</span>
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