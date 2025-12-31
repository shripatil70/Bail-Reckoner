"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bot, Send, ChevronLeft, Sparkles } from "lucide-react"

export default function AIAssistant() {
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your Bail Assistant. I can help you understand bail eligibility under the new BNS laws. How can I help you today?", sender: "bot" }
  ])
  
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // --- UPDATED LOGIC FOR REAL API ---
  const handleSend = async () => {
  if (!input.trim()) return;

  // Add User Message immediately
  const userMsg = { id: Date.now(), text: input, sender: "user" };
  setMessages(prev => [...prev, userMsg]);
  setInput("");
  setIsTyping(true);

  try {
    // Call YOUR internal Next.js API route
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await response.json();
    setMessages(prev => [...prev, { id: Date.now() + 1, text: data.text, sender: "bot" }]);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setIsTyping(false);
  }
};
  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden flex flex-col items-center p-4 md:p-12">
      
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[120px] opacity-20"
            animate={{ x: [0, 80, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15 + i * 2, repeat: Infinity, ease: "linear" }}
            style={{
              width: "400px", height: "400px",
              left: `${i * 15}%`, top: `${i * 10}%`,
              background: i % 2 === 0 ? "radial-gradient(circle, #10B981, transparent)" : "radial-gradient(circle, #3B82F6, transparent)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <Link href="/">
          <Button variant="outline" className="mb-6 border-white/10 text-slate-400 hover:text-white transition-all hover:bg-white/5">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[75vh]"
        >
          {/* Header */}
          <div className="bg-white/5 p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-emerald-500/20 p-3 rounded-2xl">
                  <Bot className="text-emerald-400 w-6 h-6" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  Bail Assistant <Sparkles className="w-4 h-4 text-emerald-400" />
                </h1>
                <p className="text-xs text-emerald-400/70 font-medium">Powered by AI Legal Logic</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-transparent to-black/20">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
                    msg.sender === "bot" 
                    ? "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none" 
                    : "bg-emerald-600 text-white rounded-tr-none"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-white/5 border-t border-white/10">
            <div className="relative flex items-center gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                type="text" 
                disabled={isTyping}
                placeholder={isTyping ? "AI is thinking..." : "Ask about Section 479 or bail eligibility..."} 
                className="flex-1 bg-slate-800/50 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
              />
              <Button 
                onClick={handleSend}
                disabled={isTyping}
                className="bg-emerald-600 hover:bg-emerald-500 rounded-xl p-3 h-11 w-11 transition-all active:scale-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}