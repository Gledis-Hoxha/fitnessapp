import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Dumbbell, Apple, Flame, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { format, startOfDay, isToday } from "date-fns";
import { motion } from "framer-motion";
import StatCard from "@/components/shared/StatCard";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");

  const { data: activities = [] } = useQuery({
    queryKey: ["fitness-home"],
    queryFn: () => base44.entities.FitnessActivity.list("-created_date", 50),
  });

  const { data: meals = [] } = useQuery({
    queryKey: ["nutrition-home"],
    queryFn: () => base44.entities.NutritionEntry.list("-created_date", 50),
  });

  const todayActivities = activities.filter((a) => a.date === today);
  const todayMeals = meals.filter((m) => m.date === today);

  const todayCalBurned = todayActivities.reduce((s, a) => s + (a.calories_burned || 0), 0);
  const todayMinutes = todayActivities.reduce((s, a) => s + (a.duration_minutes || 0), 0);
  const todayCalEaten = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const todayProtein = todayMeals.reduce((s, m) => s + (m.protein_g || 0), 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      {/* Hero Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary p-8 md:p-10 text-primary-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-primary-foreground/70 uppercase tracking-wider">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold mt-2">
              {greeting()}, {firstName}
            </h1>
            <p className="text-primary-foreground/80 mt-2 max-w-md text-sm md:text-base">
              Track your fitness and nutrition to stay on top of your wellness goals.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Today's Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold mb-4">Today's Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Minutes" value={todayMinutes} subtitle="minutes today" icon={Clock} color="primary" />
          <StatCard title="Calories Burned" value={todayCalBurned} subtitle="from workouts" icon={Flame} color="accent" />
          <StatCard title="Calories Eaten" value={todayCalEaten} subtitle="from meals" icon={Apple} color="chart3" />
          <StatCard title="Protein" value={`${todayProtein}g`} subtitle="total today" icon={TrendingUp} color="chart4" />
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Link
          to="/fitness"
          className="group bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Fitness Tracking</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {todayActivities.length} activities logged today
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          to="/nutrition"
          className="group bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Apple className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Nutrition Tracking</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {todayMeals.length} meals logged today
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          {activities.length === 0 && meals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No activity yet. Start tracking your fitness and nutrition!
            </div>
          ) : (
            [...activities.slice(0, 3).map((a) => ({
              type: "fitness",
              icon: "🏃",
              title: a.activity_type?.replace(/_/g, " "),
              detail: `${a.duration_minutes || 0} min · ${a.calories_burned || 0} cal burned`,
              date: a.date,
            })),
            ...meals.slice(0, 3).map((m) => ({
              type: "nutrition",
              icon: "🍽️",
              title: m.food_name,
              detail: `${m.calories || 0} cal · ${m.meal_type}`,
              date: m.date,
            }))]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 5)
              .map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="text-xl">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.date ? format(new Date(item.date), "MMM d") : ""}
                  </p>
                </div>
              ))
          )}
        </div>
      </motion.div>
    </div>
  );
}