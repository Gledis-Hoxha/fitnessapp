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

const GOAL_LABELS = {
  lose_weight: "Lose Weight 🔥",
  build_muscle: "Build Muscle 💪",
  improve_endurance: "Endurance 🏃",
  stay_healthy: "Stay Healthy ❤️",
  increase_flexibility: "Flexibility 🧘",
  sport_performance: "Sport 🏆",
  stress_relief: "Stress Relief 😌",
  body_recomposition: "Recomposition ⚡",
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
    queryFn: () => base44.entities.Workout.filter({ status: "completed" }, "-date", 50),
  });

  const { data: meals = [] } = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => base44.entities.NutritionEntry.list("-date", 200),
  });

  const handleProfileSaved = async () => {
    const updated = await base44.auth.me();
    setUser(updated);
    setShowEdit(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {user?.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.full_name || "Your Profile"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setShowInbox(true)}
              className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <Inbox className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Goals */}
        {user?.fitness_goals?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {user.fitness_goals.map((g) => (
              <span key={g} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                {GOAL_LABELS[g] || g.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary">
        {[
          { id: "fitness", label: "Fitness", icon: Dumbbell },
          { id: "nutrition", label: "Nutrition", icon: Apple },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "fitness" && <ProfileFitnessTab workouts={workouts} user={user} />}
      {tab === "nutrition" && <ProfileNutritionTab meals={meals} user={user} />}

      <AnimatePresence>
        {showEdit && (
          <EditProfileModal
            user={user}
            onClose={() => setShowEdit(false)}
            onSave={handleProfileSaved}
          />
        )}
        {showShare && <ShareProfileModal user={user} workouts={workouts} onClose={() => setShowShare(false)} />}
        {showInbox && <InboxPanel onClose={() => setShowInbox(false)} />}
      </AnimatePresence>
    </div>
  );
}