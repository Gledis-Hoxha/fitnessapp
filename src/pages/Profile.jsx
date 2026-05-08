import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Bell, Mail, Camera, Dumbbell, Apple, Pencil, Share2, Flame, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import ProfileFitnessTab from "@/components/profile/ProfileFitnessTab";
import ProfileNutritionTab from "@/components/profile/ProfileNutritionTab";
import NotificationPanel from "@/components/profile/NotificationPanel";
import InboxPanel from "@/components/profile/InboxPanel";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ShareProfileModal from "@/components/profile/ShareProfileModal";
import { toast } from "sonner";

const today = format(new Date(), "yyyy-MM-dd");

function MiniStatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#111] border border-white/8 rounded-xl p-3 flex flex-col gap-1.5">
      <div className={`p-1.5 rounded-lg w-fit ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <p className="text-base font-bold text-white leading-none">{value}</p>
      <p className="text-[10px] text-white/35 font-medium">{label}</p>
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("fitness");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const refreshUser = () => base44.auth.me().then(setUser).catch(() => {});
  useEffect(() => { refreshUser(); }, []);

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.filter({ status: "completed" }, "-date", 50),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["fitness-home"],
    queryFn: () => base44.entities.FitnessActivity.list("-created_date", 50),
  });

  const { data: meals = [] } = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => base44.entities.NutritionEntry.list("-date", 200),
  });

  const todayMeals = meals.filter((m) => m.date === today);
  const todayActivities = activities.filter((a) => a.date === today);
  const todayWorkout = workouts.find((w) => w.date === today);

  const todayCalBurned = todayActivities.reduce((s, a) => s + (a.calories_burned || 0), 0);
  const todayMinutes = todayActivities.reduce((s, a) => s + (a.duration_minutes || 0), 0);
  const todayCalEaten = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const todayProtein = todayMeals.reduce((s, m) => s + (m.protein_g || 0), 0);

  const notifCount = (todayMeals.length === 0 ? 1 : 0) + (!todayWorkout ? 1 : 0);
  const firstName = user?.username || user?.full_name?.split(" ")[0] || "User";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAvatarUrl(file_url);
    setUploadingAvatar(false);
    toast.success("Profile photo updated!");
    e.target.value = "";
  };

  return (
    <div className="space-y-4 pb-4">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setShowNotifications(true)}
          className="relative p-2 rounded-xl bg-white/6 hover:bg-white/10 border border-white/8 transition-colors"
        >
          <Bell className="w-4.5 h-4.5 text-white/60" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </button>
        <span className="text-sm font-semibold text-white/70 tracking-wide">Profile</span>
        <button
          onClick={() => setShowInbox(true)}
          className="p-2 rounded-xl bg-white/6 hover:bg-white/10 border border-white/8 transition-colors"
        >
          <Mail className="w-4.5 h-4.5 text-white/60" />
        </button>
      </div>

      {/* ── Profile Hero ── */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-3xl font-bold text-white">
              {user?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#111] border border-white/15 hover:bg-white/10 transition-colors disabled:opacity-50">
            <Camera className="w-3 h-3 text-white/70" />
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold text-white">{user?.full_name || "Your Name"}</h2>
          <p className="text-xs text-white/35">{user?.email || ""}</p>
        </div>

        <div className="flex items-center gap-8">
          {[
            { label: "Workouts", value: workouts.length },
            { label: "Streak", value: `${[...new Set(meals.map(m=>m.date))].length}d` },
            { label: "Activities", value: activities.length },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-base font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/30 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600/90 hover:bg-green-600 text-white text-xs font-semibold transition-colors">
            <Pencil className="w-3 h-3" /> Edit Profile
          </button>
          <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 border border-white/8 text-white text-xs font-semibold transition-colors">
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
      </div>

      {/* ── Today's Overview ── */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Today's Overview</p>
          <p className="text-[10px] text-white/25">{format(new Date(), "EEE, MMM d")}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MiniStatCard icon={Clock} label="Active minutes" value={todayMinutes} color="bg-blue-500/15 text-blue-400" />
          <MiniStatCard icon={Flame} label="Calories burned" value={todayCalBurned} color="bg-orange-500/15 text-orange-400" />
          <MiniStatCard icon={Apple} label="Calories eaten" value={todayCalEaten} color="bg-green-500/15 text-green-400" />
          <MiniStatCard icon={TrendingUp} label="Protein today" value={`${todayProtein}g`} color="bg-purple-500/15 text-purple-400" />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white/4 border border-white/8 rounded-2xl p-1">
        {[
          { id: "fitness", label: "Fitness", icon: Dumbbell, color: "text-blue-400", bg: "bg-blue-500/15" },
          { id: "nutrition", label: "Nutrition", icon: Apple, color: "text-green-400", bg: "bg-green-500/15" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === tab.id ? `${tab.bg} ${tab.color}` : "text-white/30 hover:text-white/50"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "fitness" ? (
        <ProfileFitnessTab workouts={workouts} user={user} />
      ) : (
        <ProfileNutritionTab meals={meals} user={user} />
      )}

      {/* ── Panels ── */}
      {showNotifications && (
        <NotificationPanel todayMeals={todayMeals} todayWorkout={todayWorkout} onClose={() => setShowNotifications(false)} />
      )}
      {showInbox && <InboxPanel onClose={() => setShowInbox(false)} />}

      <AnimatePresence>
        {showEdit && <EditProfileModal user={user} onClose={() => setShowEdit(false)} onSaved={refreshUser} />}
        {showShare && <ShareProfileModal user={user} workoutCount={workouts.length} onClose={() => setShowShare(false)} />}
      </AnimatePresence>
    </div>
  );
}