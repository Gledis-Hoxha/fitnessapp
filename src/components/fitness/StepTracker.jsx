import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Footprints, Flame, MapPin, Clock, RefreshCw, CheckCircle, AlertCircle, Lock, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, addDays, isToday, isAfter, startOfDay } from "date-fns";
import StepActivityRings from "@/components/fitness/StepActivityRings";
import StepHistoryStrip from "@/components/fitness/StepHistoryStrip";
import StepCalendarModal from "@/components/fitness/StepCalendarModal";
import { DAILY_STEP_GOAL, STEP_LENGTH_M, CALORIES_PER_STEP, getStepsForDate } from "@/components/fitness/stepData";

function StatTile({ icon: Icon, value, unit, iconBg }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-base font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs text-white/35 -mt-1.5">{unit}</p>
    </div>);

}

export default function StepTracker() {
  const navigate = useNavigate();
  // Once a user has enabled tracking, remember it so we never prompt again
  const [status, setStatus] = useState(() =>
    localStorage.getItem("stepTrackingEnabled") === "true" ? "granted" : "idle"
  ); // idle | requesting | granted | denied | unsupported
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showCalendar, setShowCalendar] = useState(false);

  const stepCountRef = useRef(0);
  const lastAccelRef = useRef(null);
  const listenerRef = useRef(null);

  const viewingToday = selectedDate === format(new Date(), "yyyy-MM-dd");
  // Live steps for today, deterministic sample data for prior days
  const displaySteps = viewingToday ? steps : getStepsForDate(new Date(selectedDate));
  const calories = Math.round(displaySteps * CALORIES_PER_STEP);
  const distanceKm = (displaySteps * STEP_LENGTH_M / 1000).toFixed(2);
  const progress = Math.min(100, Math.round(displaySteps / DAILY_STEP_GOAL * 100));

  const changeDate = (offset) => {
    const next = addDays(new Date(selectedDate), offset);
    if (isAfter(startOfDay(next), startOfDay(new Date()))) return;
    setSelectedDate(format(next, "yyyy-MM-dd"));
  };

  // Try to read from Health Connect / Apple Health via the Capacitor Health plugin if available
  const tryNativeHealth = async () => {
    // Capacitor Health plugin bridge (works if app is wrapped with Capacitor)
    if (window.Capacitor?.isNativePlatform?.() && window.Capacitor?.Plugins?.Health) {
      try {
        const Health = window.Capacitor.Plugins.Health;
        await Health.requestAuthorization({ read: ["steps", "calories", "distance"], write: [] });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = await Health.queryAggregated({
          startDate: today.toISOString(),
          endDate: new Date().toISOString(),
          dataType: "steps",
          bucket: "day"
        });
        const totalSteps = result?.data?.[0]?.value || 0;
        setSteps(Math.round(totalSteps));
        setStatus("granted");
        localStorage.setItem("stepTrackingEnabled", "true");
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  // Pedometer using DeviceMotion API (web fallback — works in browser on mobile)
  const startMotionTracking = async () => {
    // No motion sensor (e.g. desktop browser): stay in the granted view, just
    // don't start live counting.
    if (!window.DeviceMotionEvent) {
      return;
    }

    // iOS 13+ requires permission
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm !== "granted") {
          setStatus("denied");
          setError("Motion permission was denied. Please allow it in your device settings.");
          return;
        }
      } catch {
        setStatus("denied");
        setError("Could not request motion permission.");
        return;
      }
    }

    setStatus("granted");
    setIsTracking(true);
    localStorage.setItem("stepTrackingEnabled", "true");

    // Simple step detection via accelerometer magnitude peaks
    const THRESHOLD = 1.2;
    const MIN_INTERVAL_MS = 300;
    let lastStepTime = 0;

    const onMotion = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      const now = Date.now();

      if (lastAccelRef.current !== null) {
        const delta = Math.abs(magnitude - lastAccelRef.current);
        if (delta > THRESHOLD && now - lastStepTime > MIN_INTERVAL_MS) {
          lastStepTime = now;
          stepCountRef.current += 1;
          setSteps(stepCountRef.current);
        }
      }
      lastAccelRef.current = magnitude;
    };

    window.addEventListener("devicemotion", onMotion);
    listenerRef.current = onMotion;
  };

  const stopTracking = () => {
    if (listenerRef.current) {
      window.removeEventListener("devicemotion", listenerRef.current);
      listenerRef.current = null;
    }
    setIsTracking(false);
  };

  const handleRequestPermission = async () => {
    setError(null);
    // Persist consent immediately so we never prompt this user again, even on
    // desktop browsers without a motion sensor.
    localStorage.setItem("stepTrackingEnabled", "true");
    setStatus("granted");

    const nativeOk = await tryNativeHealth();
    if (!nativeOk) {
      await startMotionTracking();
    }
  };

  const handleReset = () => {
    stepCountRef.current = 0;
    setSteps(0);
  };

  useEffect(() => {
    // Returning users already enabled tracking — resume automatically without prompting
    if (localStorage.getItem("stepTrackingEnabled") === "true") {
      tryNativeHealth().then((nativeOk) => {
        if (!nativeOk) startMotionTracking();
      });
    }
    return () => stopTracking();
  }, []);

  return (
    <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-green-500/15">
            <Footprints className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Step Tracker</p>
            <p className="text-[10px] text-white/30">{viewingToday ? "Today's activity" : format(new Date(selectedDate), "EEE, MMM d")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "granted" &&
          <button
            onClick={() => setShowCalendar(true)}
            className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/60 transition-colors"
            title="View calendar">
            
              <CalendarDays className="w-3.5 h-3.5" />
            </button>
          }
          {status === "granted" && viewingToday &&
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/60 transition-colors"
            title="Reset steps">
            
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          }
          {isTracking && viewingToday &&
          <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          }
        </div>
      </div>

      {/* Permission States */}
      {status === "idle" &&
      <div className="flex flex-col items-center gap-3 py-4">
          <div className="p-4 rounded-full bg-white/5 border border-white/10">
            <Lock className="w-6 h-6 text-white/40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Enable Step Tracking</p>
            

          
          </div>
          <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleRequestPermission}
          className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors">
          
            Allow Access
          </motion.button>
        </div>
      }

      {status === "requesting" &&
      <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-green-400 rounded-full animate-spin" />
          <p className="text-xs text-white/40">Requesting permission…</p>
        </div>
      }

      {status === "denied" &&
      <div className="flex flex-col items-center gap-3 py-4">
          <div className="p-3 rounded-full bg-red-500/10">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-xs text-white/50 text-center max-w-xs">{error}</p>
          <button
          onClick={handleRequestPermission}
          className="px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 text-white text-xs font-semibold border border-white/10 transition-colors">
          
            Try Again
          </button>
        </div>
      }

      {status === "unsupported" &&
      <div className="flex flex-col items-center gap-3 py-4">
          <div className="p-3 rounded-full bg-yellow-500/10">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-xs text-white/50 text-center max-w-xs">{error}</p>
        </div>
      }

      {status === "granted" &&
      <>
          {/* Date navigator */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-white">
              {viewingToday ? "Today" : format(new Date(selectedDate), "EEEE, MMM d")}
            </span>
            <button
              onClick={() => changeDate(1)}
              disabled={viewingToday}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Activity rings */}
          <div className="py-2">
            <StepActivityRings
              stepsProgress={progress}
              distanceProgress={Math.min(100, Math.round((distanceKm / (DAILY_STEP_GOAL * STEP_LENGTH_M / 1000)) * 100))}
              caloriesProgress={Math.min(100, Math.round((calories / (DAILY_STEP_GOAL * CALORIES_PER_STEP)) * 100))} />
          </div>

          {/* Big step count */}
          <div className="text-center">
            <p className="text-4xl font-black text-white tabular-nums">{displaySteps.toLocaleString()}</p>
            <p className="text-sm text-white/30 mt-1 font-medium">total steps</p>
            {progress >= 100 &&
          <div className="flex items-center gap-1 justify-center text-green-400 mt-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Goal reached! 🎉</span>
              </div>
          }
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <StatTile icon={Flame} value={calories} unit="kcal" iconBg="bg-orange-500" />
            <StatTile icon={MapPin} value={distanceKm} unit="kilometer" iconBg="bg-zinc-500" />
            <StatTile icon={Clock} value={Math.round(displaySteps / 100)} unit="minute" iconBg="bg-blue-500" />
          </div>

          {/* Track / Stop button (for motion sensor mode) — only for today */}
          {viewingToday && (!isTracking ?
        <button
          onClick={startMotionTracking}
          className="w-full py-2.5 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-semibold hover:bg-green-600/30 transition-colors">
          
              Resume Tracking
            </button> :

        <button
          onClick={stopTracking}
          className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-semibold hover:bg-white/8 transition-colors">
          
              Pause Tracking
            </button>)
        }

          {/* 7-day history */}
          <StepHistoryStrip todaySteps={steps} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </>
      }

      <AnimatePresence>
        {showCalendar &&
        <StepCalendarModal
          selectedDate={selectedDate}
          todaySteps={steps}
          onSelectDate={setSelectedDate}
          onClose={() => setShowCalendar(false)} />
        }
      </AnimatePresence>

      {/* Daily Review */}
      




      
    </div>);

}