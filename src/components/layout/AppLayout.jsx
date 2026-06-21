import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Dumbbell, Apple, Bot, User, Settings, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import SettingsModal from "@/components/shared/SettingsModal";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const navItems = [
{ path: "/fitness", labelKey: "nav.fitness", icon: Dumbbell },
{ path: "/nutrition", labelKey: "nav.nutrition", icon: Apple },
{ path: "/profile", labelKey: "nav.profile", icon: User },
{ path: "/coach", labelKey: "nav.coach", icon: Bot }];

const TAB_ROOTS = navItems.map((n) => n.path);

const PAGE_TITLE_KEYS = {
  "/": "page.profile",
  "/profile": "page.profile",
  "/fitness": "page.fitness",
  "/fitness/start-workout": "page.startWorkout",
  "/fitness/exercise-picker": "page.exercises",
  "/fitness/routines": "page.routines",
  "/fitness/explore": "page.explore",
  "/fitness/daily-review": "page.dailyReview",
  "/nutrition": "page.nutrition",
  "/coach": "page.coach"
};

function getPageTitleKey(pathname) {
  if (PAGE_TITLE_KEYS[pathname]) return PAGE_TITLE_KEYS[pathname];
  const match = Object.keys(PAGE_TITLE_KEYS).
  filter((p) => p !== "/" && pathname.startsWith(p)).
  sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLE_KEYS[match] : null;
}

function getTabRoot(pathname) {
  return TAB_ROOTS.find((r) => pathname === r || pathname.startsWith(r + "/")) || "/profile";
}

const slideForward = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -32 },
};

const slideBackward = {
  initial: { opacity: 0, x: -32 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 32 },
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [direction, setDirection] = useState(1); // 1=forward, -1=backward
  const prevPathRef = useRef(location.pathname);
  const scrollPositions = useRef({});

  // Save scroll position on navigation
  useEffect(() => {
    const savePos = () => {
      const tab = getTabRoot(location.pathname);
      scrollPositions.current[tab] = window.scrollY;
    };
    window.addEventListener("beforeunload", savePos);
    return () => window.removeEventListener("beforeunload", savePos);
  }, []);

  // Detect navigation direction
  useEffect(() => {
    const prev = prevPathRef.current;
    const curr = location.pathname;
    const prevTab = getTabRoot(prev);
    const currTab = getTabRoot(curr);
    const prevSegs = prev.split("/").filter(Boolean);
    const currSegs = curr.split("/").filter(Boolean);

    if (prevTab !== currTab) {
      setDirection(1); // switching tabs = forward push
    } else if (currSegs.length > prevSegs.length) {
      setDirection(1); // deeper in same tab = push
    } else {
      setDirection(-1); // shallower / back = pop
    }

    prevPathRef.current = curr;
  }, [location.pathname]);

  // Restore scroll position when entering a tab
  useEffect(() => {
    const tab = getTabRoot(location.pathname);
    const saved = scrollPositions.current[tab];
    if (saved !== undefined) {
      requestAnimationFrame(() => {
        window.scrollTo(0, saved);
      });
    }
  }, [location.pathname]);

  // Save scroll before tab switch
  const saveCurrentScroll = () => {
    const tab = getTabRoot(location.pathname);
    scrollPositions.current[tab] = window.scrollY;
  };

  const titleKey = getPageTitleKey(location.pathname);
  const pageTitle = titleKey ? t(titleKey) : "StrengthStack";
  const isMainPage = navItems.some((n) => n.path === location.pathname) || location.pathname === "/";

  const variants = direction === 1 ? slideForward : slideBackward;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/8 px-4 py-1.5 pt-[calc(env(safe-area-inset-top,0px)+6px)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {!isMainPage ? (
            <button
              onClick={() => {
                saveCurrentScroll();
                navigate(-1);
              }}
              aria-label="Go back"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/50 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8 h-8" />
          )}


          <span className="font-inter font-bold text-base text-white absolute left-1/2 -translate-x-1/2">
            {pageTitle}
          </span>

          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/40 hover:text-white">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-[calc(96px+env(safe-area-inset-bottom,0px))]">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2 bg-[#2e2b3a]/95 backdrop-blur-md rounded-full p-2 shadow-2xl border border-white/8">
          {navItems.map(({ path, labelKey, icon: Icon }) => {
            const label = t(labelKey);
            const active = location.pathname === path || path !== "/" && location.pathname.startsWith(path);
            const handleNavClick = (e) => {
              e.preventDefault();
              saveCurrentScroll();
              navigate(path);
            };
            return (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
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