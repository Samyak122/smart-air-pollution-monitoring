"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Send,
  MessageCircle,
  X,
  Bot,
  User,
  Loader2,
  CloudSun,
  Umbrella,
  Shirt,
  Wind,
  Thermometer,
  Map,
  RotateCcw,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import type { WeatherAssistantMessage } from "@/lib/api/weather-types"

/* ─────────────────────────────────────────────────────────────── */
/* Types                                                          */
/* ─────────────────────────────────────────────────────────────── */
interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isError?: boolean
}

interface QuickChip {
  label: string
  icon: React.ReactNode
  text: string
}

/* ─────────────────────────────────────────────────────────────── */
/* Quick suggestion chips                                         */
/* ─────────────────────────────────────────────────────────────── */
const QUICK_CHIPS: QuickChip[] = [
  { label: "Umbrella?", icon: <Umbrella className="w-3 h-3" />, text: "Should I bring an umbrella today?" },
  { label: "What to wear", icon: <Shirt className="w-3 h-3" />, text: "What should I wear today?" },
  { label: "Wind & gusts", icon: <Wind className="w-3 h-3" />, text: "How strong is the wind today?" },
  { label: "Temperature", icon: <Thermometer className="w-3 h-3" />, text: "What is the temperature forecast?" },
  { label: "Best city", icon: <Map className="w-3 h-3" />, text: "Where is it better to go: London or Paris?" },
  { label: "Weekend plan", icon: <CloudSun className="w-3 h-3" />, text: "Will it rain this weekend?" },
]

/* ─────────────────────────────────────────────────────────────── */
/* Typing dots animation                                          */
/* ─────────────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────── */
/* Single message bubble                                          */
/* ─────────────────────────────────────────────────────────────── */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={`flex items-end gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-violet-500 to-purple-600"
            : "bg-gradient-to-br from-blue-500 to-cyan-400"
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md transition-all ${
          isUser
            ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-br-sm"
            : message.isError
            ? "bg-red-500/20 border border-red-500/30 text-red-200 rounded-bl-sm"
            : "bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-bl-sm"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-[10px] mt-1.5 ${isUser ? "text-white/60 text-right" : "text-white/40"}`}>
          {mounted
            ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "..."}
        </p>
      </div>
    </div>
  )
}


/* ─────────────────────────────────────────────────────────────── */
/* Main panel                                                     */
/* ─────────────────────────────────────────────────────────────── */
interface WeatherAssistantPanelProps {
  defaultLocation?: string
  onClose?: () => void
}

