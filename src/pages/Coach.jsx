import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Sparkles, RotateCcw, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CoachMessageBubble from "@/components/coach/CoachMessageBubble";
import CoachSuggestions from "@/components/coach/CoachSuggestions";

const AGENT_NAME = "vitalflow_coach";

export default function Coach() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Boot: load or create conversation
  useEffect(() => {
    async function init() {
      try {
        const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        if (list && list.length > 0) {
          const latest = list[0];
          setActiveConversation(latest);
          setMessages(latest.messages || []);
          setConversations(list);
        } else {
          await startNewChat();
        }
      } catch {
        await startNewChat();
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, []);

  // Subscribe to streaming
  useEffect(() => {
    if (!activeConversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(activeConversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [activeConversation?.id]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startNewChat() {
    const conv = await base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: { name: `Chat ${new Date().toLocaleDateString()}` }
    });
    setActiveConversation(conv);
    setMessages(conv.messages || []);
    setConversations((prev) => [conv, ...prev]);
    return conv;
  }

  async function sendMessage(text) {
    const msg = (typeof text === "string" ? text : input).trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);
    try {
      let conv = activeConversation;
      if (!conv) conv = await startNewChat();
      await base44.agents.addMessage(conv, { role: "user", content: msg });
    } finally {
      setLoading(false);
    }
  }

  const isThinking = loading || messages.length > 0 && messages[messages.length - 1]?.role === "user";

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -mt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">VitalFlow Coach</h1>
            <p className="text-xs text-green-400 font-medium">AI Fitness & Nutrition Expert</p>
          </div>
        </div>
        <button
          onClick={async () => {await startNewChat();}}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-xs text-white/60 hover:text-white transition-all">
          
          <RotateCcw className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {initializing ?
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500/50 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-white/40">Loading Coach...</p>
            </div>
          </div> :
        messages.length === 0 ?
        <div className="flex flex-col items-center justify-center h-full gap-6 pb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-blue-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Hey! I'm your Coach 👋</h2>
              

            
            </div>
            <CoachSuggestions onSelect={sendMessage} />
          </div> :

        <>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) =>
            <CoachMessageBubble key={i} message={msg} />
            )}
            </AnimatePresence>
            {isThinking &&
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3">
            
                <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) =>
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />

                )}
                  </div>
                </div>
              </motion.div>
          }
          </>
        }
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-white/8">
        {messages.length > 0 && messages.length < 3 &&
        <CoachSuggestions onSelect={sendMessage} compact />
        }
        <div className="flex gap-2 mt-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {if (e.key === "Enter" && !e.shiftKey) {e.preventDefault();sendMessage(input);}}}
            placeholder="Ask about workouts, meals, or your goals..."
            className="flex-1 border border-white/15 rounded-2xl px-4 py-3 text-sm placeholder:text-white/30 outline-none focus:border-blue-500/50 transition-colors text-white bg-[hsl(var(--background))]" />
          
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-90 transition-all shadow-lg shadow-blue-500/25 active:scale-95">
            
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>);

}