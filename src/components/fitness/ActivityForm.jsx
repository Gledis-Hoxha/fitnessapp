import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { format } from "date-fns";

const activityTypes = [
  { value: "running", label: "Running" },
  { value: "walking", label: "Walking" },
  { value: "cycling", label: "Cycling" },
  { value: "swimming", label: "Swimming" },
  { value: "weight_training", label: "Weight Training" },
  { value: "yoga", label: "Yoga" },
  { value: "hiit", label: "HIIT" },
  { value: "stretching", label: "Stretching" },
  { value: "other", label: "Other" },
];

export default function ActivityForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState(initialData || {
    activity_type: "",
    duration_minutes: "",
    calories_burned: "",
    distance_km: "",
    intensity: "moderate",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      duration_minutes: Number(form.duration_minutes) || 0,
      calories_burned: Number(form.calories_burned) || 0,
      distance_km: Number(form.distance_km) || 0,
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Log Activity</h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Activity Type</Label>
            <Select value={form.activity_type} onValueChange={(v) => setForm({ ...form, activity_type: v })}>
              <SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger>
              <SelectContent>
                {activityTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Duration (min)</Label>
            <Input type="number" placeholder="30" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Calories Burned</Label>
            <Input type="number" placeholder="250" value={form.calories_burned} onChange={(e) => setForm({ ...form, calories_burned: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Distance (km)</Label>
            <Input type="number" step="0.1" placeholder="5.0" value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Intensity</Label>
            <Select value={form.intensity} onValueChange={(v) => setForm({ ...form, intensity: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea placeholder="How did it feel?" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="h-20" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Activity</Button>
        </div>
      </form>
    </div>
  );
}