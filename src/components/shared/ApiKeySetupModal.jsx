import { useState } from "react";
import { motion } from "framer-motion";
import { X, Key, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setUsdaApiKey } from "@/lib/usdaApi";

export default function ApiKeySetupModal({ type, onClose, onSaved }) {
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);

  const config = {
    title: "USDA Food Database Key",
    description: "Get your free USDA API key to search 300,000+ food items with full nutritional data.",
    link: "https://fdc.nal.usda.gov/api-key-signup.html",
    linkLabel: "Get free USDA API key →",
    placeholder: "Paste your USDA FDC API key here",
  };

  const handleSave = () => {
    if (!key.trim()) return;
    setSaving(true);
    setUsdaApiKey(key.trim());
    setSaving(false);
    onSaved?.();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Key className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-bold text-white">{config.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <p className="text-sm text-white/50">{config.description}</p>

        <a
          href={config.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-primary text-sm hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {config.linkLabel}
        </a>

        <Input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={config.placeholder}
          className="bg-white/8 border-white/15 text-white placeholder:text-white/30 h-11"
          autoFocus
        />

        <Button
          onClick={handleSave}
          disabled={!key.trim() || saving}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold"
        >
          {saving ? "Saving..." : "Save & Continue"}
        </Button>
      </motion.div>
    </motion.div>
  );
}