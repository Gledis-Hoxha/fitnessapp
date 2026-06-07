import { Activity } from "lucide-react";

const MALE_IMG = "https://media.base44.com/images/public/69f4cab318774ed99e230d09/ef6b09f80_muscles-worked.webp";
const FEMALE_IMG = "https://media.base44.com/images/public/69f4cab318774ed99e230d09/6adb8d3ba_generated_image.png";

export default function MuscleMap({ workouts = [], user }) {
  const isFemale = (user?.gender || "").toLowerCase() === "female";
  const img = isFemale ? FEMALE_IMG : MALE_IMG;

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-blue-400" />
        <p className="text-sm font-semibold text-white">Muscles Worked</p>
      </div>

      <div className="rounded-xl overflow-hidden bg-[#1a2235]">
        <img src={img} alt="Muscles worked" className="w-full h-auto object-contain" />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
          <span>0</span>
          <span>≥10</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: "linear-gradient(to right, #fde8e8, #ef4444)" }} />
        <p className="text-[10px] text-white/40 mt-1">Set/week</p>
      </div>
    </div>
  );
}