import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function Routines() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold">Routines</h1>
          <p className="text-sm text-muted-foreground">Your saved workout routines</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-10 text-center">
        <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-foreground">No routines yet</p>
        <p className="text-sm text-muted-foreground mt-1">Routine builder coming soon.</p>
      </div>
    </div>
  );
}