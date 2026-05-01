import { cn } from "@/lib/utils";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    chart3: "bg-blue-50 text-blue-600",
    chart4: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn("p-3 rounded-xl", colorMap[color] || colorMap.primary)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}