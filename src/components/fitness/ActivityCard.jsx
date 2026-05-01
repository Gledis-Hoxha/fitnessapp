import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Flame, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const activityIcons = {
  running: "🏃",
  walking: "🚶",
  cycling: "🚴",
  swimming: "🏊",
  weight_training: "🏋️",
  yoga: "🧘",
  hiit: "⚡",
  stretching: "🤸",
  other: "💪",
};

const intensityColors = {
  low: "bg-green-100 text-green-700",
  moderate: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export default function ActivityCard({ activity, onDelete }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow group">
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-0.5">{activityIcons[activity.activity_type] || "💪"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm capitalize">{activity.activity_type?.replace(/_/g, " ")}</h4>
            <Badge className={cn("text-xs", intensityColors[activity.intensity])}>
              {activity.intensity}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {activity.date ? format(new Date(activity.date), "MMM d, yyyy") : ""}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {activity.duration_minutes > 0 && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.duration_minutes} min</span>
            )}
            {activity.calories_burned > 0 && (
              <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{activity.calories_burned} cal</span>
            )}
            {activity.distance_km > 0 && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{activity.distance_km} km</span>
            )}
          </div>
          {activity.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{activity.notes}"</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(activity.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}