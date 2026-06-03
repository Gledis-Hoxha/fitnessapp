import { useState, useEffect, useRef } from "react";
import { Heart, Bluetooth, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getBPMZone(bpm) {
  if (!bpm) return null;
  if (bpm < 60) return { label: "Resting", color: "text-blue-400", bg: "bg-blue-500/15", bar: "bg-blue-500" };
  if (bpm < 100) return { label: "Normal", color: "text-green-400", bg: "bg-green-500/15", bar: "bg-green-500" };
  if (bpm < 140) return { label: "Fat Burn", color: "text-yellow-400", bg: "bg-yellow-500/15", bar: "bg-yellow-500" };
  if (bpm < 170) return { label: "Cardio", color: "text-orange-400", bg: "bg-orange-500/15", bar: "bg-orange-500" };
  return { label: "Peak", color: "text-red-400", bg: "bg-red-500/15", bar: "bg-red-500" };
}

export default function HeartRateTracker() {
  const [bpm, setBpm] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | scanning | connected | error
  const [device, setDevice] = useState(null);
  const charRef = useRef(null);

  const zone = getBPMZone(bpm);

  const connectWatch = async () => {
    if (!navigator.bluetooth) {
      setStatus("error");
      return;
    }
    setStatus("scanning");
    try {
      const dev = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
        optionalServices: ["heart_rate"]
      });
      const server = await dev.gatt.connect();
      const service = await server.getPrimaryService("heart_rate");
      const char = await service.getCharacteristic("heart_rate_measurement");
      charRef.current = char;
      await char.startNotifications();
      char.addEventListener("characteristicvaluechanged", (e) => {
        const flags = e.target.value.getUint8(0);
        const hr = flags & 1 ? e.target.value.getUint16(1, true) : e.target.value.getUint8(1);
        setBpm(hr);
        setHistory((prev) => [...prev.slice(-19), hr]);
      });
      setDevice(dev.name || "Watch");
      setStatus("connected");
      dev.addEventListener("gattserverdisconnected", () => {
        setStatus("idle");
        setBpm(null);
        setDevice(null);
      });
    } catch {
      setStatus("error");
    }
  };

  const disconnect = () => {
    charRef.current?.stopNotifications().catch(() => {});
    setStatus("idle");
    setBpm(null);
    setDevice(null);
    setHistory([]);
  };

  const avgBpm = history.length ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : null;
  const maxBpm = history.length ? Math.max(...history) : null;

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={status === "connected" ? undefined : connectWatch}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        
        <div className={`p-2 rounded-xl ${status === "connected" ? "bg-red-500/20" : "bg-white/8"}`}>
          <Heart className={`w-4 h-4 text-[hsl(var(--background))] ${status === "connected" ? "text-red-400 animate-pulse" : ""}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Heart Rate</p>
          <p className="text-xs text-white/35">
            {status === "connected" ? device : status === "scanning" ? "Scanning…" : status === "error" ? "Not supported / denied" : "Apple Watch · Galaxy · Any BLE device"}
          </p>
        </div>
        {status === "connected" ?
        <div className="flex items-center gap-2">
            {bpm &&
          <span className={`text-xl font-bold ${zone?.color}`}>{bpm} <span className="text-xs font-normal text-white/30">bpm</span></span>
          }
            <button onClick={(e) => {e.stopPropagation();disconnect();}} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <RefreshCw className="w-3.5 h-3.5 text-white/40" />
            </button>
          </div> :

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/20">
            <Bluetooth className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400 font-medium">Connect</span>
          </div>
        }
      </button>

      <AnimatePresence>
        {status === "connected" &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-white/8 px-4 pb-4 pt-3">
          
            {/* Zone indicator */}
            {zone &&
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${zone.bg} mb-3`}>
                <span className={`text-xs font-semibold ${zone.color}`}>{zone.label} Zone</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                className={`h-full rounded-full ${zone.bar} transition-all`}
                style={{ width: `${Math.min(100, (bpm - 40) / (200 - 40) * 100)}%` }} />
              
                </div>
              </div>
          }

            {/* Live graph (mini sparkline) */}
            {history.length > 1 &&
          <div className="flex items-end gap-0.5 h-8 mb-3">
                {history.slice(-20).map((h, i) => {
              const mn = Math.min(...history);
              const mx = Math.max(...history) || 1;
              const pct = (h - mn) / (mx - mn + 1) * 100;
              return (
                <div key={i} className="flex-1 rounded-t" style={{ height: `${Math.max(10, pct)}%`, background: "hsl(var(--primary))", opacity: 0.5 + i / history.length * 0.5 }} />);

            })}
              </div>
          }

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
            { label: "Current", value: bpm ? `${bpm}` : "—", unit: "bpm" },
            { label: "Average", value: avgBpm ? `${avgBpm}` : "—", unit: "bpm" },
            { label: "Max", value: maxBpm ? `${maxBpm}` : "—", unit: "bpm" }].
            map((s) =>
            <div key={s.label} className="bg-white/5 rounded-xl px-2 py-2 text-center">
                  <p className="text-xs text-white/35">{s.label}</p>
                  <p className="text-base font-bold text-white mt-0.5">{s.value} <span className="text-[10px] text-white/30">{s.unit}</span></p>
                </div>
            )}
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}