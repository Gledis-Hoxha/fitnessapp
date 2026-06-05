import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { User, Dumbbell, Apple, Pencil } from "lucide-react";
import ProfileFitnessTab from "@/components/profile/ProfileFitnessTab";
import ProfileNutritionTab from "@/components/profile/ProfileNutritionTab";
import EditProfileModal from "@/components/profile/EditProfileModal";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("fitness");
  const [showEdit, setShowEdit] = useState(false);

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
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="border border-white/10 rounded-3xl p-5" style={{ background: "hsl(248,20%,15%)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {user?.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.full_name || "Your Profile"}</h2>
              <p className="text-sm text-white/40">{user?.email || ""}</p>
              {user?.fitness_goals?.length > 0 && (
                <p className="text-xs text-primary mt-1">
                  {user.fitness_goals.length} goal{user.fitness_goals.length > 1 ? "s" : ""} set
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "hsl(248,20%,15%)" }}>
        {[
          { id: "fitness", label: "Fitness", icon: Dumbbell },
          { id: "nutrition", label: "Nutrition", icon: Apple },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === id
                ? "bg-primary text-primary-foreground shadow"
                : "text-white/40 hover:text-white/70"
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
      </AnimatePresence>
    </div>
  );
}