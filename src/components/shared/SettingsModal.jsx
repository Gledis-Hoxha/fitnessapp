import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Bell, SunMoon, Globe, Smartphone, Ruler, Moon, Sun, Monitor, ChevronRight, Trash2 } from "lucide-react";
import { app } from "@/api/base44Client";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const NOTIF_KEY = "app_notifications";
const THEME_KEY = "app_theme";
const UNIT_PREF_KEY = "unit_prefs";
const DEFAULT_UNITS = { weight: "kg", distance: "km", height: "cm" };

const LANGUAGES = [
{ code: "en", label: "English" },
{ code: "sq", label: "Shqip" },
{ code: "es", label: "Español" },
{ code: "fr", label: "Français" },
{ code: "de", label: "Deutsch" },
{ code: "it", label: "Italiano" }];


export function getUnitPrefs() {
  try {return JSON.parse(localStorage.getItem(UNIT_PREF_KEY)) || DEFAULT_UNITS;}
  catch {return DEFAULT_UNITS;}
}

const TABS = [
{ id: "notifications", labelKey: "settings.tab.notifications", icon: Bell },
{ id: "appearance", labelKey: "settings.tab.appearance", icon: SunMoon },
{ id: "language", labelKey: "settings.tab.language", icon: Globe },
{ id: "devices", labelKey: "settings.tab.devices", icon: Smartphone },
{ id: "units", labelKey: "settings.tab.units", icon: Ruler }];


