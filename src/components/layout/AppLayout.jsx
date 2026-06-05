import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Dumbbell, Apple, Bot, User, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import WorkoutRemindersModal from "@/components/fitness/WorkoutRemindersModal";
import SettingsModal from "@/components/shared/SettingsModal";
import NotificationsModal from "@/components/shared/NotificationsModal";

const navItems = [
  { path: "/fitness", label: "Fitness", icon: Dumbbell },
  { path: "/nutrition", label: "Nutrition", icon: Apple },
  { path: "/profile", label: "Profile", icon: User },
  { path: "/coach", label: "Coach", icon: Bot },
];

export default function AppLayout() {
  const location = useLocation();
  const [showReminders, setShowReminders] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/8 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-display font-bold text-lg text-white">Protein</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNotifications(true)}
              className="p-2 rounded-xl hover:bg-white/8 transition-colors text-white/40 hover:text-white"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowReminders(true)}
              className="p-2 rounded-xl hover:bg-white/8 transition-colors text-white/40 hover:text-white"
            >
              <Dumbbell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl hover:bg-white/8 transition-colors text-white/40 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/8">
        <div className="max-w-2xl mx-auto flex items-center justify-around px-4 py-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                  active
                    ? "text-blue-400"
                    : "text-white/30 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", active && "scale-110 transition-transform")} />
                <span className={cn("text-[10px] font-medium", active ? "text-blue-400" : "text-white/30")}>
                  {label}
                </span>
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