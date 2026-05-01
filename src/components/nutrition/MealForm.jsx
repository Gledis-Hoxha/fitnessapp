import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { format } from "date-fns";

export default function MealForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState(initialData || {
    meal_type: "",
    food_name: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
    serving_size: "",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      calories: Number(form.calories) || 0,
      protein_g: Number(form.protein_g) || 0,
      carbs_g: Number(form.carbs_g) || 0,
      fat_g: Number(form.fat_g) || 0,
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Log Meal</h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Meal Type</Label>
            <Select value={form.meal_type} onValueChange={(v) => setForm({ ...form, meal_type: v })}>
              <SelectTrigger><SelectValue placeholder="Select meal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Food Name</Label>
            <Input placeholder="e.g. Grilled Chicken Salad" value={form.food_name} onChange={(e) => setForm({ ...form, food_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Calories</Label>
            <Input type="number" placeholder="350" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Serving Size</Label>
            <Input placeholder="1 cup" value={form.serving_size} onChange={(e) => setForm({ ...form, serving_size: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Protein (g)</Label>
            <Input type="number" placeholder="25" value={form.protein_g} onChange={(e) => setForm({ ...form, protein_g: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Carbs (g)</Label>
            <Input type="number" placeholder="40" value={form.carbs_g} onChange={(e) => setForm({ ...form, carbs_g: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Fat (g)</Label>
            <Input type="number" placeholder="15" value={form.fat_g} onChange={(e) => setForm({ ...form, fat_g: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea placeholder="Any details..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="h-20" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Meal</Button>
        </div>
      </form>
    </div>
  );
}