import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Footprints, Flame, MapPin, Target, RefreshCw, CheckCircle, AlertCircle, Lock, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

const DAILY_STEP_GOAL = 10000;
const STEP_LENGTH_M = 0.762; // avg step length in meters
const CALORIES_PER_STEP = 0.04; // approx kcal per step

function StatBox({ icon: Icon, label, value, unit, color, progress }) {
  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl p-4 flex flex-col gap-2">
      <div className={`p-2 rounded-xl w-fit ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xl font-bold text-white leading-none">
          {value}
          {unit && <span className="text-sm font-medium text-white/40 ml-1">{unit}</span>}
        </p>
        <p className="text-xs text-white/35 mt-1">{label}</p>
      </div>
      {progress !== undefined &&
      <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
          className={`h-full rounded-full transition-all duration-700 ${color.replace("bg-", "bg-").replace("/15", "").replace("text-", "bg-")}`}
          style={{ width: `${Math.min(100, progress)}%` }} />
        
        </div>
      }
    </div>);

}

export default function StepTracker() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle"); // idle | requesting | granted | denied | unsupported
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);

  const stepCountRef = useRef(0);
  const lastAccelRef = useRef(null);
  const listenerRef = useRef(null);

  const calories = Math.round(steps * CALORIES_PER_STEP);
  const distanceKm = (steps * STEP_LENGTH_M / 1000).toFixed(2);
  const progress = Math.min(100, Math.round(steps / DAILY_STEP_GOAL * 100));

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
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  // Pedometer using DeviceMotion API (web fallback — works in browser on mobile)
  const startMotionTracking = async () => {
    if (!window.DeviceMotionEvent) {
      setStatus("unsupported");
      setError("Your device/browser does not support motion tracking.");
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
    setStatus("requesting");
    setError(null);

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
            <p className="text-[10px] text-white/30">Today's activity</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "granted" &&
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/60 transition-colors"
            title="Reset steps">
            
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          }
          {isTracking &&
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
          {/* Big step count */}
          <div className="text-center py-2">
            <p className="text-5xl font-black text-white tabular-nums">{steps.toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-1 font-medium">steps today</p>
          </div>

          {/* Goal progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/30 font-medium">Daily Goal</span>
              <span className="text-[10px] font-bold text-green-400">{progress}% · {DAILY_STEP_GOAL.toLocaleString()} steps</span>
            </div>
            <div className="w-full h-2.5 bg-white/8 rounded-full overflow-hidden">
              <motion.div
              className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }} />
            
            </div>
            {progress >= 100 &&
          <div className="flex items-center gap-1 justify-center text-green-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Goal reached! 🎉</span>
              </div>
          }
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-3 gap-2">
            <StatBox
            icon={Flame}
            label="Calories"
            value={calories}
            unit="kcal"
            color="bg-orange-500/15 text-orange-400" />
          
            <StatBox
            icon={MapPin}
            label="Distance"
            value={distanceKm}
            unit="km"
            color="bg-blue-500/15 text-blue-400" />
          
            <StatBox
            icon={Target}
            label="Goal"
            value={`${progress}%`}
            color="bg-purple-500/15 text-purple-400" />
          
          </div>

          {/* Track / Stop button (for motion sensor mode) */}
          {!isTracking ?
        <button
          onClick={startMotionTracking}
          className="w-full py-2.5 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-semibold hover:bg-green-600/30 transition-colors">
          
              Resume Tracking
            </button> :

        <button
          onClick={stopTracking}
          className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-semibold hover:bg-white/8 transition-colors">
          
              Pause Tracking
            </button>
        }
        </>
      }

      {/* Daily Review */}
      




      
    </div>);

}