import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Bot, Sparkles } from "lucide-react";
import CoachMessageBubble from "@/components/coach/CoachMessageBubble";
import CoachSuggestions from "@/components/coach/CoachSuggestions";

export default function Coach() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.agents.createConversation({ agent_name: "vitalflow_coach" }).
    then((conv) => {
      setConversation(conv);
      setMessages(conv.messages || []);
    }).
    catch(() => {});
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
    <div className="flex flex-col" style={{ height: "calc(100vh - 10rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/8 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">AI Fitness Coach</h1>
          <p className="text-xs text-white/35">Personalized fitness & nutrition guidance</p>
        </div>
        <div className="ml-auto">
          


          
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4">
        {messages.length === 0 && !loading &&
        <div className="pt-6 text-center space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Your AI Fitness Coach</p>
              <p className="text-sm text-white/40 mt-1 max-w-xs mx-auto">
                Ask me about workouts, nutrition, meal plans, or anything fitness-related!
              </p>
            </div>
            <CoachSuggestions onSelect={(t) => sendMessage(t)} />
          </div>
        }

        {messages.map((msg, i) =>
        <CoachMessageBubble key={i} message={msg} />
        )}

        {loading &&
        <div className="flex gap-3 justify-start">
            <div className="border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: "hsl(248,20%,15%)" }}>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) =>
              <div
                key={i}
                className="w-2 h-2 bg-white/20 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />

              )}
              </div>
            </div>
          </div>
        }

        {messages.length > 2 && !loading &&
        <div className="pt-2">
            <CoachSuggestions onSelect={(t) => sendMessage(t)} compact />
          </div>
        }

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-white/8">
        <div className="flex gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach anything..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none px-2" />
          
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-lg bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition-colors">
            
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>);

}