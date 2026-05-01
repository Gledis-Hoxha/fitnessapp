import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function Explore() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold">Explore</h1>
          <p className="text-sm text-muted-foreground">Discover exercises & fitness tips</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-10 text-center">
        <Compass className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-foreground">Coming soon</p>
        <p className="text-sm text-muted-foreground mt-1">Exercise library & tips will be here.</p>
      </div>
    </div>
  );
}