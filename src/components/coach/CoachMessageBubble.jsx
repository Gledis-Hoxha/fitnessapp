import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function CoachMessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm"
            : "border border-white/10 text-white/90 rounded-tl-sm"}`}
          style={!isUser ? { background: "hsl(248,20%,15%)" } : undefined}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="text-white/80">{children}</li>,
                h1: ({ children }) => <h1 className="text-base font-bold text-white mt-3 mb-1">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-white mt-3 mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold text-blue-300 mt-2 mb-0.5">{children}</h3>,
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="px-1.5 py-0.5 rounded bg-white/10 text-blue-300 text-xs">{children}</code>
                  ) : (
                    <pre className="bg-black/40 rounded-xl p-3 overflow-x-auto my-2 text-xs text-white/70">
                      <code>{children}</code>
                    </pre>
                  ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="w-full text-xs border-collapse">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-2 py-1.5 bg-white/10 text-white font-semibold text-left border border-white/10">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-2 py-1.5 border border-white/5 text-white/70">{children}</td>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-blue-500/50 pl-3 my-2 text-white/60 italic">{children}</blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </motion.div>
  );
}