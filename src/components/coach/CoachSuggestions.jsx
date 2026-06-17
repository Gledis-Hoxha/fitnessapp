const SUGGESTIONS = [
{ emoji: "🧮", text: "Calculate my daily calorie needs" },
{ emoji: "💪", text: "Create a beginner workout plan" },
{ emoji: "🥗", text: "Suggest a high-protein meal plan" },
{ emoji: "🔥", text: "How do I lose fat and keep muscle?" },
{ emoji: "📈", text: "What's the best way to build muscle?" },
{ emoji: "🍳", text: "Give me 5 quick healthy breakfast ideas" }];


export default function CoachSuggestions({ onSelect, compact = false }) {
  const items = compact ? SUGGESTIONS.slice(0, 3) : SUGGESTIONS;

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "justify-center"}`}>
      {items.map((s) =>
      <button
        key={s.text}
        onClick={() => onSelect(s.text)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-blue-500/15 border border-white/10 hover:border-blue-500/30 text-xs text-white/60 hover:text-white transition-all"
        style={{ background: "hsl(248,20%,15%)" }}>
        
          
          <span>{s.text}</span>
        </button>
      )}
    </div>);

}