export default function SettingsModal({ onClose }) {
  const { t, language, setLanguage } = useTranslation();
  const [tab, setTab] = useState("notifications");
  const [notificationsOn, setNotificationsOn] = useState(() =>
  localStorage.getItem(NOTIF_KEY) !== "false"
  );
  const [theme, setTheme] = useState(() =>
    localStorage.getItem(THEME_KEY) || "system"
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [units, setUnits] = useState(getUnitPrefs());

  // Apply theme
  useEffect(() => {
    const applyTheme = (isDark) => {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mq.matches);
      const handler = (e) => applyTheme(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      applyTheme(theme === "dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleNotifications = () => {
    const next = !notificationsOn;
    setNotificationsOn(next);
    localStorage.setItem(NOTIF_KEY, String(next));
    toast.success(next ? t("settings.notifications.enabled") : t("settings.notifications.disabled"));
  };

  const setLang = (code) => {
    setLanguage(code);
    toast.success(`${t("settings.language.changed")} ${LANGUAGES.find((l) => l.code === code)?.label}`);
  };

  const saveUnits = () => {
    localStorage.setItem(UNIT_PREF_KEY, JSON.stringify(units));
    toast.success(t("settings.units.saved"));
  };

  const handleChangePassword = () => {
    // Redirect to Base44 account settings for password change
    app.auth.redirectToLogin(window.location.href);
  };

  const handleDeleteAccount = async () => {
    try {
      await app.asServiceRole.users.deleteMe();
      app.auth.logout("/");
    } catch {
      toast.error(t("settings.deleteAccount.failed"));
    }
    setShowDeleteConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-white text-base">{t("settings.title")}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-1 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, labelKey, icon: Icon }) =>
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
            tab === id ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"}`
            }>
            
              <Icon className="w-3.5 h-3.5" /> {t(labelKey)}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Notifications ── */}
          {tab === "notifications" &&
          <>
              <p className="text-xs text-white/40">{t("settings.notifications.desc")}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between px-4 py-3 bg-white/4 rounded-xl border border-white/8">
                  <div>
                    <p className="text-sm text-white/80">{t("settings.notifications.push")}</p>
                    <p className="text-xs text-white/30 mt-0.5">{t("settings.notifications.pushDesc")}</p>
                  </div>
                  <button
                  onClick={toggleNotifications}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  notificationsOn ? "bg-blue-500" : "bg-white/10"}`
                  }>
                  
                    <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                    notificationsOn ? "left-6" : "left-1"}`
                    } />
                  
                  </button>
                </div>
              </div>
            </>
          }

          {/* ── Appearance ── */}
          {tab === "appearance" &&
          <>
              <p className="text-xs text-white/40">{t("settings.appearance.desc")}</p>
              <div className="space-y-1">
                {[
                  { id: "dark", label: t("settings.appearance.dark"), icon: Moon, color: "bg-indigo-500/15", iconColor: "text-indigo-400" },
                  { id: "light", label: t("settings.appearance.light"), icon: Sun, color: "bg-amber-500/15", iconColor: "text-amber-400" },
                  { id: "system", label: t("settings.appearance.system"), icon: Monitor, color: "bg-emerald-500/15", iconColor: "text-emerald-400" },
                ].map(({ id, label, icon: Icon, color, iconColor }) =>
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    theme === id
                      ? "bg-white/10 border-white/20"
                      : "bg-white/4 border-white/8 hover:bg-white/6"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${color}`}>
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <span className="text-sm text-white">{label}</span>
                  </div>
                  {theme === id && <div className="w-3 h-3 rounded-full bg-blue-400" />}
                </button>
                )}
              </div>
            </>
          }

          {/* ── Language ── */}
          {tab === "language" &&
          <>
              <p className="text-xs text-white/40">{t("settings.language.desc")}</p>
              <div className="space-y-1">
                {LANGUAGES.map(({ code, label }) =>
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                language === code ?
                "bg-white/10 border-white/20" :
                "bg-white/4 border-white/8 hover:bg-white/6"}`
                }>
                
                    <span className="text-sm text-white">{label}</span>
                    {language === code && <div className="w-3 h-3 rounded-full bg-blue-400" />}
                  </button>
              )}
              </div>
            </>
          }

          {/* ── Linked Devices ── */}
          {tab === "devices" &&
          <>
              <p className="text-xs text-white/40">{t("settings.devices.desc")}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/4 rounded-xl border border-white/8">
                  <div className="p-1.5 rounded-lg bg-blue-500/15">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/80">{t("settings.devices.currentSession")}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {navigator.userAgentData?.platform || navigator.platform || "Unknown device"}
                    </p>
                    </div>
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full font-medium">{t("settings.devices.active")}</span>
                </div>
                <p className="text-xs text-white/20 px-1 pt-1">
                  {t("settings.devices.comingSoon")}
                </p>
              </div>
            </>
          }

          {/* ── Units ── */}
          {tab === "units" &&
          <>
              <p className="text-xs text-white/40">{t("settings.units.desc")}</p>
              <div className="space-y-4">
                {[
              { key: "weight", label: t("settings.units.weight"), options: ["kg", "lbs"] },
              { key: "distance", label: t("settings.units.distance"), options: ["km", "miles"] },
              { key: "height", label: t("settings.units.height"), options: ["cm", "ft/in"] }].
              map(({ key, label, options }) =>
              <div key={key}>
                    <p className="text-xs font-semibold text-white/60 mb-2">{label}</p>
                    <div className="flex gap-2">
                      {options.map((opt) =>
                  <button
                    key={opt}
                    onClick={() => setUnits({ ...units, [key]: opt })}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    units[key] === opt ?
                    "bg-white/15 border-white/25 text-white" :
                    "bg-white/4 border-white/8 text-white/35 hover:bg-white/8"}`
                    }>
                    
                          {opt}
                        </button>
                  )}
                    </div>
                  </div>
              )}
              </div>
              <button
              onClick={saveUnits}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all border border-white/10">
              
                {t("settings.units.save")}
              </button>
            </>
          }

          {/* Footer actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleChangePassword}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/4 rounded-xl border border-white/8 hover:bg-white/8 transition-colors">
              
              <span className="text-sm text-white/70">{t("settings.changePassword")}</span>
              <ChevronRight className="w-4 h-4 text-white/25" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between px-4 py-3 bg-red-500/5 rounded-xl border border-red-500/15 hover:bg-red-500/10 transition-colors">
              
              <span className="text-sm text-red-400/80">{t("settings.deleteAccount")}</span>
              <Trash2 className="w-4 h-4 text-red-400/40" />
            </button>
            </div>
            </div>
            </motion.div>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent className="bg-[#15131a] border border-white/10 text-white">
            <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t("settings.deleteAccount.title")}</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              {t("settings.deleteAccount.desc")}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">{t("settings.deleteAccount.confirm")}</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
            </motion.div>);

}