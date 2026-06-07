import { useMemo } from "react";
import { Activity } from "lucide-react";

const MALE_IMG = "https://media.base44.com/images/public/69f4cab318774ed99e230d09/4acf8abd0_generated_image.png";
const FEMALE_IMG = "https://media.base44.com/images/public/69f4cab318774ed99e230d09/7457b4f8e_generated_image.png";

const MUSCLE_KEYWORDS = {
  chest: ["chest", "pec", "bench", "push"],
  shoulders: ["shoulder", "delt", "overhead", "press"],
  biceps: ["bicep", "curl", "chin"],
  triceps: ["tricep", "dip", "skull"],
  back: ["back", "lat", "row", "pull", "deadlift"],
  abs: ["abs", "core", "plank", "crunch", "sit"],
  quads: ["quad", "squat", "leg press", "lunge", "extension"],
  hamstrings: ["hamstring", "leg curl", "rdl", "romanian"],
  glutes: ["glute", "hip thrust", "bridge"],
  calves: ["calf", "calves", "raise"],
};

function getTotalSets(workouts) {
  let total = 0;
  workouts.forEach((w) =>
    w.exercises?.forEach((ex) => {
      const name = (ex.exercise_name || "").toLowerCase();
      if (Object.values(MUSCLE_KEYWORDS).some((kws) => kws.some((k) => name.includes(k)))) {
        total += 1;
      }
    })
  );
  return total;
}

export default function MuscleMap({ workouts = [], user }) {
  const isFemale = (user?.gender || "").toLowerCase() === "female";
  const img = isFemale ? FEMALE_IMG : MALE_IMG;

  // Adapt intensity to logged training history.
  const trainedSets = useMemo(() => getTotalSets(workouts), [workouts]);
  // 0 sets -> dim & desaturated, 30+ sets -> full vivid blue.
  const ratio = Math.min(1, trainedSets / 30);
  const saturate = 0.3 + ratio * 0.9; // 0.3 .. 1.2
  const brightness = 0.55 + ratio * 0.45; // 0.55 .. 1.0
  const opacity = 0.55 + ratio * 0.45;

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-semibold text-white">Muscles Worked</p>
        </div>
        {trainedSets > 0 && (
          <span className="text-xs text-white/30">{trainedSets} sets logged</span>
        )}
      </div>

      <div className="rounded-xl overflow-hidden bg-[#1a2235]">
        <img
          src={img}
          alt="Muscles worked"
          className="w-full h-auto object-contain transition-all duration-700"
          style={{ filter: `saturate(${saturate}) brightness(${brightness})`, opacity }}
        />
      </div>
    </div>
  );
}