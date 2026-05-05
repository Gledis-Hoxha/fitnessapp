import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Bell, Mail, UserPlus, Users, Camera, Dumbbell, Apple, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import ProfileFitnessTab from "@/components/profile/ProfileFitnessTab";
import ProfileNutritionTab from "@/components/profile/ProfileNutritionTab";
import NotificationPanel from "@/components/profile/NotificationPanel";
import InboxPanel from "@/components/profile/InboxPanel";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("fitness");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.filter({ status: "completed" }, "-date", 50),
  });

  const { data: meals = [] } = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => base44.entities.NutritionEntry.list("-date", 200),
  });

  // Notifications count (today's unlogged meals + no workout today)
  const today = format(new Date(), "yyyy-MM-dd");
  const todayMeals = meals.filter((m) => m.date === today);
  const todayWorkout = workouts.find((w) => w.date === today);
  const notifCount = (todayMeals.length === 0 ? 1 : 0) + (!todayWorkout ? 1 : 0);

  const firstName = user?.full_name?.split(" ")[0] || "User";

  return (
    <div className="space-y-0 -mt-2">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={() => setShowNotifications(true)}
          className="relative p-2.5 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 transition-colors"
        >
          <Bell className="w-5 h-5 text-white/70" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </button>
        <span className="text-sm font-semibold text-white">Profile</span>
        <button
          onClick={() => setShowInbox(true)}
          className="p-2.5 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 transition-colors"
        >
          <Mail className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* ── Profile Hero ── */}
      <div className="flex flex-col items-center gap-3 pb-5">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-green-500/30">
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white/15 border border-white/20 hover:bg-white/25 transition-colors">
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{user?.full_name || "Your Name"}</h2>
          <p className="text-sm text-white/50">{user?.email || ""}</p>
          <p className="text-xs text-green-400 mt-1 font-medium">🌿 VitalFlow Member</p>
        </div>

        {/* Followers / Following */}
        <div className="flex items-center gap-8 mt-1">
          {[
            { label: "Workouts", value: workouts.length },
            { label: "Followers", value: 0 },
            { label: "Following", value: 0 },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-1">
          <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
            Edit Profile
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold transition-colors">
            <UserPlus className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold transition-colors">
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 mb-4">
        {[
          { id: "fitness", label: "Fitness", icon: Dumbbell, color: "text-blue-400" },
          { id: "nutrition", label: "Nutrition", icon: Apple, color: "text-green-400" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? tab.id === "fitness"
                  ? "bg-blue-500/20 text-blue-400 shadow"
                  : "bg-green-500/20 text-green-400 shadow"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "fitness" ? (
        <ProfileFitnessTab workouts={workouts} />
      ) : (
        <ProfileNutritionTab meals={meals} />
      )}

      {/* ── Panels ── */}
      {showNotifications && (
        <NotificationPanel
          todayMeals={todayMeals}
          todayWorkout={todayWorkout}
          onClose={() => setShowNotifications(false)}
        />
      )}
      {showInbox && (
        <InboxPanel onClose={() => setShowInbox(false)} />
      )}
    </div>
  );
}