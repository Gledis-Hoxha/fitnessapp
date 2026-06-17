import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Bell, SunMoon, Globe, Smartphone, Ruler, Moon, Sun, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const NOTIF_KEY = "app_notifications";
const THEME_KEY = "app_theme";
const LANG_KEY = "app_language";
const UNIT_PREF_KEY = "unit_prefs";
const DEFAULT_UNITS = { weight: "kg", distance: "km", height: "cm" };

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "sq", label: "Shqip" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
];

export function getUnitPrefs() {
  try { return JSON.parse(localStorage.getItem(UNIT_PREF_KEY)) || DEFAULT_UNITS; }
  catch { return DEFAULT_UNITS; }
}

const TABS = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: SunMoon },
  { id: "language", label: "Language", icon: Globe },
  { id: "devices", label: "Devices", icon: Smartphone },
  { id: "units", label: "Units", icon: Ruler },
];

export default function SettingsModal({ onClose }) {
  const [tab, setTab] = useState("notifications");
  const [notificationsOn, setNotificationsOn] = useState(() =>
    localStorage.getItem(NOTIF_KEY) !== "false"
  );
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem(THEME_KEY) !== "light"
  );
  const [language, setLanguage] = useState(() =>
    localStorage.getItem(LANG_KEY) || "en"
  );
  const [units, setUnits] = useState(getUnitPrefs());

  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleNotifications = () => {
    const next = !notificationsOn;
    setNotificationsOn(next);
    localStorage.setItem(NOTIF_KEY, String(next));
    toast.success(next ? "Notifications enabled" : "Notifications disabled");
  };

  const setLang = (code) => {
    setLanguage(code);
    localStorage.setItem(LANG_KEY, code);
    toast.success(`Language set to ${LANGUAGES.find((l) => l.code === code)?.label}`);
  };

  const saveUnits = () => {
    localStorage.setItem(UNIT_PREF_KEY, JSON.stringify(units));
    toast.success("Units saved!");
  };

  const handleChangePassword = () => {
    // Redirect to Base44 account settings for password change
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md max-h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-white text-base">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-1 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                tab === id ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Notifications ── */}
          {tab === "notifications" && (
            <>
              <p className="text-xs text-white/40">Control which notifications you receive from the app.</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between px-4 py-3 bg-white/4 rounded-xl border border-white/8">
                  <div>
                    <p className="text-sm text-white/80">Push Notifications</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Workout reminders, meal logging prompts</p>
                  </div>
                  <button
                    onClick={toggleNotifications}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      notificationsOn ? "bg-blue-500" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                        notificationsOn ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Appearance ── */}
          {tab === "appearance" && (
            <>
              <p className="text-xs text-white/40">Choose your preferred app appearance.</p>
              <div className="space-y-1">
                <button
                  onClick={() => setDarkMode(true)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    darkMode
                      ? "bg-white/10 border-white/20"
                      : "bg-white/4 border-white/8 hover:bg-white/6"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-500/15">
                      <Moon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-sm text-white">Dark Mode</span>
                  </div>
                  {darkMode && <div className="w-3 h-3 rounded-full bg-blue-400" />}
                </button>
                <button
                  onClick={() => setDarkMode(false)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    !darkMode
                      ? "bg-white/10 border-white/20"
                      : "bg-white/4 border-white/8 hover:bg-white/6"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-500/15">
                      <Sun className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-sm text-white">Light Mode</span>
                  </div>
                  {!darkMode && <div className="w-3 h-3 rounded-full bg-blue-400" />}
                </button>
              </div>
            </>
          )}

          {/* ── Language ── */}
          {tab === "language" && (
            <>
              <p className="text-xs text-white/40">Choose your preferred language.</p>
              <div className="space-y-1">
                {LANGUAGES.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => setLang(code)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      language === code
                        ? "bg-white/10 border-white/20"
                        : "bg-white/4 border-white/8 hover:bg-white/6"
                    }`}
                  >
                    <span className="text-sm text-white">{label}</span>
                    {language === code && <div className="w-3 h-3 rounded-full bg-blue-400" />}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Linked Devices ── */}
          {tab === "devices" && (
            <>
              <p className="text-xs text-white/40">Devices connected to your account.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/4 rounded-xl border border-white/8">
                  <div className="p-1.5 rounded-lg bg-blue-500/15">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/80">Current Session</p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {navigator.userAgentData?.platform || navigator.platform || "Unknown device"}
                    </p>
                  </div>
                  <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full font-medium">Active</span>
                </div>
                <p className="text-[10px] text-white/20 px-1 pt-1">
                  More device management options coming soon.
                </p>
              </div>
            </>
          )}

          {/* ── Units ── */}
          {tab === "units" && (
            <>
              <p className="text-xs text-white/40">Choose your preferred measurement units used throughout the app.</p>
              <div className="space-y-4">
                {[
                  { key: "weight", label: "Body Weight", options: ["kg", "lbs"] },
                  { key: "distance", label: "Distance", options: ["km", "miles"] },
                  { key: "height", label: "Height", options: ["cm", "ft/in"] },
                ].map(({ key, label, options }) => (
                  <div key={key}>
                    <p className="text-xs font-semibold text-white/60 mb-2">{label}</p>
                    <div className="flex gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setUnits({ ...units, [key]: opt })}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                            units[key] === opt
                              ? "bg-white/15 border-white/25 text-white"
                              : "bg-white/4 border-white/8 text-white/35 hover:bg-white/8"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={saveUnits}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all border border-white/10"
              >
                Save Units
              </button>
            </>
          )}

          {/* Footer actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleChangePassword}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/4 rounded-xl border border-white/8 hover:bg-white/8 transition-colors"
            >
              <span className="text-sm text-white/70">Change Password</span>
              <ChevronRight className="w-4 h-4 text-white/25" />
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                toast.success("Local preferences cleared!");
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/4 rounded-xl border border-white/8 hover:bg-white/8 transition-colors"
            >
              <span className="text-sm text-white/60">Clear local preferences</span>
              <ChevronRight className="w-4 h-4 text-white/25" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}