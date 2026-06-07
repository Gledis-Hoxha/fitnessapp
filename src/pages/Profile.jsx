import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Dumbbell, Apple, Pencil, Share2, Inbox } from "lucide-react";
import ProfileFitnessTab from "@/components/profile/ProfileFitnessTab";
import ProfileNutritionTab from "@/components/profile/ProfileNutritionTab";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ShareProfileModal from "@/components/profile/ShareProfileModal";
import InboxPanel from "@/components/profile/InboxPanel";
import ProfileAvatar from "@/components/profile/ProfileAvatar";

const GOAL_LABELS = {
  lose_weight: "Lose Weight 🔥",
  build_muscle: "Build Muscle 💪",
  improve_endurance: "Endurance 🏃",
  stay_healthy: "Stay Healthy ❤️",
  increase_flexibility: "Flexibility 🧘",
  sport_performance: "Sport 🏆",
  stress_relief: "Stress Relief 😌",
  body_recomposition: "Recomposition ⚡"
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("fitness");
  const [showEdit, setShowEdit] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.filter({ status: "completed" }, "-date", 50)
  });

  const { data: meals = [] } = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => base44.entities.NutritionEntry.list("-date", 200)
  });

  const handleProfileSaved = async () => {
    const updated = await base44.auth.me();
    setUser(updated);
    setShowEdit(false);
  };

  return (
    <div className="space-y-5">
      {/* Profile Header Card */}
      <div className="bg-[#111] border border-white/10 rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-4 min-w-0">
            <ProfileAvatar user={user} onUpdated={handleProfileSaved} />
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white break-words leading-tight">{user?.full_name || "Your Profile"}</h2>
              



              
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowInbox(true)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/40 hover:text-white">
              
              
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/40 hover:text-white">
              
              
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20">
              
              Edit
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
          { value: user?.height_cm ? `${user.height_cm}cm` : "—", label: "Height" },
          { value: user?.weight_kg ? `${user.weight_kg}kg` : "—", label: "Weight" },
          { value: user?.age ? `${user.age}yo` : "—", label: "Age" }].
          map((s) =>
          <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl py-4 text-center">
              <p className="text-xl font-bold text-blue-400">{s.value}</p>
              <p className="text-xs text-white/40 mt-1">{s.label}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8">
        {[
        { id: "fitness", label: "Fitness", icon: Dumbbell },
        { id: "nutrition", label: "Nutrition", icon: Apple }].
        map(({ id, label, icon: Icon }) =>
        <button
          key={id}
          onClick={() => setTab(id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
          tab === id ?
          "bg-white/10 text-white" :
          "text-white/40 hover:text-white"}`
          }>
          
            <Icon className="w-4 h-4" />
            {label}
          </button>
        )}
      </div>

      {tab === "fitness" && <ProfileFitnessTab workouts={workouts} user={user} />}
      {tab === "nutrition" && <ProfileNutritionTab meals={meals} user={user} />}

      <AnimatePresence>
        {showEdit &&
        <EditProfileModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={handleProfileSaved} />

        }
        {showShare && <ShareProfileModal user={user} workouts={workouts} onClose={() => setShowShare(false)} />}
        {showInbox && <InboxPanel onClose={() => setShowInbox(false)} />}
      </AnimatePresence>
    </div>);

}