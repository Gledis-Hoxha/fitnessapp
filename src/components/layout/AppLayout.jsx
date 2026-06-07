import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Dumbbell, Apple, Bot, User, Settings, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import SettingsModal from "@/components/shared/SettingsModal";

const navItems = [
{ path: "/fitness", label: "Fitness", icon: Dumbbell },
{ path: "/nutrition", label: "Nutrition", icon: Apple },
{ path: "/profile", label: "Profile", icon: User },
{ path: "/coach", label: "Coach", icon: Bot }];


const PAGE_TITLES = {
  "/": "Profile",
  "/profile": "Profile",
  "/fitness": "Fitness",
  "/fitness/start-workout": "Start Workout",
  "/fitness/exercise-picker": "Exercises",
  "/fitness/routines": "Routines",
  "/fitness/explore": "Explore",
  "/fitness/daily-review": "Daily Review",
  "/nutrition": "Nutrition",
  "/coach": "Coach"
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES)
    .filter((p) => p !== "/" && pathname.startsWith(p))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLES[match] : "StrengthStack";
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/8 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="bg-[#2e2b3a]/95 backdrop-blur-md rounded-full p-1.5 shadow-2xl border border-white/8">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <span className="font-inter font-bold text-lg text-white absolute left-1/2 -translate-x-1/2">
            {pageTitle}
          </span>

          <div className="bg-[#2e2b3a]/95 backdrop-blur-md rounded-full p-1.5 shadow-2xl border border-white/8">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200">
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
      <nav className="fixed bottom-4 left-0 right-0 z-30 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2 bg-[#2e2b3a]/95 backdrop-blur-md rounded-full p-2 shadow-2xl border border-white/8">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path || path !== "/" && location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                aria-label={label}
                className={cn(
                  "flex-1 flex items-center justify-center h-10 rounded-full transition-all duration-200",
                  active ?
                  "bg-white text-[#2e2b3a] shadow-lg" :
                  "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                )}>
                
                <Icon className="w-5 h-5" />
              </Link>);

          })}
        </div>
      </nav>

      <AnimatePresence>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>);

}