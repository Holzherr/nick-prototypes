import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { supabase } from "@/shared/supabase/client";
import { useApp } from "@/app/AppContext";
import ReactMarkdown from "react-markdown";
import { getUnitPreference } from "@/features/profile/useUnitPreference";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ContextKey = "shopping_list" | "recipe_box" | "meal_plan" | "general";

const contextConfig: Record<ContextKey, { label: string; placeholder: string; color: string }> = {
  general: {
    label: "General",
    placeholder: "Ask me anything about cooking, recipes, or meal planning...",
    color: "bg-muted text-muted-foreground",
  },
  shopping_list: {
    label: "Shopping List",
    placeholder: "e.g. \"Add ingredients for a carbonara\"",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  recipe_box: {
    label: "Recipe Box",
    placeholder: "e.g. \"Save a quick pasta recipe\"",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
  meal_plan: {
    label: "Meal Plan",
    placeholder: "e.g. \"Add chicken salad for lunch tomorrow\"",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
};

const quickChips: Record<ContextKey, string[]> = {
  shopping_list: ["Add pasta ingredients", "I'm making tacos tonight"],
  recipe_box: ["Create a quick pasta recipe", "Find chicken recipes"],
  meal_plan: ["Plan my lunches this week", "Add oatmeal for breakfast tomorrow"],
  general: ["What can I make with chicken?", "Healthy dinner ideas"],
};

/** Inline AI prompt — renders a button that expands into a chat box in-place */
export default function InlineAIPrompt({ context }: { context: ContextKey }) {
  const [open, setOpen] = useState(false);
  const [activeContext, setActiveContext] = useState<ContextKey>(context);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { refreshAll, householdId } = useApp();

  const config = contextConfig[activeContext];

  // Close context menu on outside click
  useEffect(() => {
    if (!showContextMenu) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showContextMenu]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: {
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context: activeContext,
          household_id: householdId,
          unit_system: getUnitPreference(),
        },
      });

      if (error) throw error;

      if (data?.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${data.error}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (data.actions && data.actions.length > 0) {
          refreshAll();
        }
      }
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm border rounded-full px-3 py-1.5 hover:bg-secondary transition-colors active:scale-[0.97] text-muted-foreground hover:text-foreground"
        aria-label="Open AI assistant"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">AI</span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="w-full mt-4 mb-2 rounded-xl border bg-background shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-xs">AI Assistant</span>
          {/* Context switcher */}
          <div className="relative">
            <button
              onClick={() => setShowContextMenu(!showContextMenu)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 hover:opacity-80 transition-opacity ${config.color}`}
            >
              {config.label}
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
            {showContextMenu && (
              <div className="absolute top-full left-0 mt-1 bg-popover border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                {(Object.keys(contextConfig) as ContextKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setActiveContext(key); setShowContextMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors ${key === activeContext ? "font-semibold" : ""}`}
                  >
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${contextConfig[key].color.split(" ")[0]}`} />
                    {contextConfig[key].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-secondary transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages area — only shown when there are messages */}
      {(messages.length > 0 || loading) && (
        <div ref={scrollRef} className="max-h-[280px] overflow-y-auto px-3 py-2 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-xs dark:prose-invert max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0 [&>ul]:my-1 [&>ol]:my-1 text-xs">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick chips when empty */}
      {messages.length === 0 && !loading && (
        <div className="flex flex-wrap gap-1.5 px-3 py-2">
          {quickChips[activeContext].map((chip) => (
            <button
              key={chip}
              onClick={() => setInput(chip)}
              className="text-[10px] px-2 py-1 rounded-full border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2 border-t">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={config.placeholder}
            className="flex-1 bg-muted rounded-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