export function WeatherAssistantPanel({ defaultLocation, onClose }: WeatherAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    // Initialize welcome message on mount to avoid hydration mismatch on timestamp
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: defaultLocation
          ? `Hi! 👋 I'm your AI Weather Assistant powered by OpenWeatherMap.\n\nI'm set to **${defaultLocation}** as your location. Ask me anything — current conditions, forecasts, what to wear, or activity advice!`
          : `Hi! 👋 I'm your AI Weather Assistant powered by OpenWeatherMap.\n\nAsk me about weather anywhere in the world — current conditions, 7-day forecasts, what to wear, or whether to bring an umbrella!`,
        timestamp: new Date(),
      },
    ])
  }, [defaultLocation])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll helpers
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  const handleScroll = () => {
    const el = scrollContainerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    setShowScrollBtn(!atBottom)
  }

  // Build conversation history for the API call
  const buildHistory = (): WeatherAssistantMessage[] =>
    messages
      .filter((m) => m.id !== "welcome") // exclude the local welcome message
      .map((m) => ({ role: m.role, content: m.content }))

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const history = buildHistory()
      history.push({ role: "user", content: text.trim() })

      // Call our server-side API route to avoid CORS and protect keys
      const res = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, defaultLocation }),
      })
      
      const response = res.ok ? await res.json() : null

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          response?.answer ??
          "Sorry, I couldn't reach the weather service right now. Please check your API key or try again later.",
        timestamp: new Date(),
        isError: !response?.answer,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "An unexpected error occurred. Please try again.",
          timestamp: new Date(),
          isError: true,
        },
      ])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleReset = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: defaultLocation
          ? `Chat reset! I'm still focused on **${defaultLocation}**. What would you like to know?`
          : "Chat reset! Ask me anything about the weather.",
        timestamp: new Date(),
      },
    ])
    setInput("")
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden rounded-2xl border border-white/15 shadow-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 backdrop-blur-2xl">
      {/* ── Header ── */}
      <div className="relative flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-gradient-to-r from-blue-600/20 via-cyan-500/10 to-violet-600/20 flex-shrink-0">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-violet-500/5 pointer-events-none" />

        {/* Icon */}
        <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg flex-shrink-0">
          <CloudSun className="w-5 h-5 text-white" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-white truncate">AI Weather Assistant</h3>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
          </div>
          <p className="text-[10px] text-white/50 truncate">
            {defaultLocation ? `📍 ${defaultLocation}` : "Ask me about any location"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleReset}
            title="Clear conversation"
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="chat-messages flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBtn && (
        <div className="absolute bottom-32 right-6 z-10">
          <button
            onClick={() => scrollToBottom()}
            className="p-2 rounded-full bg-blue-600/80 text-white shadow-lg backdrop-blur-sm hover:bg-blue-500 transition-all"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Quick chips ── */}
      <div className="px-4 pb-2 pt-1 border-t border-white/5 flex-shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => sendMessage(chip.text)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
                bg-white/8 border border-white/15 text-white/70
                hover:bg-white/15 hover:text-white hover:border-white/30
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 flex-shrink-0"
            >
              <span className="text-blue-400">{chip.icon}</span>
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input ── */}
      <form
        onSubmit={handleSubmit}
        className="px-4 pb-4 pt-2 flex gap-2 flex-shrink-0"
      >
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            id="weather-assistant-input"
            type="text"
            placeholder="Ask about weather, what to wear, activities…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            className="w-full px-4 py-2.5 pr-3 rounded-xl text-sm
              bg-white/8 border border-white/15 text-white placeholder:text-white/30
              focus:outline-none focus:border-blue-500/60 focus:bg-white/12 focus:ring-0
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200"
          />
        </div>
        <button
          type="submit"
          id="weather-assistant-send"
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            bg-gradient-to-br from-blue-600 to-cyan-500
            hover:from-blue-500 hover:to-cyan-400
            disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed
            shadow-lg hover:shadow-blue-500/30
            transition-all duration-200 active:scale-95"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </button>
      </form>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────── */
/* Floating button + slide-up panel                              */
/* ─────────────────────────────────────────────────────────────── */
export function WeatherAssistantButton({ defaultLocation }: { defaultLocation?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating trigger */}
      <button
        id="weather-assistant-fab"
        onClick={() => setIsOpen((o) => !o)}
        title={isOpen ? "Close Weather Assistant" : "Open Weather Assistant"}
        className="relative w-14 h-14 rounded-full shadow-2xl
          bg-gradient-to-br from-blue-600 to-cyan-500
          hover:from-blue-500 hover:to-cyan-400
          flex items-center justify-center
          transition-all duration-300 hover:scale-110 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
        style={{ boxShadow: "0 0 24px rgba(59,130,246,0.5)" }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        {/* Pulse ring when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border-2 border-blue-400/40 animate-ping" />
        )}
        {/* Green online dot */}
        <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
      </button>

      {/* Slide-up chat panel */}
      <div
        className={`fixed bottom-24 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)]
          transition-all duration-300 ease-out
          ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}
        `}
        style={{ height: "540px" }}
      >
        <WeatherAssistantPanel
          defaultLocation={defaultLocation}
          onClose={() => setIsOpen(false)}
        />
      </div>

      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
