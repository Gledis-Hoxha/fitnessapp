import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Sparkles } from "lucide-react";
import CoachMessageBubble from "@/components/coach/CoachMessageBubble";
import CoachSuggestions from "@/components/coach/CoachSuggestions";

export default function Coach() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Create a new conversation on mount
    base44.agents.createConversation({ agent_name: "vitalflow_coach" })
      .then((conv) => {
        setConversation(conv);
        setMessages(conv.messages || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setLoading(false);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || !conversation || loading) return;
    setInput("");
    setLoading(true);
    await base44.agents.addMessage(conversation, { role: "user", content: text });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">AI Coach</h1>
          <p className="text-xs text-white/40">Fitness & nutrition guidance</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && !loading && (
          <div className="pt-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-white font-semibold">Your AI Fitness Coach</p>
              <p className="text-sm text-white/40 mt-1">Ask me anything about fitness or nutrition</p>
            </div>
            <CoachSuggestions onSelect={(t) => sendMessage(t)} />
          </div>
        )}

        {messages.map((msg, i) => (
          <CoachMessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.length > 2 && !loading && (
          <div className="pt-2">
            <CoachSuggestions onSelect={(t) => sendMessage(t)} compact />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3 pb-1">
        <div className="flex gap-2 p-2 rounded-2xl border border-white/15" style={{ background: "hsl(248,20%,15%)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none px-2"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}