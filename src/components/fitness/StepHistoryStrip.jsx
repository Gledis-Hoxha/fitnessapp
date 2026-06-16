import { format, subDays } from "date-fns";
import { getStepsForDate, DAILY_STEP_GOAL } from "@/components/fitness/stepData";

export default function StepHistoryStrip({ todaySteps = 0, selectedDate, onSelectDate }) {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Last 7 days: 6 prior sample days + today (live)
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const isToday = dateStr === todayStr;
    return {
      date,
      dateStr,
      isToday,
      steps: isToday ? todaySteps : getStepsForDate(date)
    };
  });

  const maxSteps = Math.max(DAILY_STEP_GOAL, ...days.map((d) => d.steps));

  return null;






































}